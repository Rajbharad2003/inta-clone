import { Button } from "@/components/ui/button";
import { authApi, profileApi } from "@/lib/api";
import { ChevronDown, Settings, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FollowersList from "./FollowersList";
import FollowingList from "./FollowingList";
import { IUser } from "@/lib/models";
import { useToast } from "@/components/ui/use-toast";

interface ProfileHeaderProps {
  username: string;
  fullName: string;
  profileImage: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  followers?: Array<any>; 
  following?: Array<any>; 
  isCurrentUser?: boolean;
  isFollowing?: boolean;
  // Add optional user and profile props for ViewProfile
  user?: any;
  profile?: any;
  setProfile?: any;
  posts?: any;
  isOwnProfile?: boolean;
  onMessageClick?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  username,
  fullName,
  profileImage,
  postsCount,
  followersCount,
  followingCount,
  followers = [],
  following = [],
  isCurrentUser = false,
  isFollowing ,
  user,
  profile,
  setProfile,
  posts,
  isOwnProfile,
  onMessageClick
}) => {
  const [isFollowingState, setIsFollowingState] = useState(isFollowing);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
  const [currentuserId, setCurrentuserId] = useState('');
  const [followingMap, setFollowingMap] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Use either direct props or derived from user/profile objects
  const displayUsername = username || (user && user.username) || "";
  const displayFullName = fullName || (user && `${user.firstName} ${user.lastName}`) || "";
  const displayProfileImage = profileImage || (profile && profile.profilephoto) || "/lovable-uploads/a150a5b0-219e-4ef3-823b-d920528ef424.png";
  const displayPostsCount = postsCount || (posts && posts.length) || 0;
  const displayFollowersCount = followersCount || (profile && profile.followers && profile.followers.length) || 0;
  const displayFollowingCount = followingCount || (profile && profile.following && profile.following.length) || 0;
  const displayFollowers = followers.length > 0 ? followers : (profile && profile.followers) || [];
  const displayFollowing = following.length > 0 ? following : (profile && profile.following) || [];
  
  const handleFollowersDialogChange = (open: boolean) => {
    setShowFollowers(open);
  };

  const handleFollowingDialogChange = (open: boolean) => {
    setShowFollowing(open);
  };

  const handleFollowUser = async (userId: string) => {
    try {
      await profileApi.followUser(userId);
      setFollowingMap(prev => ({ ...prev, [userId]: true }));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollowUser = async (userId: string) => {
    try {
      await profileApi.followUser(userId); // Same endpoint handles follow/unfollow
      setFollowingMap(prev => ({ ...prev, [userId]: false }));
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  useEffect(() => {
    // Create a map of following status for quick lookup
    const followingIds = displayFollowing.reduce((acc: { [key: string]: boolean }, id: string) => {
      acc[id] = true;
      return acc;
    }, {});
    setFollowingMap(followingIds);
    
  }, [displayFollowing]);
  
  useEffect(() => {

    const userId = localStorage.getItem('currentUserId');
    setCurrentuserId(userId);
    
  }, []);

  const updateFollower = async (uId:any) => {
    console.log("Update Follower in ProfileHeader",uId);
    setProfile((prev) => ({
      ...prev,
      followers: (prev.followers || []).filter(id => id !== uId),
      followersCount: (prev.followersCount || 0) - 1
    }));
  }
  
  const handleFollow = async () => {
    try {
      const id = currentuserId ? currentuserId : localStorage.getItem('currentUserId');
      if (!isFollowingState) {
        const result = await profileApi.followUser(user._id);
        console.log("Follow result:", result);
        // Update profile state properly

        
        setProfile((prev) => ({
          ...prev,
          followers: [...(prev.followers || []), id],
          followersCount: (prev.followersCount || 0) + 1
        }));
        toast({
          title: "Success",
          description: `You are now following ${username}`,
        });
      } else {
        console.log("Unfollowing user : ", user._id);
        const result = await profileApi.followUser(user._id);
        console.log("Unfollow result:", result);
        // Update profile state properly
        setProfile((prev) => ({
          ...prev,
          followers: (prev.followers || []).filter(Id => Id !== id),
          followersCount: (prev.followersCount || 0) - 1
        }));
        toast({
          title: "Success",
          description: `You unfollowed ${username}`,
        });
      }
      setIsFollowingState(!isFollowingState);
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      toast({
        title: "Error",
        description: "Failed to follow/unfollow user. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleEditProfile = () => {
    navigate('/edit-profile');
  };
  
  // Determine current user status
  const effectiveIsCurrentUser = isCurrentUser || isOwnProfile || false;
  
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center py-8 animate-fade-in">
      {/* Profile Image */}
      <div className="profile-gradient-border w-20 h-20 md:w-36 md:h-36 mx-auto md:mx-0 md:mr-8 lg:mr-24">
        <img 
          src={displayProfileImage} 
          alt={displayUsername} 
          className="rounded-full w-full h-full object-cover border-2 border-white"
          onError={(e) => {
            // Fallback image if the profile picture fails to load
            const target = e.target as HTMLImageElement;
            target.src = "/lovable-uploads/a150a5b0-219e-4ef3-823b-d920528ef424.png";
          }}
        />
      </div>
      
      {/* Profile Info */}
      <div className="flex-1 mt-4 md:mt-0 w-full md:w-auto">
        {/* Username and Buttons */}
        <div className="flex flex-col md:flex-row items-start md:items-center mb-4">
          <h2 className="text-xl font-normal mr-6">{displayUsername}</h2>
          
          {effectiveIsCurrentUser ? (
            <div className="flex space-x-2 mt-2 md:mt-0">
              <Button 
                variant="outline" 
                className="h-8 rounded-lg font-semibold"
                onClick={handleEditProfile}
              >
                Edit Profile
              </Button>
            </div>
          ) : (
            <div className="flex space-x-2 mt-2 md:mt-0">
              <Button 
                variant={isFollowingState ? "outline" : "default"} 
                className="h-8 rounded-lg font-semibold" 
                onClick={handleFollow}
              >
                {isFollowingState ? 'Following' : 'Follow'}
              </Button>
              <Button 
                variant="outline" 
                className="h-8 rounded-lg font-semibold"
                onClick={onMessageClick}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Message
              </Button>
              <Button variant="outline" className="h-8 rounded-lg px-1">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Stats - ensure they're numbers for better display */}
        <div className="flex space-x-8 mb-4">
          <div>
            <span className="font-semibold">{Number(displayPostsCount) || 0}</span> posts
          </div>
          <div className="cursor-pointer" onClick={() => setShowFollowers(true)}>
            <span className="font-semibold">{(Number(displayFollowersCount) || 0).toLocaleString()}</span> followers
          </div>
          <div className="cursor-pointer" onClick={() => setShowFollowing(true)}>
            <span className="font-semibold">{(Number(displayFollowingCount) || 0).toLocaleString()}</span> following
          </div>
        </div>
        
        {/* Name */}
        <div className="font-semibold">{displayFullName}</div>
      </div>
      
      {/* Followers and Following Dialogs */}
      <FollowersList
        followers={displayFollowers}
        // following={displayFollowing}
        isCurrentUser={effectiveIsCurrentUser}
        isOpen={showFollowers}
        onOpenChange={setShowFollowers}
        updateFollower={updateFollower}
        />
      
      <FollowingList
        following={displayFollowing}
        isCurrentUser={effectiveIsCurrentUser}
        isOpen={showFollowing}
        onOpenChange={setShowFollowing}
      />
    </div>
  );
};

export default ProfileHeader;
