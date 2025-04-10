
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Camera, Image, Plus } from "lucide-react";
import StoryCreator from "./StoryCreator";
import PostCreator from "./PostCreator";

interface ImagePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ImagePostModal: React.FC<ImagePostModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState("post");
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [showPostCreator, setShowPostCreator] = useState(false);

  const handleClose = () => {
    // Reset state
    setActiveTab("post");
    setShowStoryCreator(false);
    setShowPostCreator(false);
    onClose();
  };

  const handleCreateStory = () => {
    setShowStoryCreator(true);
  };

  const handleCreatePost = () => {
    setShowPostCreator(true);
  };

  const handleStoryCreatorClose = () => {
    setShowStoryCreator(false);
  };

  const handlePostCreatorClose = () => {
    setShowPostCreator(false);
  };

  const handleStorySuccess = () => {
    if (onSuccess) onSuccess();
    setShowStoryCreator(false);
    handleClose();
  };

  const handlePostSuccess = () => {
    if (onSuccess) onSuccess();
    setShowPostCreator(false);
    handleClose();
  };

  if (showStoryCreator) {
    return <StoryCreator onClose={handleStoryCreatorClose} onSuccess={handleStorySuccess} />;
  }

  if (showPostCreator) {
    return <PostCreator onClose={handlePostCreatorClose} onSuccess={handlePostSuccess} />;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="post">Post</TabsTrigger>
            <TabsTrigger value="story">Story</TabsTrigger>
          </TabsList>
          
          <TabsContent value="post" className="space-y-4">
            <div 
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer"
              onClick={handleCreatePost}
            >
              <Image className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Share photos with your followers</p>
              <Button className="mt-4" type="button">
                <Plus className="mr-2 h-4 w-4" /> Create New Post
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="story" className="space-y-4">
            <div 
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg
              cursor-pointer"
              onClick={handleCreateStory}
            >
              <Camera className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Share moments that disappear after 24 hours</p>
              <Button className="mt-4" type="button">
                <Plus className="mr-2 h-4 w-4" /> Create New Story
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePostModal;
