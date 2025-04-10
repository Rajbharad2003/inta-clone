
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/components/ui/use-toast";
// import { ChevronLeft, Paperclip, Send } from "lucide-react";
// import { useEffect, useRef, useState } from "react";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { useSocket } from "@/contexts/SocketContext";

// interface Message {
//   _id: string;
//   sender: {
//     _id: string;
//     username: string;
//   };
//   content: string;
//   createdAt: string;
//   pending?: boolean;
// }

// interface ChatMessageProps {
//   username: string;
//   userImage: string;
//   isActive?: boolean;
//   lastSeen: string;
//   messages: Message[];
//   onSendMessage: (content: string) => Promise<void>;
//   newMessage: string;
//   setNewMessage: (message: string) => void;
//   currentUserId: string;
//   selectedChatId: string | null;
// }

// const ChatMessage: React.FC<ChatMessageProps> = ({
//   username,
//   userImage,
//   isActive = false,
//   lastSeen,
//   messages,
//   onSendMessage,
//   newMessage,
//   setNewMessage,
//   currentUserId,
//   selectedChatId,
// }) => {
//   const { toast } = useToast();
//   const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
//   const scrollAreaRef = useRef<HTMLDivElement>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const socket = useSocket();

//   // Automatically scroll to bottom when new messages arrive
//   useEffect(() => {
//     if (messagesEndRef.current && isScrolledToBottom) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages, isScrolledToBottom]);
  
//   // Initialize scroll to bottom
//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "auto" });
//       setIsScrolledToBottom(true);
//     }
//   }, []);

//   useEffect(() => {
//     socket.onMessage((message) => {
//       if (message.chat === selectedChatId) {
//         setMessages((prev) => [...prev, message]);
//       }
//     });
  
//     return () => socket.removeMessageHandler();
//   }, [selectedChatId]);
  
  
//   // Handle message input height
//   const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setNewMessage(e.target.value);
//     // Reset height to calculate actual height
//     e.target.style.height = 'auto';
//     // Set new height based on scrollHeight (with a max limit)
//     const newHeight = Math.min(e.target.scrollHeight, 100);
//     e.target.style.height = `${newHeight}px`;
//   };
  
//   const handleSendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!newMessage.trim()) return;

//     try {
//       await onSendMessage(newMessage.trim());
//       setNewMessage("");
//       // Reset the textarea height after sending
//       const textarea = document.querySelector('textarea');
//       if (textarea) {
//         textarea.style.height = 'auto';
//       }
      
//       // Ensure we scroll to bottom after sending
//       setTimeout(() => {
//         if (messagesEndRef.current) {
//           messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//           setIsScrolledToBottom(true);
//         }
//       }, 100);
//     } catch (error) {
//       console.error("Error sending message:", error);
//       toast({
//         title: "Error sending message",
//         description: "Your message could not be sent. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };
  
//   // Handle scroll events to detect if we're at the bottom
//   const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
//     if (scrollAreaRef.current) {
//       const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
//       // Consider "at bottom" if within 20px of the bottom
//       const atBottom = scrollHeight - scrollTop - clientHeight < 20;
//       setIsScrolledToBottom(atBottom);
//     }
//   };
  
//   return (
//     <div className="flex flex-col h-full bg-white relative">
//       {/* Chat Header */}
//       <div className="flex items-center justify-between p-3 border-b border-gray-100">
//         <div className="flex items-center">
//           <Button variant="ghost" size="icon" className="mr-1 rounded-full h-8 w-8">
//             <ChevronLeft className="h-4 w-4" />
//           </Button>
//           <div className="relative mr-3">
//             <Avatar className="h-9 w-9 border border-gray-100">
//               <AvatarImage 
//                 src={userImage} 
//                 alt={username}
//               />
//               <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
//             </Avatar>
//             {isActive && (
//               <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
//             )}
//           </div>
//           <div>
//             <h3 className="font-semibold text-sm">{username}</h3>
//             <p className="text-xs text-gray-500">
//               {isActive ? "Active now" : `Active ${lastSeen}`}
//             </p>
//           </div>
//         </div>
//       </div>
      
//       {/* Messages with ScrollArea */}
//       <ScrollArea 
//         className="flex-1 p-4 h-[calc(100%-120px)]"
//         onScrollCapture={handleScroll}
//         ref={scrollAreaRef}
//       >
//         <div className="space-y-4 pb-2">
//           {messages.map((message) => (
//             <div
//               key={message._id}
//               className={`mb-4 ${
//                 message.sender._id === currentUserId ? "flex justify-end" : "flex justify-start"
//               }`}
//             >
//               <div
//                 className={`
//                   max-w-[70%] rounded-lg p-3 relative
//                   ${message.sender._id === currentUserId
//                     ? "bg-blue-500 text-white"
//                     : "bg-gray-100"
//                   }
//                   ${message.pending ? "opacity-70" : ""}
//                 `}
//               >
//                 {message.content}
//                 {message.pending && (
//                   <div className="absolute -bottom-5 right-0 text-xs text-gray-500 flex items-center">
//                     <div className="loading-dots">
//                       <span className="dot">.</span>
//                       <span className="dot">.</span>
//                       <span className="dot">.</span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//           <div ref={messagesEndRef} />
//         </div>
//       </ScrollArea>
      
