
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { authApi, profileApi } from "@/lib/api";
import { IUser } from "@/lib/models";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface FollowersListProps {
  followers: string[];
  isCurrentUser: boolean;
  isOpen: boolean;
  updateFollower?: any;
  onOpenChange: (open: boolean) => void;
}

const FollowersList = ({ followers, isCurrentUser, isOpen, onOpenChange, updateFollower, }: FollowersListProps) => {
  const [followerDetails, setFollowerDetails] = useState<IUser[]>([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [isUserFollowingReady, setIsUserFollowingReady] = useState(false);
  const [isItFirst, setIsItFirst] = useState(false);
  const [followingMap, setFollowingMap] = useState<{ [key: string]: boolean }>({});
  const [currentUserFollowing, setcurrentUserFollowing] = useState([]); //login users following
  const [currentUserFollowingDetails, setcurrentUserFollowingDetails] = useState<{ [key: string]: boolean }>({}); //login users following Details
  const [currentUser , setCurrentUser] = useState<IUser>();

  const navigate = useNavigate();

  const handleFollowUser = async (userId: string) => {
    try {
      const response = await profileApi.followUser(userId);
      if(response.success)
      {
        if(currentUserFollowingDetails[userId])
        {
          setcurrentUserFollowing(prev => prev.filter(id => id !== userId));
          setcurrentUserFollowingDetails(prev => {
            const newDetails = { ...prev };  // Create a shallow copy of the previous state
            delete newDetails[userId];      // Remove the userId from the details
            return newDetails;              // Return the updated object
          });
        }
        else
        {
          setcurrentUserFollowing(prev => [...prev, userId]);
          setcurrentUserFollowingDetails(prev => ({ ...prev, [userId]: true }));
        }
      }
      // setFollowingDetails(prev => ({ ...prev, [userId]: true }));
    } catch (error) {
      console.error('Error following user:', error);
    }
    // try {
    //   await profileApi.followUser(userId);
    //   setFollowingMap(prev => ({ ...prev, [userId]: true }));
    // } 
  };

  const handleRemoveFollowerWhenCurrentUser = async (userId: string) => {
    try {
      const response = await profileApi.unfollowUser(userId);
      console.log("respo : ",response);
      // Remove the follower from the list immediately
      setFollowerDetails(prev => prev.filter(user => user._id !== userId));
      console.log("callsing update Follower");
      
      updateFollower(userId);
      console.log("called update Follower");
    } catch (error) {
      console.error('Error removing follower:', error);
    }
  };

  const handleUserClick = (userId: string) => {
    onOpenChange(false); // Close the dialog

    if(userId == currentUser._id)
    {
      navigate(`/profile`);
      return;
    }
    navigate(`/user/${userId}`);
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');

    const fetchUser = async () => {
      const userresponse = await authApi.getUser();
      if(userresponse.success)
      {
        setCurrentUser(userresponse.user);
        console.log("cuurent user", userresponse.user);
      }
      else{
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('currentUserId');
        navigate("/sign-in");
        return;
      }
    }

    if(userData)
    {
      const User = JSON.parse(userData);
      console.log("current user hello :  " , User);
      setCurrentUser(User);
      console.log("cuurent user", User);
    }
    else{
      fetchUser();
    }
  },[])

  useEffect(() => {
    const fetchFollowerDetails = async () => {
      if (!followers || followers.length === 0) return;
      
      setIsLoadingFollowers(true);
      setFollowerDetails([]); // Clear previous data before fetching new batch
      try {
        console.log("Fetching followers:", followers);
        // Process followers in batches of 10
        for (let i = 0; i < followers.length; i += 10) {
          const batch = followers.slice(i, i + 10);
          const response = await authApi.getBatchUserById(batch);
          console.log("Batch response:", response);
          if (response && response.users) {
            const batchData = response.users;
            setFollowerDetails(prev => [...prev, ...batchData]);
          }
        }
      } catch (error) {
        console.error('Error fetching follower details:', error);
      } finally {
        // setIsLoadingFollowers(false);
        setIsUserFollowingReady(true);
      }
    };

    if (isOpen && followers && followers.length > 0) {
      fetchFollowerDetails();
    }
  }, [followers, isOpen]);

  useEffect(() => {
    // Create a map of following status for quick lookup using Set
    if(!isUserFollowingReady)
    {
      return;
    }
    try{
      const currentUserProfile = JSON.parse(localStorage.getItem('userProfile'));
      if(!currentUserProfile)
      {
        return;
      }
      setcurrentUserFollowing([]);
      const followingUsers = currentUserProfile.following;
      if(!followingUsers)
      {
        return;
      }
      const followingSet = new Set(followingUsers);
      const followingStatus = followerDetails.reduce((acc, user) => {
        acc[user._id] = followingSet.has(user._id);
        return acc;
      }, {} as { [key: string]: boolean });
      console.log("followingStatus" , followingStatus);
      console.log("followingUsers" , followingUsers);
      setcurrentUserFollowingDetails(followingStatus);
      setcurrentUserFollowing(followingUsers);
    }
    catch (error) {
      console.error('Error fetching following details:', error);
    }
    finally{
      setIsItFirst(true);
    }
  }, [followers, followerDetails]);

  useEffect(() => {
    if(currentUserFollowing && isItFirst)
      {
        setIsLoadingFollowers(false);
        setIsItFirst(false);
      }
      console.log("currentUserFollowing : ", currentUserFollowing);
      console.log("currentUserFollowingDetails : ", currentUserFollowingDetails);
  },[currentUserFollowing,isItFirst]);

/*
  useEffect(() => {
    // Create a map of following status for quick lookup using Set
    if (following) {
      const followingSet = new Set(following);
      const followingStatus = followerDetails.reduce((acc, user) => {
        acc[user._id] = followingSet.has(user._id);
        return acc;
      }, {} as { [key: string]: boolean });
      
      setFollowingMap(followingStatus);
    }
  }, [following, followerDetails]);*/

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Followers</DialogTitle>
        </DialogHeader>
        <div className="mt-2 max-h-96 overflow-y-auto">
          {isLoadingFollowers ? (
            <div className="text-center py-10">Loading followers...</div>
          ) : followerDetails.length > 0 ? (
            followerDetails.map((follower, index) => (
              <div key={follower._id}>
                <div className="flex items-center justify-between py-3">
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleUserClick(follower._id)}
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <img 
                        src={follower.profile?.profilephoto || "/lovable-uploads/a150a5b0-219e-4ef3-823b-d920528ef424.png"} 
                        alt={follower.username}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/lovable-uploads/a150a5b0-219e-4ef3-823b-d920528ef424.png";
                        }}
                      />
                    </Avatar>
                    <div>
                      <p className="font-medium hover:text-instagram-primary">{follower.username}</p>
                      <p className="text-sm text-gray-500">{follower.firstName} {follower.lastName}</p>
                    </div>
                  </div>
                  {isCurrentUser ? (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFollowerWhenCurrentUser(follower._id)}
                    >
                      Remove
                    </Button>
                  ) : (
                    (follower._id === currentUser._id) ? (
                    <></>

                    ) : (

                    <Button 
                      variant={currentUserFollowingDetails[follower._id] ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleFollowUser(follower._id)}
                    >
                      {currentUserFollowingDetails[follower._id] ? 'Following' : 'Follow' }
                    </Button>
                    )
                  )}

                </div>
                {index < followerDetails.length - 1 && <Separator />}
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">No followers yet</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersList;
