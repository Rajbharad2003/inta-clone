
import { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Heart, Send, MoreHorizontal, Image } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { IStory } from "@/lib/models";
import { storiesApi } from "@/lib/api";

interface StoryItem {
  id: string;
  imageUrl: string;
  username: string;
  timestamp: string;
  userAvatar: string;
  storyId: string;
  userId: string;
}

interface StoryViewProps {
  stories: StoryItem[];
  initialIndex?: number;
  onClose: () => void;
}

const StoryView: React.FC<StoryViewProps> = ({ stories, initialIndex = 0, onClose }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [comment, setComment] = useState("");
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  const currentStory = stories[currentStoryIndex];
  
  // Mark story as viewed when it's displayed
  const markStoryAsViewed = useCallback(async (storyId: string) => {
    try {
      await storiesApi.ViewStory(storyId);
    } catch (error) {
      console.error("Error marking story as viewed:", error);
    }
  }, []);
  
  // Reset progress when story changes
  useEffect(() => {
    if (!currentStory) return;
    
    setProgress(0);
    markStoryAsViewed(currentStory.storyId);
    
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    if (!isPaused) {
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            nextStory();
            return 0;
          }
          return prev + 0.5;
        });
      }, 30);
    }
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentStoryIndex, isPaused, currentStory]);
  
  const pauseStory = () => {
    setIsPaused(true);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };
  
  const resumeStory = () => {
    setIsPaused(false);
  };
  
  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      onClose();
    }
  };
  
  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };
  
  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      toast({
        title: "Comment sent",
        description: `You replied to ${currentStory.username}'s story`,
      });
      setComment("");
      resumeStory();
    }
  };

  // Handle mouse events to pause/resume
  const handleMouseDown = () => pauseStory();
  const handleMouseUp = () => resumeStory();
  
  if (!currentStory) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      {/* Close button */}
      <button 
        className="absolute top-4 right-4 text-white z-50" 
        onClick={onClose}
      >
        <X className="h-8 w-8" />
      </button>
      
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 p-4 flex space-x-1">
        {stories.map((_, index) => (
          <div 
            key={index}
            className="h-1 bg-white bg-opacity-30 flex-1 rounded-full overflow-hidden"
          >
            <div 
              className="h-full bg-white rounded-full transition-all duration-300 ease-linear"
              style={{ 
                width: index < currentStoryIndex 
                  ? '100%' 
                  : index === currentStoryIndex 
                    ? `${progress}%` 
                    : '0%' 
              }}
            ></div>
          </div>
        ))}
      </div>
      
      {/* Story content with transition */}
      <div className="w-full max-w-md relative">
        <div 
          className="w-full h-[80vh] bg-black rounded-lg overflow-hidden relative"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
        >
          <img 
            src={currentStory.imageUrl} 
            alt="Story"
            className="w-full h-full object-contain" 
          />
          
          {/* User info */}
          <div className="absolute top-4 left-4 flex items-center z-20">
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white mr-3">
              <img 
                src={currentStory.userAvatar}
                alt={currentStory.username}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-white font-semibold">{currentStory.username}</p>
              <p className="text-white text-xs opacity-70">{currentStory.timestamp}</p>
            </div>
          </div>
          
          {/* Navigation */}
          <button 
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white opacity-70 hover:opacity-100"
            onClick={prevStory}
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          
          <button 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white opacity-70 hover:opacity-100"
            onClick={nextStory}
          >
            <ChevronRight className="h-8 w-8" />
          </button>
          
          {/* Reply input */}
          <div className="absolute bottom-4 left-4 right-4">
            <form 
              onSubmit={handleSendComment}
              className="flex items-center bg-black bg-opacity-30 rounded-full overflow-hidden border border-white border-opacity-20"
              onClick={() => pauseStory()}
            >
              <input 
                type="text" 
                placeholder="Reply to story..." 
                className="flex-1 bg-transparent text-white border-none outline-none pl-4 py-2"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onBlur={() => !comment && resumeStory()}
              />
              <button 
                type="submit" 
                className="px-4 py-2 text-white"
                disabled={!comment.trim()}
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryView;
