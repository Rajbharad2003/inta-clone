
import ChatList from "@/components/ChatList";
import ChatMessage from "@/components/ChatMessage";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useSocket } from "@/contexts/SocketContext";
import { chatApi, profileApi } from "@/lib/api";
import { Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import socketService from "@/lib/socket";

interface Message {
  _id: string;
  sender: {
    _id: string;
    username: string;
  };
  content: string;
  chat: string;
  createdAt: string;
  pending?: boolean;
}

interface Chat {
  _id: string;
  users: Array<{
    _id: string;
    username: string;
    profile?: {
      profilephoto?: string;
    };
  }>;
  latestMessage?: {
    content: string;
    createdAt: string;
  };
}

interface TransformedChat {
  id: string;
  username: string;
  users: Array<{
    _id: string;    
  }>;
  image: string;
  lastMessage: string;
  time: string;
  active?: boolean;
}

interface SearchUser {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  profile?: {
    profilephoto?: string;
  };
}

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState<TransformedChat | null>(null);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<TransformedChat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [unreadChats, setUnreadChats] = useState<Set<string>>(new Set());
  const socket = useSocket();
  const socketCleanupRef = useRef<(() => void) | null>(null);

  const transformChatData = (chat: Chat): TransformedChat => {
    const otherUser = chat.users.find(u => u._id !== currentUser._id) || chat.users[0];
    const otherUsers = chat.users.find(u => u._id !== currentUser._id)._id || chat.users[0]._id;
    console.log("otherUsers : ", otherUsers);

    return {
      id: chat._id,
      username: otherUser.username,
      users: chat.users.map(user => ({ _id: user._id })).filter(u => u._id !== currentUser._id),
      image: otherUser.profile?.profilephoto || "/default-avatar.png",
      lastMessage: chat.latestMessage?.content || "No messages yet",
      time: chat.latestMessage?.createdAt 
        ? new Date(chat.latestMessage.createdAt).toLocaleString()
        : "Now",
      active: false
    };
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await chatApi.fetchChats();
      
      console.log("responce : ", response);
      const transformedChats = response.map(transformChatData);
      setChats(transformedChats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast({
        title: "Error",
        description: "Failed to load chats",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Memoize the message handler to maintain reference equality
  const handleNewMessage = useCallback((newMessage: any) => {
    console.log("Handling new message in Messages component:", newMessage);
    
    if (!newMessage || !newMessage.chat) {
      console.warn("Received invalid message format:", newMessage);
      return;
    }
    // Update messages if we're in the current chat
    if (newMessage.chat === selectedChat?.id) {
      setMessages(prev => {
        // Check if the message already exists to avoid duplicates
        const messageExists = prev.some(msg => 
          msg._id === newMessage._id || 
          (msg.pending && msg.content === newMessage.content && msg.sender._id === newMessage.sender._id)
        );
        
        if (messageExists) {
          // Update the pending status if needed
          return prev.map(msg => 
            (msg.pending && msg.content === newMessage.content && msg.sender._id === newMessage.sender._id)
              ? { ...newMessage, pending: false }
              : msg
          );
        }
        
        console.log("Adding new message to chat:", newMessage);
        return [...prev, newMessage];
      });
      
      // Scroll to bottom when new message arrives
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      // If not in the current chat, mark as unread
      setUnreadChats(prev => {
        const newSet = new Set(prev);
        newSet.add(newMessage.chat);
        return newSet;
      });
      
      // Show notification for new messages in other chats
      toast({
        title: "New Message",
        description: `${newMessage.sender.username}: ${newMessage.content}`,
      });
    }
    
    // Always update the chat list for any new message
    updateChatWithNewMessage(newMessage.chat, newMessage.content);
  }, [selectedChat, toast]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || !selectedChat) return;
    
    console.log("sending message");
    // Generate temporary message ID
    const tempId = Date.now().toString();
    
    // Create a temporary message object to show instantly
    const tempMessage: Message = {
      _id: tempId,
      sender: { _id: currentUser._id, username: currentUser.username },
      content,
      chat: selectedChat.id,
      createdAt: new Date().toISOString(),
      pending: true,
    };
  
    // ✅ Instantly show the message in the UI
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");
  
    try {
      // Send message via API
      const response = await chatApi.sendMessage({
        content,
        chatId: selectedChat.id,
      });
      console.log("response : ",response);
      // ✅ Send message via socket to update other clients
      socket.sendMessage(selectedChat.id, content, selectedChat, response);
      // socket.sendMessage(response, selectedChat);
  
      // ✅ Replace pending message with real message from the API
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempId ? { ...response, pending: false } : msg
        )
      );
      updateChatWithNewMessage(selectedChat.id, content);
  
    } catch (error) {
      console.error("Error sending message:", error);
      
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
  
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };
  
/*  
  const sendMessage = async (content: string) => {
    if (!content.trim() || !selectedChat) return;

    const tempId = Date.now().toString();
    const tempMessage: Message = {
      _id: tempId,
      sender: {
        _id: currentUser._id,
        username: currentUser.username
      },
      content,
      chat: selectedChat.id,
      createdAt: new Date().toISOString(),
      pending: true
    };

    try {
      // Add temporary message immediately
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage("");

      // Send message through API and socket
      const response = await chatApi.sendMessage({
        content,
        chatId: selectedChat.id,
      });
      
      // Send through socket
      console.log("Sending message via socket:", selectedChat.id, content);
      socket.sendMessage(selectedChat.id, content);

      // Update the message to remove pending state
      setMessages(prev => prev.map(msg => 
        msg._id === tempId ? { ...response, pending: false } : msg
      ));

      // Update chat list immediately
      updateChatWithNewMessage(selectedChat.id, content);

      // socket.sendMessage(selectedChat.id, content);

    } catch (error) {
      console.error("Error sending message:", error);
      // Remove failed message
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };
  */
  const updateChatWithNewMessage = useCallback((chatId: string, content: string) => {
    setChats(prev => {
      const updatedChats = [...prev];
      const chatIndex = updatedChats.findIndex(chat => chat.id === chatId);
      
      if (chatIndex !== -1) {
        const updatedChat = {
          ...updatedChats[chatIndex],
          lastMessage: content,
          time: new Date().toLocaleString()
        };
        
        // Move chat to top
        updatedChats.splice(chatIndex, 1);
        return [updatedChat, ...updatedChats];
      }
      
      return prev;
    });
  }, []);

  // Setup socket connection and listeners
  useEffect(() => {
    document.title = "Inbox • Chats • Instagram";
    
    if (currentUser._id) {
      // Connect to socket
      console.log("connecting to socket");
      // socketService.connect(currentUser._id);
      socket.connect(currentUser._id);
      
      // Fetch initial chats
      fetchChats();
      
      // Set up socket message listener
      // const cleanup = socket.onMessage(handleNewMessage);
      // socketCleanupRef.current = cleanup;
      
      // Setup chat update listener
      const chatUpdateCleanup = socket.onChatEvent("chatUpdated", (data) => {
        console.log("Chat updated:", data);
        fetchChats();
      });
      
      // Request notification permission
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
      
      // Cleanup function
      return () => {
        if (socketCleanupRef.current) {
          socketCleanupRef.current();
        }
        chatUpdateCleanup();
        socket.disconnect();
      };
    }
  }, [currentUser._id, socket, handleNewMessage]);
  /*
  // Handle chat selection
  useEffect(() => {
    if (selectedChat) {
      // Join the chat room
      socket.joinChat(selectedChat.id, currentUser._id);
      
      // Fetch messages for the selected chat
      const fetchMessages = async () => {
        try {
          const response = await chatApi.allMessages(selectedChat.id);
          setMessages(response);
          
          // Scroll to bottom when messages load
          setTimeout(() => {
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({ behavior: "auto" });
            }
          }, 100);
        } catch (error) {
          console.error("Error fetching messages:", error);
          toast({
            title: "Error",
            description: "Failed to load messages",
            variant: "destructive",
          });
        }
      };
      
      fetchMessages();
      
      // Remove from unread chats
      setUnreadChats(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedChat.id);
        return newSet;
      });

      // Cleanup: leave chat room when changing chats
      return () => {
        socket.leaveChat(selectedChat.id);
      };
    }
  }, [selectedChat, socket, toast]);*/

  useEffect(() => {
    if (!selectedChat) return;
  
    socket.joinChat(selectedChat.id, currentUser._id);
  
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await chatApi.allMessages(selectedChat.id);
        console.log(" fetchMessages :", response);
        setMessages(response);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
  
    fetchMessages();
  
    const handleIncomingMessage = (newMessage: any) => {
      console.log("messages 1 : ",messages);
      if (newMessage.chat === selectedChat.id) {
        console.log("in handleIncomingMessage");
        console.log("messages : ",messages);
        console.log("newMessage : ",newMessage);
        setMessages((prev) => [...prev, newMessage.newMessage]);
      }
    };
  
    // ✅ Listen for new messages
    const cleanup = socket.onMessage(handleIncomingMessage);
  
    return () => {
      cleanup(); // ✅ Remove listener when switching chats
      socket.leaveChat(selectedChat.id);
    };
  }, [selectedChat, socket, toast]);
 
  useEffect(() => {
    console.log("change in messages" , messages);
  }, [messages]);

  const handleChatSearch = (query: string) => {
    if (!query.trim()) return chats;
    return chats.filter(chat => 
      chat.username.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const response = await profileApi.searchUsers(query);
        setSearchResults(response.users.filter(
          (user: SearchUser) => user._id !== currentUser._id
        ));
      } catch (error) {
        console.error("Error searching users:", error);
        toast({
          title: "Search Failed",
          description: "Unable to search users at this time",
          variant: "destructive",
        });
      }
    } else {
      setSearchResults([]);
    }
  };

  const createNewChat = async (userId: string) => {
    try {
      console.log("creating new chat");
      
      const response = await chatApi.accessChat(userId);
      const newChat = transformChatData(response);
      setChats(prev => [newChat, ...prev]);
      setSelectedChat(newChat);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive",
      });
    }
  };

  const handleChatSelect = async (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setSelectedChat(chat);
      console.log("selected chat : ",chat);
      // console.log(currentUser._id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-t-2 border-instagram-primary border-solid rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto mt-16 h-[calc(100vh-4rem)]">
        <div className="bg-white border border-gray-200 h-full flex rounded-sm overflow-hidden">
          <div className="w-full sm:w-96 border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {searchQuery ? (
                <div className="divide-y divide-gray-100">
                  {chats
                    .filter(chat => 
                      chat.username.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(chat => (
                      <div
                        key={`chat-${chat.id}`}
                        className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer ${
                          selectedChat?.id === chat.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleChatSelect(chat.id)}
                      >
                        <div>
                          <p className="font-semibold">{chat.username}</p>
                          <p className="text-sm text-gray-500">Existing chat</p>
                        </div>
                      </div>
                    ))}

                  {searchResults.map(user => {
                    const existingChat = chats.find(chat => 
                      chat.username.toLowerCase() === user.username.toLowerCase()
                    );

                    return (
                      <div
                        key={`user-${user._id}`}
                        className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => 
                          existingChat 
                            ? handleChatSelect(existingChat.id)
                            : createNewChat(user._id)
                        }
                      >
                        <div>
                          <p className="font-semibold">{user.username}</p>
                          <p className="text-sm text-gray-500">
                            {user.firstName} {user.lastName}
                            {existingChat && " • Existing chat"}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {searchResults.length === 0 && searchQuery.trim() !== "" && 
                    chats.filter(chat => 
                      chat.username.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                      No users found
                    </div>
                  )}
                </div>
              ) : (
                <ChatList 
                  chats={chats}
                  onSelectChat={handleChatSelect} 
                  selectedChat={selectedChat?.id}
                  onSearchUser={handleSearch}
                  onCreateChat={createNewChat}
                  unreadChats={unreadChats}
                />
              )}
            </div>
          </div>
          
          {selectedChat ? (
            <div className="hidden sm:flex flex-col flex-1">
              <ChatMessage 
                username={selectedChat.username}
                userImage={selectedChat.image}
                isActive={selectedChat.active}
                lastSeen={selectedChat.time}
                messages={messages}
                onSendMessage={sendMessage}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                currentUserId={currentUser._id} 
                selectedChatId={selectedChat.id}              />
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="hidden sm:flex flex-col items-center justify-center flex-1 p-6">
              <div className="rounded-full border-2 border-gray-200 p-4 mb-6">
                <Send className="w-10 h-10 text-gray-300 rotate-45" />
              </div>
              <h3 className="text-xl font-light mb-2">Your Messages</h3>
              <p className="text-gray-500 text-sm text-center mb-6">
                Send private photos and messages to a friend or group.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
