import Navbar from "@/components/Navbar";
import { postsApi } from "@/lib/api";
import { set } from "date-fns";
import { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";

interface StoryUser {
  username: string;
  image: string;
  viewed: boolean;
  isOwn?: boolean;
  userId: string;
  hasActiveStory: boolean;
  latestStoryTimestamp?: number;
}

interface StoryItem {
  id: string;
  imageUrl: string;
  username: string;
  timestamp: string;
  userAvatar: string;
  storyId: string;
  userId: string;
}

const Index = () => {
  const [userDate, setUserData] = useState<any>();
  const [displayPosts, setDisplayPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const user = localStorage.getItem("user");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await postsApi.getAllPosts();
        const data = await response.posts;
        const displayPostsTemp = data.map((post: any) => ({
          id: post._id,
          username: post.user?.username || "unknown",
          userId: typeof post.user === 'string' ? post.user : post.user?._id,
          userImage: post.user?.profile?.profilephoto || "/placeholder.svg",
          image: post.posturl || "/placeholder.svg",
          caption: post.caption || "",
          likes: post.like?.length || 0,
          comments: post.comment?.length || 0,
          timeAgo: post.createdAt ? new Date(post.createdAt).toLocaleString() : "1 HOUR AGO",
          postComments: (post.comment || []).map((comment: any) => ({
            id: comment._id,
            username: comment.user?.username || "unknown",
            text: comment.comment || "",
            timestamp: comment.updatedAt ? new Date(comment.updatedAt).toLocaleString() : "now"
          }))
        }));
        setDisplayPosts(displayPostsTemp);
        setUserData(data);
        console.log(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const user = localStorage.getItem("user");
    setUserData(user);
    if (user) {
      fetchPost();
    }
  }, [user]);

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-screen-xl mx-auto pt-20 px-4 md:px-8 flex">
        <div className="w-full lg:w-2/3 xl:w-3/5 mx-auto lg:mx-0">

          <div>
            {displayPosts.length > 0 ? (
              displayPosts.map((post: any) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  username={post.username}
                  userId={post.userId}
                  userImage={post.userImage}
                  image={post.image}
                  caption={post.caption}
                  likes={post.likes}
                  comments={post.comments}
                  timeAgo={post.timeAgo}
                  postComments={post.postComments}
                />
              ))
            ) : (
              <div className="text-center py-10 bg-white border border-gray-200 rounded-lg">
                <p className="text-gray-500">No posts found. Follow people to see their posts.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
