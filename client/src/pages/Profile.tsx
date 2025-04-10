
import Navbar from "@/components/Navbar";
import PostGrid from "@/components/PostGrid";
import ProfileHeader from "@/components/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { postsApi, profileApi } from "@/lib/api";
import { IPost } from "@/lib/models/Post";
import { IProfile, IUser } from "@/lib/models/User";
import { Bookmark, LayoutGrid, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [user, setUser] = useState<IUser | null>(null);
  const [posts, setPosts] = useState<IPost[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Calculate counts with proper fallbacks to prevent undefined errors
  const [postsCount, setPostsCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  
  // Ensure followers and following are arrays
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  
  useEffect(() => {
    if(user && profile) {
      setPostsCount(profile.posts?.length || 0);
      setFollowersCount(profile.followers?.length || 0);
      setFollowingCount(profile.following?.length || 0);
      setFollowers(Array.isArray(profile.followers) ? profile.followers : []);
      setFollowing(Array.isArray(profile.following) ? profile.following : []);
      console.log("user set", user);

      const fetchPosts = async () => {
        if (!profile || !profile.posts || profile.posts.length === 0) return;
        
        try {
          const postsResponse = await postsApi.getBatchPostsById(profile.posts);
          if (postsResponse && postsResponse.posts) {
            setPosts(postsResponse.posts);
          }
        } catch (error) {
          console.error("Error fetching posts:", error);
        }
      };
      
      // Fetch posts
      fetchPosts();
    }
  }, [user, profile]);

  // const fetchPosts = async () => {
  //   if (!profile || !profile.posts || profile.posts.length === 0) return;
    
  //   try {
  //     const postsResponse = await postsApi.getBatchPostsById(profile.posts);
  //     if (postsResponse && postsResponse.posts) {
  //       setPosts(postsResponse.posts);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching posts:", error);
  //   }
  // };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        console.log("Fetching profile data...");
        
        // Fetch profile data directly from API
        const profileData = await profileApi.getProfile();
        console.log("Profile data from API:", profileData);
        
        if (profileData && profileData.success) {
          // Store the received profile data
          const profileInfo = profileData.profile || profileData.data?.profile || profileData.data;
          
          let u = profileData.user || JSON.parse(localStorage.getItem('user') || '{}');
          setUser(u);
          
          // Store current user ID for later reference
          if (profileInfo && profileInfo._id) {
            localStorage.setItem('currentUserProfileId', profileInfo._id);
          }
          
          // Ensure followers and following arrays are properly initialized
          if (!profileInfo.followers) profileInfo.followers = [];
          if (!profileInfo.following) profileInfo.following = [];
          
          console.log("Processed profile info:", profileInfo);
          setProfile(profileInfo);
          
          // Update localStorage with latest user data to ensure it's in sync
          if (profileInfo) {
            localStorage.setItem('userProfile', JSON.stringify(profileInfo));
          }
          
          // Set document title
          document.title = `${u?.username || 'User'} • Instagram`;
        } else {
          throw new Error("Failed to fetch profile data");
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        
        // Try to fall back to localStorage data if API call fails
        const storedUser = localStorage.getItem('userProfile');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            console.log("Falling back to user data from localStorage:", userData);
            
            // Ensure current user ID is set
            if (userData && userData._id) {
              localStorage.setItem('currentUserProfileId', userData._id);
            }
            
            // Ensure followers and following arrays are properly initialized
            if (!userData.followers) userData.followers = [];
            if (!userData.following) userData.following = [];
            
            setProfile(userData);
          } catch (e) {
            console.error("Error parsing stored user data:", e);
            toast({
              title: "Error loading profile",
              description: "Failed to load profile information",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Error loading profile",
            description: error.message || "Failed to load profile information",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  if (loading && !user) {
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-screen-xl mx-auto pt-20 px-4 md:px-8">
        {profile && user && (
          <ProfileHeader 
            username={user.username || ""}
            fullName={`${user.firstName || ""} ${user.lastName || ""}`}
            profileImage={profile.profilephoto || "/lovable-uploads/a150a5b0-219e-4ef3-823b-d920528ef424.png"}
            postsCount={postsCount}
            followersCount={followersCount}
            followingCount={followingCount}
            followers={followers}
            following={following}
            isCurrentUser={true}
            user={user}
            profile={profile}
            setProfile={setProfile}
            posts={profile.posts || []}
            isOwnProfile={true}
          />
        )}
        
        {/* Using the icon-based tabs (formerly in the red box) */}
        <Tabs defaultValue="posts" className="w-full animate-fade-in">
          <TabsList className="flex justify-center border-t border-gray-200 mb-6">
            <TabsTrigger value="posts" className="flex items-center justify-center">
              <LayoutGrid className="h-4 w-4 mr-2" />
              <span className="uppercase text-xs tracking-wider">Posts</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center justify-center">
              <Bookmark className="h-4 w-4 mr-2" />
              <span className="uppercase text-xs tracking-wider">Saved</span>
            </TabsTrigger>
            <TabsTrigger value="tagged" className="flex items-center justify-center">
              <Tag className="h-4 w-4 mr-2" />
              <span className="uppercase text-xs tracking-wider">Tagged</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-10 h-10 border-t-2 border-instagram-primary border-solid rounded-full animate-spin"></div>
              </div>
            ) : (
              <PostGrid posts={profile?.posts || []} />
            )}
          </TabsContent>
          
          <TabsContent value="saved" className="mt-6">
            <div className="py-10 text-center">
              <p className="text-gray-500">This tab is only visible to you</p>
            </div>
          </TabsContent>
          
          <TabsContent value="tagged" className="mt-6">
            <div className="py-10 text-center">
              <p className="text-gray-500">No photos</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
