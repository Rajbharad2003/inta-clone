
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { authApi, profileApi } from "@/lib/api";
import { IUser } from "@/lib/models";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface FollowingListProps {
  following: Array<any>;
  isCurrentUser: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const FollowingList = ({ following, isCurrentUser, isOpen, onOpenChange }: FollowingListProps) => {
  const [followingDetails, setFollowingDetails] = useState<IUser[]>([]);  //followong user's which profile we see
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
  const [isUserFollowingReady, setIsUserFollowingReady] = useState(false);
  const [isItFirst, setIsItFirst] = useState(false);
  const [currentUserFollowing, setcurrentUserFollowing] = useState([]); //login users following
  const [currentUserFollowingDetails, setcurrentUserFollowingDetails] = useState<{ [key: string]: boolean }>({}); //login users following Details
  const [currentUser , setCurrentUser] = useState<IUser>();
  

  const navigate = useNavigate();

  const handleUnfollowWhenCurrentUser = async(userId : string) =>   {
    try {
      console.log("handleUnfollowWhenCurrentUser");
      const response = await profileApi.followUser(userId); // Same endpoint handles follow/unfollow
      console.log("response : ",response);
      // Remove user from following details if in following dialog
      setFollowingDetails(prev => prev.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  }
  /*
  const handleUnfollowUser = async (userId: string) => {
    try {
      const response = await profileApi.unfollowUser(userId); // Same endpoint handles follow/unfollow
      console.log("response : ",response);
      // Remove user from following details if in following dialog
      setFollowingDetails(prev => prev.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };
  */
  const handleFollowUser = async (userId: string) => {
    try {
      console.log("handleFollowUser");
      const response = await profileApi.followUser(userId);
      console.log("response : ",response);
      if(response.success)
      {
        if(currentUserFollowingDetails[userId])
        {
          
          console.log("in if 2");
          setcurrentUserFollowing(prev => prev.filter(id => id !== userId));
          setcurrentUserFollowingDetails(prev => {
            const newDetails = { ...prev };  // Create a shallow copy of the previous state
            delete newDetails[userId];      // Remove the userId from the details
            return newDetails;              // Return the updated object
          });
        }
        else
        {
          console.log("in else 2");
          setcurrentUserFollowing(prev => [...prev, userId]);
          setcurrentUserFollowingDetails(prev => ({ ...prev, [userId]: true }));
        }
      }
      else{
        console.log("in else");
      }
      // setFollowingDetails(prev => ({ ...prev, [userId]: true }));
    } catch (error) {
      console.error('Error following user:', error);
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
    const fetchFollowingDetails = async () => {
      if (!following || following.length === 0) return;
      
      setIsLoadingFollowing(true);
      setFollowingDetails([]); // Clear previous data before fetching new batch
      try {
        console.log("Fetching following:", following);
        console.log("Fetching following:", following.length);
        
        // Process following in batches of 10
        for (let i = 0; i < following.length; i += 10) {
          const batch = following.slice(i, i + 10);
          console.log(batch);
          
          const response = await authApi.getBatchUserById(batch);
          console.log("Following batch response:", response);
          if (response && response.users) {
            const batchData = response.users;
            setFollowingDetails(prev => [...prev, ...batchData]);
          }
        }
      } catch (error) {
        console.error('Error fetching following details:', error);
      } finally {
        // setIsLoadingFollowing(false);
        setIsUserFollowingReady(true);
      }
    };

    if (isOpen && following && following.length > 0) {
      fetchFollowingDetails();
    }
  }, [following, isOpen]);

  useEffect(() => {
    if(currentUserFollowing && isItFirst)
    {
      setIsLoadingFollowing(false);
      setIsItFirst(false);
    }
    console.log("currentUserFollowing : ", currentUserFollowing);
    console.log("currentUserFollowingDetails : ", currentUserFollowingDetails);
  },[currentUserFollowing,isItFirst]);

  
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
      const followingStatus = followingDetails.reduce((acc, user) => {
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
  }, [following, followingDetails]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Following</DialogTitle>
        </DialogHeader>
        <div className="mt-2 max-h-96 overflow-y-auto">
          {isLoadingFollowing ? (
            <div className="text-center py-10">Loading following...</div>
          ) : followingDetails.length > 0 ? (
            followingDetails.map((user, index) => (
              <div key={user._id}>
                <div className="flex items-center justify-between py-3">
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleUserClick(user._id)}
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <img 
                        src={user.profile?.profilephoto || "/lovable-uploads/a150a5b0-219e-4ef3-823b-d920528ef424.png"} 
                        alt={user.username}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/lovable-uploads/a150a5b0-219e-4ef3-823b-d920528ef424.png";
                        }}
                      />
                    </Avatar>
                    <div>
                      <p className="font-medium hover:text-instagram-primary">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.firstName} {user.lastName}</p>
                    </div>
                  </div>
                  {isCurrentUser ? (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnfollowWhenCurrentUser(user._id)}
                    >
                      Following
                    </Button>
                  ) : (
                      (user._id === currentUser._id) ? (
                        <></>
                      ) : (
                    <Button 
                      // variant={currentUserFollowing.some(id => id.toString() === user._id.toString()) ? "outline" : "default"}
                      variant={currentUserFollowingDetails[user._id] ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleFollowUser(user._id)}
                      >
                        {/* {currentUserFollowing.some(id => id.toString() === user._id.toString()) ? 'Following' : 'Follow' } */}
                        {currentUserFollowingDetails[user._id] ? 'Following' : ' Follow ' }
                      </Button>
                    )
                  )}
                </div>
                {index < followingDetails.length - 1 && <Separator />}
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">Not following anyone yet</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowingList;
