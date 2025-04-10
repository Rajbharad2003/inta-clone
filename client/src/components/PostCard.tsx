
import { useState } from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { postsApi } from "@/lib/api";
import SendMessageModal from "./SendMessageModal";

interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
}

interface PostCardProps {
  username: string;
  userImage: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  timeAgo: string;
  postComments?: Comment[];
  id?: string;
  userId?: string;
}

const PostCard: React.FC<PostCardProps> = ({
  username,
  userImage,
  image,
  caption,
  likes,
  comments,
  timeAgo,
  postComments = [],
  id,
  userId
}) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [commentsList, setCommentsList] = useState<Comment[]>(postComments);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [likesCount, setLikesCount] = useState(likes);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Check if post is liked on mount
  useState(() => {
    const checkLikeStatus = async () => {
      if (id) {
        try {
          const response = await postsApi.getLikePost(id);
          setLiked(response.isLiked);
        } catch (error) {
          console.error("Error checking like status:", error);
        }
      }
    };
    
    // Check if post is saved on mount
    const checkSaveStatus = async () => {
      if (id) {
        try {
          const response = await postsApi.checkSavedPost(id);
          setSaved(response.isSaved);
        } catch (error) {
          console.error("Error checking save status:", error);
        }
      }
    };
    
    checkLikeStatus();
    checkSaveStatus();
  });
  
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
  
  const handleImageLoad = () => {
    setIsLoading(false);
  };
  
  const truncatedCaption = caption.length > 100 && !showFullCaption 
    ? `${caption.substring(0, 100)}...` 
    : caption;
    
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;
    
    try {
      // Send comment to API
      await postsApi.commentPost(id, commentText.trim());
      
      // Get current user for the comment
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : { username: "user" };
      
      // Add comment to local state
      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        username: user.username,
        text: commentText.trim(),
        timestamp: "Just now"
      };
      
      setCommentsList([...commentsList, newComment]);
      setCommentText("");
      
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
  
  const toggleComments = () => {
    setShowComments(!showComments);
  };
  
  const handleViewPost = () => {
    if (id) {
      navigate(`/post/${id}`);
    }
  };
  
  const handleSendMessage = () => {
    if (userId) {
      setIsMessageModalOpen(true);
    } else {
      toast({
        title: "Unable to send message",
        description: "User information is unavailable.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <>
      <div className="border border-gray-200 rounded-lg bg-white mb-6 overflow-hidden animate-slide-in">
        {/* Post Header */}
        <div className="flex items-center justify-between p-3">
          <Link to={`/user/${userId || username}`} className="flex items-center space-x-3">
            <div className="story-circle w-10 h-10">
              <img 
                src={userImage} 
                alt={username} 
                className="rounded-full w-full h-full object-cover border-2 border-white"
              />
            </div>
            <span className="font-semibold">{username}</span>
          </Link>
          <button className="insta-icon-btn">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
        
        {/* Post Image */}
        <div className="relative bg-gray-100 aspect-square">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse-light h-full w-full bg-gray-200"></div>
            </div>
          )}
          <img 
            src={image} 
            alt="Post" 
            className={`w-full h-full object-cover transition-opacity duration-300 cursor-pointer ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={handleImageLoad}
            onDoubleClick={handleLike}
            onClick={handleViewPost}
          />
        </div>
        
        {/* Post Actions */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-4">
              <button onClick={handleLike} className="insta-icon-btn">
                <Heart 
                  className={`h-6 w-6 ${liked ? 'fill-instagram-red text-instagram-red like-animation' : ''}`} 
                />
              </button>
              <button className="insta-icon-btn" onClick={toggleComments}>
                <MessageCircle className="h-6 w-6" />
              </button>
              <button className="insta-icon-btn" onClick={handleSendMessage}>
                <Send className="h-6 w-6" />
              </button>
            </div>
            <button onClick={handleSave} className="insta-icon-btn">
              <Bookmark className={`h-6 w-6 ${saved ? 'fill-black' : ''}`} />
            </button>
          </div>
          
          {/* Likes */}
          <div className="font-semibold mb-1">{likesCount.toLocaleString()} likes</div>
          
          {/* Caption */}
          <div className="mb-1">
            <span className="font-semibold mr-2">{username}</span>
            <span>{truncatedCaption}</span>
            {caption.length > 100 && (
              <button 
                className="text-instagram-gray ml-1 text-sm"
                onClick={() => setShowFullCaption(!showFullCaption)}
              >
                {showFullCaption ? 'less' : 'more'}
              </button>
            )}
          </div>
          
          {/* View Comments Link */}
          <button 
            className="text-instagram-gray text-sm"
            onClick={id ? handleViewPost : toggleComments}
          >
            {showComments ? "Hide comments" : `View all ${comments + commentsList.length} comments`}
          </button>
          
          {/* Comments Section */}
          {showComments && (
            <div className="mt-2 max-h-40 overflow-y-auto">
              {commentsList.map((comment) => (
                <div key={comment.id} className="mb-2">
                  <span className="font-semibold mr-2">{comment.username}</span>
                  <span>{comment.text}</span>
                  <div className="text-xs text-instagram-gray mt-1">{comment.timestamp}</div>
                </div>
              ))}
            </div>
          )}
          
          {/* Time */}
          <div className="text-instagram-gray text-xs mt-1">{timeAgo}</div>
        </div>
        
        {/* Add Comment */}
        <form onSubmit={handleAddComment} className="flex items-center border-t border-gray-200 px-3 py-2">
          <input 
            type="text" 
            placeholder="Add a comment..." 
            className="flex-grow text-sm outline-none"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button 
            type="submit" 
            className={`text-instagram-primary font-semibold text-sm ${!commentText.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            disabled={!commentText.trim()}
          >
            Post
          </button>
        </form>
      </div>
      
      {/* Message Modal */}
      {isMessageModalOpen && (
        <SendMessageModal 
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          receiverId={userId || ""}
          receiverName={username}
          receiverImage={userImage}
        />
      )}
    </>
  );
};

export default PostCard;
