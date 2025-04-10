
import { useState, useEffect } from "react";
import { Heart, MessageCircle, Play } from "lucide-react";
import { postsApi } from "@/lib/api";
import { toast } from "sonner";

interface Post {
  id: string;
  posturl: string;
  likes: number;
  comments: number;
  isVideo?: boolean;
}

const ExploreGrid = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await postsApi.getAllPosts();
        // Transform backend data to match our component's requirements
        const formattedPosts = data.map((post: any) => ({
          id: post._id || post.id,
          posturl: post.posturl,
          likes: post.likes?.length || 0,
          comments: post.comments?.length || 0,
          isVideo: post.posturl?.includes('.mp4') || post.posturl?.includes('.mov') || false
        }));
        
        setPosts(formattedPosts);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        toast.error("Failed to load posts");
        
        // Fallback to mock data if API call fails
        setPosts([
          { 
            id: "1", 
            posturl: "/lovable-uploads/e6ae6c49-9d56-4633-abbf-1f277f80bbd5.png", 
            likes: 1254, 
            comments: 42 
          },
          { 
            id: "2", 
            posturl: "/lovable-uploads/a150a5b0-219e-4ef3-823b-d920528ef424.png", 
            likes: 3782, 
            comments: 89, 
            isVideo: true 
          },
          { 
            id: "3", 
            posturl: "/lovable-uploads/96ebde1e-556e-497c-9bbf-bfb6b92d3f49.png", 
            likes: 986, 
            comments: 32 
          },
          { 
            id: "4", 
            posturl: "/lovable-uploads/2d736408-6925-40dd-b81c-8d99535afb51.png", 
            likes: 2541, 
            comments: 76 
          },
          { 
            id: "5", 
            posturl: "/lovable-uploads/98a36c5e-df84-47b0-8661-7171eee1e769.png", 
            likes: 1826, 
            comments: 54 
          },
          { 
            id: "6", 
            posturl: "/lovable-uploads/e6ae6c49-9d56-4633-abbf-1f277f80bbd5.png", 
            likes: 3175, 
            comments: 108, 
            isVideo: true 
          },
          { 
            id: "7", 
            posturl: "/lovable-uploads/96ebde1e-556e-497c-9bbf-bfb6b92d3f49.png", 
            likes: 753, 
            comments: 27 
          },
          { 
            id: "8", 
            posturl: "/lovable-uploads/2d736408-6925-40dd-b81c-8d99535afb51.png", 
            likes: 4210, 
            comments: 156, 
            isVideo: true 
          },
          { 
            id: "9", 
            posturl: "/lovable-uploads/98a36c5e-df84-47b0-8661-7171eee1e769.png", 
            likes: 1683, 
            comments: 59 
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-1 md:gap-4 animate-pulse">
        {[...Array(9)].map((_, index) => (
          <div key={index} className="aspect-square bg-gray-200"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-4 animate-fade-in">
      {posts.map((post) => (
        <div 
          key={post.id} 
          className="aspect-square relative overflow-hidden bg-gray-100"
        >
          <img 
            src={post.posturl} 
            alt={`Post ${post.id}`} 
            className="w-full h-full object-cover"
          />
          {post.isVideo && (
            <div className="absolute top-2 right-2">
              <Play className="w-5 h-5 text-white" fill="white" />
            </div>
          )}
          <div className="post-overlay">
            <div className="flex items-center text-white">
              <Heart className="w-5 h-5 fill-white mr-1" />
              <span className="font-semibold">{post.likes.toLocaleString()}</span>
            </div>
            <div className="flex items-center text-white">
              <MessageCircle className="w-5 h-5 fill-white mr-1" />
              <span className="font-semibold">{post.comments.toLocaleString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExploreGrid;
