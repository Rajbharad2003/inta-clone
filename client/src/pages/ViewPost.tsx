
import Navbar from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { postsApi } from "@/lib/api";
import { IPost, IUser } from "@/lib/models";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Bookmark, Heart, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ViewPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<IPost | null>(null);
  const [user, setUser] = useState<IUser | null>(null);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    document.title = "View Post • Instagram";
    
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const userData = localStorage.getItem('user');
        const currentUser = userData ? JSON.parse(userData) : { username: "user" };
        console.log("current user hello :  " , currentUser);
        setCurrentUser(currentUser);
        const response = await postsApi.getPostById(id);
        console.log(response);
        if (response && response.post) {
          setPost(response.post);
          setLikesCount(response.post.like?.length || 0);
          setComments(Array.isArray(response.post.comment) ? response.post.comment : []);
          
          // Fetch user data
          if (response.post.user) {
            try {
              
              setUser(response.post.user);
            } catch (error) {
              console.error("Error fetching user data:", error);
            }
          }
          
          // Check if post is liked by current user
          try {
            const likeResponse = await postsApi.getLikePost(id);
            setLiked(likeResponse.isLiked);
          } catch (error) {
            console.error("Error checking like status:", error);
          }
          
          // Check if post is saved by current user
          try {
            const saveResponse = await postsApi.checkSavedPost(id);
            setSaved(saveResponse.isSaved);
          } catch (error) {
            console.error("Error checking save status:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        toast({
          title: "Error",
          description: "Failed to load post. The post may have been deleted or doesn't exist.",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id, toast, navigate]);

  const handleLike = async () => {
    if (!id) return;
    
    try {
      await postsApi.likePost(id);
      
      // Update UI optimistically
      setLiked(!liked);
      setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    } catch (error) {
      console.error("Error liking post:", error);
      toast({
        title: "Error",
        description: "Failed to like/unlike the post",
        variant: "destructive",
      });
    }
  };
  
  const handleSave = async () => {
    if (!id) return;
    
    try {
      await postsApi.savePost(id);
      
      // Update UI optimistically
      setSaved(!saved);
    } catch (error) {
      console.error("Error saving post:", error);
      toast({
        title: "Error",
        description: "Failed to save/unsave the post",
        variant: "destructive",
      });
    }
  };
  
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;
    
    try {
      // Send comment to API
      const response = await postsApi.commentPost(id, commentText.trim());
      
      // Get current user for the comment
      // const userData = localStorage.getItem('user');
      // const currentUser = userData ? JSON.parse(userData) : { username: "user" };
      // console.log("current user hello :  " , currentUser);
      // setCurrentUser(currentUser);
      
      // const currentUser = currentUser;
      
      // Add comment to local state
      if (response && response.comment) {
        const newComment = {
          _id: response.comment._id,
          userId: currentUser._id,
          username: currentUser.username,
          content: commentText.trim(),
          createdAt: new Date(),
        };
        
        setComments([...comments, newComment]);
        setCommentText("");
      }
      
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };
  
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
  
  if (!post || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-xl font-semibold mb-2">Post not found</p>
          <p className="text-gray-500 mb-4">The post you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto pt-20 px-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Back button */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-medium p-4 hover:text-instagram-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
          
          <div className="md:flex">
            {/* Post Image */}
            <div className="md:w-3/5 bg-black flex items-center justify-center">
              <img 
                src={post.posturl}
                alt="Post" 
                className="w-full h-auto object-contain max-h-[70vh]"
              />
            </div>
            
            {/* Post Details */}
            <div className="md:w-2/5 flex flex-col border-l border-gray-100">
              {/* Post Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage
                      src={user.profile?.profilephoto || "/lovable-uploads/a150a5b0-219e-4ef3-823b-d920528ef424.png"}
                      alt={user.username}
                    />
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-base">{user.username}</p>
                    <p className="text-xs text-gray-500">{post.location || ""}</p>
                    <p className="text-sm text-gray-500">{post.caption}</p>
                  </div>
                </div>
                <button className="insta-icon-btn">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
              
              {/* Caption and Comments */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* Caption */}
                {/* {post.caption && (
                  <div className="flex mb-4">
                    <Avatar className="h-8 w-8 mr-3 mt-1 cursor-pointer">
                        <AvatarImage
                          src={user.profile?.profilephoto || "/lovable-uploads/a150a5b0-219e-4ef3-823b-d920528ef424.png"}
                          alt={user.username}
                          />
                                  <AvatarFallback>
                      <span className="cursor-pointer font-medium text-base"
                                onClick={() => {
                                  navigate(`/viewprofile/${user?._id}`);
                                }}
                              >
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                          </AvatarFallback>
                      </Avatar>
                    <div>
                      <p>
                        <span className="font-semibold mr-2">{user.username}</span>
                        {post.caption}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {post.createdAt && formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )} */}
                
                {/* Comments */}
                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment._id} className="flex">
                        <Avatar className="h-8 w-8 mr-3 mt-1">
                          <AvatarImage
                            src={comment?.user?.profile?.profilephoto}
                            alt="User"
                          />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div>
                          <p>
                            {comment?.user?.username === currentUser.username ? (
                              <span
                                className="mr-2 cursor-pointer font-medium text-base"
                                onClick={() => {
                                  navigate(`/profile`);
                                }}
                              >
                                {comment?.user?.username}
                              </span>
                            ) : (
                              // <Link to={`/viewprofile/${comment?.user?._id}`}>
                              <span
                                className="mr-2 cursor-pointer font-medium text-base"
                                onClick={() => {
                                  navigate(`/user/${comment?.user?._id}`);
                                }}
                              >
                                {comment?.user?.username}
                              </span>
                              // </Link>
                            )}
                            {/* <span className="font-semibold mr-2">{comment.username || "user"}</span> */}
                            {comment.content || comment.comment}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No comments yet
                  </div>
                )}
              </div>
              
              {/* Post Actions */}
              <div className="border-t border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-4">
                    <button onClick={handleLike} className="insta-icon-btn">
                      <Heart 
                        className={`h-6 w-6 ${liked ? 'fill-instagram-red text-instagram-red' : ''}`} 
                      />
                    </button>
                    <button className="insta-icon-btn">
                      <MessageCircle className="h-6 w-6" />
                    </button>
                    <button className="insta-icon-btn">
                      <Send className="h-6 w-6" />
                    </button>
                  </div>
                  <button onClick={handleSave} className="insta-icon-btn">
                    <Bookmark className={`h-6 w-6 ${saved ? 'fill-black' : ''}`} />
                  </button>
                </div>
                
                {/* Likes */}
                <div className="font-semibold mb-2">{likesCount.toLocaleString()} likes</div>
                
                {/* Time */}
                <div className="text-xs text-gray-500 mb-3">
                  {post.createdAt && formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </div>
                
                {/* Add Comment */}
                <form onSubmit={handleAddComment} className="flex items-center mt-2">
                  <Textarea 
                    placeholder="Add a comment..." 
                    className="min-h-[40px] max-h-[80px] resize-none flex-grow mr-2 focus-visible:ring-0"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <Button 
                    type="submit" 
                    variant="ghost" 
                    className="text-instagram-primary font-semibold py-2"
                    disabled={!commentText.trim()}
                  >
                    Post
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPost;