//       {/* Message Input - Even slimmer, more modern design */}
//       <div className="p-2 border-t border-gray-100 mt-auto">
//         <form onSubmit={handleSendMessage} className="flex items-center bg-gray-50 rounded-full pr-2">
//           <Button type="button" size="icon" variant="ghost" className="rounded-full h-8 w-8 flex-shrink-0 ml-1">
//             <Paperclip className="h-4 w-4 text-gray-400" />
//           </Button>
//           <Textarea
//             placeholder="Message..."
//             value={newMessage}
//             onChange={handleInput}
//             className="min-h-[36px] py-2 px-3 resize-none bg-transparent border-none focus-visible:ring-0 flex-grow text-sm"
//             style={{ height: 'auto', maxHeight: '100px', overflow: newMessage.length > 100 ? 'auto' : 'hidden' }}
//             onKeyDown={(e) => {
//               if (e.key === 'Enter' && !e.shiftKey) {
//                 e.preventDefault();
//                 handleSendMessage(e);
//               }
//             }}
//           />
//           <Button 
//             type="submit" 
//             size="icon" 
//             className={`rounded-full h-8 w-8 flex-shrink-0 ${!newMessage.trim() ? 'opacity-50 cursor-not-allowed bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'}`}
//             disabled={!newMessage.trim()}
//           >
//             <Send className="h-3.5 w-3.5 text-white" />
//           </Button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ChatMessage;
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useSocket } from "@/contexts/SocketContext";
import { ChevronLeft, Paperclip, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  _id: string;
  sender: {
    _id: string;
    username: string;
  };
  content: string;
  createdAt: string;
  chat: string; // ✅ Fixed: Added chat field
  pending?: boolean;
}

interface ChatMessageProps {
  username: string;
  userImage: string;
  isActive?: boolean;
  lastSeen: string;
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  newMessage: string;
  setNewMessage: (message: string) => void;
  currentUserId: string;
  selectedChatId: string | null;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  username,
  userImage,
  isActive = false,
  lastSeen,
  messages,
  onSendMessage,
  newMessage,
  setNewMessage,
  currentUserId,
  selectedChatId
}) => {
  const { toast } = useToast();
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();
  const [chatMessages, setChatMessages] = useState<Message[]>([]);


  // Scroll to bottom when new messages arrive
  useEffect(() => {
    // console.log("messages : ", messages);
    // console.log("selectedChatId : ", selectedChatId);
    // setChatMessages(messages);
    if (messagesEndRef.current && isScrolledToBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    // console.log("chatMessages : ",chatMessages);

    // if (!selectedChatId) return;

  }, [messages, isScrolledToBottom]);
/*
  useEffect(() => {
    console.log("change in messages in chatMessage.tsx");
    setChatMessages(messages);
  }, [messages]);*/
  

  // Initialize scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      setIsScrolledToBottom(true);
    }
  }, []); 
    
  // useEffect(() => {
  //   socket.onMessage((message) => {
  //     if (message.chat === selectedChatId) {
  //       setMessages((prev) => [...prev, message]);
  //     }
  //   });
  
  //   // return () => socket.removeMessageHandler();
  // }, [selectedChatId]);
  
  // Listen for new messages from socket
  /*useEffect(() => {
    if (!selectedChatId) return;

    const messageHandler = (message: Message) => {
      console.log("Recived Messgae : ", message);
      if (message.chat === selectedChatId) { // ✅ Fixed: Now message.chat exists
        setChatMessages((prev) => [...prev, message]);
      }
    };

    socket.onMessage(messageHandler);

    return () => {
      // socket.off("newMessage", messageHandler); // ✅ Fixed: Correct way to remove event listener
      
    };
  }, [selectedChatId]);*/

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await onSendMessage(newMessage.trim());
      setNewMessage("");
      console.log("message sent");
      const textarea = document.querySelector("textarea");
      if (textarea) {
        textarea.style.height = "auto";
      }

      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error sending message",
        description: "Your message could not be sent. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-1 rounded-full h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="relative mr-3">
            <Avatar className="h-9 w-9 border border-gray-100">
              <AvatarImage src={userImage} alt={username} />
              <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {isActive && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{username}</h3>
            <p className="text-xs text-gray-500">{isActive ? "Active now" : `Active ${lastSeen}`}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 h-[calc(100%-120px)]" ref={scrollAreaRef}>
        {messages.map((message) => (
          <div key={message._id} className={`mb-4 ${message.sender._id === currentUserId ? "flex justify-end" : "flex justify-start"}`}>
            <div className={`max-w-[70%] rounded-lg p-3 ${message.sender._id === currentUserId ? "bg-blue-500 text-white" : "bg-gray-100"}`}>
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* <ScrollArea className="flex-1 p-4 h-[calc(100%-120px)]" ref={scrollAreaRef}>
        {chatMessages.map((message) => (
          <div key={message._id} className={`mb-4 ${message.sender._id === currentUserId ? "flex justify-end" : "flex justify-start"}`}>
            <div className={`max-w-[70%] rounded-lg p-3 ${message.sender._id === currentUserId ? "bg-blue-500 text-white" : "bg-gray-100"}`}>
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea> */}

      {/* Message Input */}
      <div className="p-2 border-t border-gray-100 mt-auto">
        <form onSubmit={handleSendMessage} className="flex items-center bg-gray-50 rounded-full pr-2">
          <Button type="button" size="icon" variant="ghost" className="rounded-full h-8 w-8 flex-shrink-0 ml-1">
            <Paperclip className="h-4 w-4 text-gray-400" />
          </Button>
          <Textarea
            placeholder="Message..."
            value={newMessage}
            onChange={handleInput}
            className="min-h-[36px] py-2 px-3 resize-none bg-transparent border-none focus-visible:ring-0 flex-grow text-sm"
            style={{ height: "auto", maxHeight: "100px", overflow: newMessage.length > 100 ? "auto" : "hidden" }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            className={`rounded-full h-8 w-8 flex-shrink-0 ${!newMessage.trim() ? "opacity-50 cursor-not-allowed bg-blue-300" : "bg-blue-500 hover:bg-blue-600"}`}
            disabled={!newMessage.trim()}
          >
            <Send className="h-3.5 w-3.5 text-white" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatMessage;
