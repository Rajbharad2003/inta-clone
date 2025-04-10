import { postsApi } from "@/lib/api";
import { IPost } from "@/lib/models/Post";
import {
  Heart,
  Image as ImageIcon,
  MessageCircle
} from "lucide-react";
import { useEffect, useState } from "react";

const PostGrid = ({ posts }: { posts: string[] }) => {
  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "tagged">(
    "posts"
  );

  const [post, setPost] = useState<IPost[]>([]);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
  // const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      if (posts.length === 0) return;

      setIsLoadingFollowing(true);
      setPost([]); // Clear previous data before fetching new batch
      posts.reverse();
      try {
        // Process following in batches of 10
        for (let i = 0; i < posts.length; i += 12) {
          const batch = posts.slice(i, i + 12);
          const response = await postsApi.getBatchPostsById(batch);
          console.log(response);
          const batchData = response.posts;
          setPost((prev) => [...prev, ...batchData]);
        }
      } catch (error) {
        console.error("Error fetching following details:", error);
      } finally {
        setIsLoadingFollowing(false);
      }
    };

    fetchPosts();
  }, [posts]);


  const renderPosts = () => {
    if (activeTab === "posts" && posts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Share Photos</h3>
          <p className="text-instagram-gray text-center max-w-md">
            When you share photos, they will appear on your profile.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-1 md:gap-6 animate-fade-in">
        {post.map((post) => (
          <div
            key={post._id}
            className="aspect-square relative overflow-hidden bg-gray-100"
          >
            <img
              src={post.posturl}
              alt={`Post ${post._id}`}
              className="w-full h-full object-cover"
            />
            {/* {post.isVideo && (
              <div className="absolute top-2 right-2">
                <Play className="w-5 h-5 text-white" fill="white" />
              </div>
            )} */}
            <div className="post-overlay">
              <div className="flex items-center text-white">
                <Heart className="w-5 h-5 fill-white mr-1" />
                <span className="font-semibold">{post.like.length}</span>
              </div>
              <div className="flex items-center text-white">
                <MessageCircle className="w-5 h-5 fill-white mr-1" />
                <span className="font-semibold">{post.comment.length}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full animate-fade-in">
      {/* Tabs */}

      {/* Content based on active tab */}
      <div className="mb-10">
        {isLoadingFollowing ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-16 h-16 border-t-4 border-instagram-primary border-solid rounded-full animate-spin"></div>
          </div>
        ) : (
          renderPosts()
        )}
      </div>
    </div>
  );
};

export default PostGrid;
