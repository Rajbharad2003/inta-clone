import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProfileHeader from "@/components/ProfileHeader";
import { IPost, IProfile, IUser } from "@/lib/models";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { profileApi, postsApi } from "@/lib/api";
import SendMessageModal from "@/components/SendMessageModal";
import { Bookmark, Heart, LayoutGrid, MessageCircle, Tag } from "lucide-react";

const ViewProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<IUser | null>(null);
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [posts, setPosts] = useState<IPost[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Add a function to check follow status
  const checkFollowStatus = async (userId: string) => {
    try {
      const currentUserProfile = await profileApi.getProfile();
      const followingSet = new Set(currentUserProfile.profile.following.map(id => 
        typeof id === 'object' ? id._id : id
      ));
      setIsFollowing(followingSet.has(userId));
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        console.log("Fetching profile for user:", id);
        const response = await profileApi.getUserProfileById(id);
        console.log("Profile response:", response);

        if (response && response.user) {
          setUser(response.user);
          setProfile(response.user.profile);
          // Check follow status after setting user
          await checkFollowStatus(response.user._id);
          
          // Fetch posts data
          if (response.user.profile?.posts && response.user.profile.posts.length > 0) {
            try {
              const postsResponse = await postsApi.getBatchPostsById(response.user.profile.posts);
              if (postsResponse && postsResponse.posts) {
                setPosts(postsResponse.posts);
              }
            } catch (postError) {
              console.error('Error fetching posts:', postError);
            }
          }
          document.title = `${response.user.profile?.profilename || "User"} • Instagram`;
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, toast]);

  // Add effect to update follow status when profile changes
  useEffect(() => {
    if (user?._id) {
      checkFollowStatus(user._id);
    }
  }, [user?._id, profile?.followers]);

  const handleMessageOpen = () => {
    setIsMessageModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto pt-16 px-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-t-2 border-instagram-primary border-solid rounded-full animate-spin"></div>
          </div>
        ) : !profile ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-2">User not found</h2>
            <p className="text-gray-500">The user you're looking for doesn't exist or has been removed.</p>
          </div>
        ) : (
          <>
            <ProfileHeader 
              username={user?.username || ""}
              fullName={`${user?.firstName || ""} ${user?.lastName || ""}`}
              profileImage={profile?.profilephoto || "/lovable-uploads/a150a5b0-219e-4ef3-823b-d920528ef424.png"}
              postsCount={profile?.posts?.length || 0}
              followersCount={profile?.followers?.length || 0}
              followingCount={profile?.following?.length || 0}
              followers={profile?.followers || []}
              following={profile?.following || []}
              isCurrentUser={false}
              user={user}
              profile={profile}
              setProfile={setProfile}
              posts={profile?.posts || []}
              isOwnProfile={false}
              onMessageClick={handleMessageOpen}
              isFollowing = {isFollowing}
            />
            
            <Tabs defaultValue="posts" className="w-full animate-fade-in">
              <TabsList className="flex justify-center border-t border-gray-200 mb-6">
                <TabsTrigger value="posts" className="flex items-center justify-center">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  <span className="uppercase text-xs tracking-wider">Posts</span>
                </TabsTrigger>
              
                <TabsTrigger value="tagged" className="flex items-center justify-center">
                  <Tag className="h-4 w-4 mr-2" />
                  <span className="uppercase text-xs tracking-wider">Tagged</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="posts" className="mb-10">
                {/* Display post grid */}
                <div className="grid grid-cols-3 gap-1 md:gap-6 animate-fade-in">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <div
                        key={post._id}
                        className="aspect-square relative overflow-hidden bg-gray-100 cursor-pointer group"
                        onClick={() => navigate(`/post/${post._id}`)}
                      >
                        <img
                          src={post.posturl}
                          alt={`Post ${post._id}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex items-center space-x-6 text-white">
                            <div className="flex items-center">
                              <Heart className="h-6 w-6 mr-2 fill-white text-white" />
                              <span className="font-semibold">{post.like.length}</span>
                            </div>
                            <div className="flex items-center">
                              <MessageCircle className="h-6 w-6 mr-2 fill-transparent text-white" />
                              <span className="font-semibold">{post.comment.length}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 flex flex-col items-center justify-center py-12">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <img src="/placeholder.svg" alt="No posts" className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Share Photos</h3>
                      <p className="text-instagram-gray text-center max-w-md">
                        When you share photos, they will appear on your profile.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="tagged" className="mt-6">
                <div className="py-10 text-center">
                  <p className="text-gray-500">No photos</p>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
      
      {isMessageModalOpen && profile && user && (
        <SendMessageModal 
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          receiverId={id || ""}
          receiverName={user?.username || "User"}
          receiverImage={profile?.profilephoto || "/lovable-uploads/a150a5b0-219e-4ef3-823b-d920528ef424.png"}
        />
      )}
    </div>
  );
};

export default ViewProfile;
