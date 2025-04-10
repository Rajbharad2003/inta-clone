import { useToast } from "@/components/ui/use-toast";
import { authApi, profileApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface SuggestionProps {
  username: string;
  image: string;
  relation: string;
  userId: string;
}

const Suggestion: React.FC<SuggestionProps> = ({ username, image, relation, userId }) => {
  const [following, setFollowing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleFollow = async () => {
    try {
      if (!following) {
        const result = await profileApi.followUser(userId);
        console.log("Follow result:", result);
        toast({
          title: "Success",
          description: `You are now following ${username}`,
        });
      } else {
        const result = await profileApi.followUser(userId);
        console.log("Unfollow result:", result);
        toast({
          title: "Success",
          description: `You unfollowed ${username}`,
        });
      }
      setFollowing(!following);
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      toast({
        title: "Error",
        description: "Failed to follow/unfollow user. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex items-center justify-between py-2">
      <div 
        className="flex items-center cursor-pointer"
        onClick={() => navigate(`/user/${userId}`)}
      >
        <div className="h-9 w-9 rounded-full overflow-hidden mr-3">
          <img 
            src={image || "/lovable-uploads/a150a5b0-219e-4ef3-823b-d920528ef424.png"} 
            alt={username} 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback image if the profile picture fails to load
              const target = e.target as HTMLImageElement;
              target.src = "/lovable-uploads/a150a5b0-219e-4ef3-823b-d920528ef424.png";
            }}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold hover:text-instagram-primary">{username}</span>
          <span className="text-xs text-instagram-gray">{relation}</span>
        </div>
      </div>
      <button 
        className="text-xs font-semibold text-instagram-primary"
        onClick={handleFollow}
      >
        {following ? 'Following' : 'Follow'}
      </button>
    </div>
  );
};

const ProfileSidebar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [displayName, setDisplayName] = useState('Loading...');
  const [username, setUsername] = useState('Loading...');
  const [profileImage, setProfileImage] = useState("/lovable-uploads/a150a5b0-219e-4ef3-823b-d920528ef424.png");
  
  useEffect(() => {
    if(user)
    {
      setDisplayName(`${user.profilename || ''}`.trim());      
      let u = JSON.parse(localStorage.getItem('user'));
      setUsername(u.username || user.username);
      setProfileImage(user.profilephoto);

    }
  }, [user]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await profileApi.getProfile();

        const userDat = await authApi.getUser();
        
        if (userData && userData.success && userData.profile) {
          setUser(userData.profile);
          
          const currentUserId = userDat.user._id;
          localStorage.setItem('currentUserId', currentUserId);
          
          localStorage.setItem('userProfile', JSON.stringify(userData.profile));
          
          fetchSuggestions(currentUserId);
        } else {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
              const currentUserId = parsedUser._id;
              localStorage.setItem('currentUserId', currentUserId);
              
              fetchSuggestions(currentUserId);
            } catch (error) {
              console.error("Error parsing user data:", error);
              setLoading(false);
            }
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            const currentUserId = parsedUser._id;
            localStorage.setItem('currentUserId', currentUserId);
            
            fetchSuggestions(currentUserId);
          } catch (error) {
            console.error("Error parsing user data:", error);
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      }
    };
    
    fetchUserData();
  }, [toast]);
  
  const fetchSuggestions = async (currentUserId: string) => {
    if (!currentUserId) {
      console.error("Cannot fetch suggestions: No current user ID");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log("Fetching suggestions for user ID:", currentUserId);
      
      const response = await profileApi.getAllUsers();
      console.log("Fetched all users for suggestions:", response);
      
      if (response && response.success && Array.isArray(response.alluser)) {
        const users = response.alluser;
        
        const currentUser = user || JSON.parse(localStorage.getItem('userProfile') || '{}');
        
        const followingList = Array.isArray(currentUser.following) 
          ? currentUser.following.map((f: any) => typeof f === 'object' ? f._id : f)
          : [];
        
        const filteredUsers = users
          .filter((u: any) => {
            const userId = typeof u._id === 'object' ? u._id.toString() : u._id;
            
            if (!currentUserId) {
              console.error("Cannot filter users: No valid current user ID");
              return false;
            }
            
            const loggedInUserId = currentUserId.toString();
            
            if (userId === loggedInUserId) {
              console.log("Filtered out current user:", u.username);
              return false;
            }
            
            if (followingList.includes(userId)) {
              console.log("Filtered out followed user:", u.username);
              return false;
            }
            
            return true;
          })
          .slice(0, 5);
        
        console.log("Filtered suggestions:", filteredUsers);
        setSuggestions(filteredUsers);
      } else {
        console.error("Invalid response format for getAllUsers", response);
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
      toast({
        title: "Error loading suggestions",
        description: "Failed to load user suggestions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSwitchClick = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('currentUserId');
    navigate('/sign-in');
  };
  
  const handleProfileClick = () => {
    navigate('/profile');
  };
  

  if (loading && !user) {
    return (
      <div className="w-80 animate-pulse">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center">
            <div className="h-14 w-14 bg-gray-200 rounded-full mr-4"></div>
            <div className="flex flex-col">
              <div className="bg-gray-200 h-4 w-24 rounded mb-1"></div>
              <div className="bg-gray-200 h-3 w-32 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 animate-fade-in">
      <div className="flex items-center justify-between py-3">
        <div 
          className="flex items-center cursor-pointer" 
          onClick={handleProfileClick}
        >
          <div className="h-14 w-14 rounded-full overflow-hidden mr-4">
            <img 
              src={profileImage} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/lovable-uploads/a150a5b0-219e-4ef3-823b-d920528ef424.png";
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">{username}</span>
            <span className="text-instagram-gray">{displayName}</span>
          </div>
        </div>
        <button 
          className="text-xs font-semibold text-instagram-primary"
          onClick={handleSwitchClick}
        >
          Switch
        </button>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-instagram-gray">Suggestions For You</span>
          <Link to="/explore/people" className="text-xs font-semibold">
            See All
          </Link>
        </div>
        
        <div className="mt-2">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <Suggestion 
                key={suggestion._id}
                username={(suggestion.firstName + " " + suggestion.lastName) || "user"}
                image={suggestion.profile.profilephoto}
                relation={"Suggested for you"}
                userId={suggestion._id}
              />
            ))
          ) : (
            <div className="text-sm text-gray-500 py-4 text-center">
              No suggestions available at the moment
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-xs text-instagram-gray">
        <div className="flex flex-wrap gap-x-2 gap-y-1 mb-4">
          <Link to="/about" className="hover:underline">About</Link>
          <span>·</span>
          <Link to="/help" className="hover:underline">Help</Link>
          <span>·</span>
          <Link to="/press" className="hover:underline">Press</Link>
          <span>·</span>
          <Link to="/api" className="hover:underline">API</Link>
          <span>·</span>
          <Link to="/jobs" className="hover:underline">Jobs</Link>
          <span>·</span>
          <Link to="/privacy" className="hover:underline">Privacy</Link>
          <span>·</span>
          <Link to="/terms" className="hover:underline">Terms</Link>
          <span>·</span>
          <Link to="/locations" className="hover:underline">Locations</Link>
          <span>·</span>
          <Link to="/language" className="hover:underline">Language</Link>
        </div>
        <div className="text-xs">
          © 2023 Instagram from Meta
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
