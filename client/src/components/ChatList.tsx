import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Send } from "lucide-react";
import { useEffect, useState } from "react";

interface Chat {
  id: string;
  username: string;
  image: string;
  lastMessage: string;
  time: string;
  active?: boolean;
  hasNewMessage?: boolean;
}

interface TransformedChat {
  id: string;
  username: string;
  image: string;
  lastMessage: string;
  time: string;
  active?: boolean;
  hasNewMessage?: boolean;
}

interface ChatListProps {
  chats: TransformedChat[];
  onSelectChat: (chatId: string) => Promise<void>;
  selectedChat?: string;
  onSearchUser: (query: string) => Promise<void>;
  onCreateChat: (userId: string) => Promise<void>;
  unreadChats: Set<string>;
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

const ChatList: React.FC<ChatListProps> = ({ 
  chats, 
  onSelectChat, 
  selectedChat,
  onSearchUser,
  onCreateChat,
  unreadChats
}) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await onSearchUser(query);
    }
  };

  const filteredChats = !showSearchResults 
    ? (searchQuery 
      ? chats.filter(chat => 
          chat.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : chats)
    : [];
  
  const noChatsMessage = (
    <div className="flex flex-col items-center justify-center h-64 p-6 text-gray-500">
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <Send className="h-10 w-10 text-gray-300 rotate-45" />
      </div>
      <p className="text-center font-medium mt-4">No Messages</p>
      <p className="text-center text-sm mt-2">Start a conversation with someone!</p>
    </div>
  );
  
  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No conversations yet</p>
            <p className="text-sm">Search for users to start chatting</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {chats.map(chat => (
              <div
                key={chat.id}
                className={`
                  flex items-center p-4 hover:bg-gray-50 cursor-pointer
                  ${selectedChat === chat.id ? 'bg-blue-50' : ''}
                  ${unreadChats.has(chat.id) ? 'bg-blue-50/20' : ''}
                `}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="h-12 w-12 mr-3">
                    <AvatarImage src={chat.image} />
                    <AvatarFallback>{chat.username[0]}</AvatarFallback>
                  </Avatar>
                  {unreadChats.has(chat.id) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="font-semibold truncate">{chat.username}</p>
                    <span className="text-xs text-gray-500">{chat.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {searchQuery && searchResults.length > 0 && (
          <>
            <div className="px-4 py-2 text-sm font-semibold text-gray-500 bg-gray-50">
              Other Users
            </div>
            {searchResults.map((user) => (
              <div
                key={user._id}
                className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onCreateChat(user._id)}
              >
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarImage src={user.profile?.profilephoto} />
                  <AvatarFallback>{user.username[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-sm text-gray-500">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatList;
