
import { useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";

interface StoryCircleProps {
  image: string;
  username: string;
  viewed?: boolean;
  isOwn?: boolean;
  hasActiveStory?: boolean;
  onClick?: () => void;
}

const StoryCircle: React.FC<StoryCircleProps> = ({
  image,
  username,
  viewed = false,
  isOwn = false,
  hasActiveStory = false,
  onClick
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100 * Math.random());
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div 
      className={`flex flex-col items-center space-y-1 cursor-pointer transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClick}
    >
      <div className={`${viewed ? 'story-circle viewed' : (hasActiveStory ) ? 'story-circle' : ''}`}>
        <div className="w-16 h-16 relative">
          <img 
            src={image} 
            alt={username} 
            className={`rounded-full w-full h-full object-cover ${(hasActiveStory) ? 'border-2 border-white' : ''}`}
          />
          {isOwn && (
            <div className="absolute bottom-0 right-0 bg-instagram-primary text-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
              <PlusIcon className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
      <span className="text-xs truncate max-w-16">{username}</span>
    </div>
  );
};

export default StoryCircle;
