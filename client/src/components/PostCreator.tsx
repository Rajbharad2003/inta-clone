
import { useState, useRef } from 'react';
import { Camera, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { postsApi } from '@/lib/api';

interface PostCreatorProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const PostCreator: React.FC<PostCreatorProps> = ({ onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPost = async () => {
    if (!selectedFile) {
      toast({
        title: "No image selected",
        description: "Please select an image to post",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('posturl', selectedFile);
      
      if (caption.trim()) {
        formData.append('caption', caption);
      }
      
      const response = await postsApi.createPost(formData);
      
      if (response.success) {
        toast({
          title: "Post created",
          description: "Your post has been published successfully!"
        });
        
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        throw new Error(response.message || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to create post",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Create Post</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left side - Image preview/uploader */}
          <div className="md:w-2/3 border-r flex items-center justify-center p-4 bg-gray-50 overflow-auto">
            {preview ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  src={preview} 
                  alt="Post preview" 
                  className="max-w-full max-h-full object-contain"
                />
                <button 
                  onClick={clearSelectedFile}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div 
                className="w-full h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100"
                onClick={triggerFileInput}
              >
                <Image className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">Click to upload an image for your post</p>
                <Button variant="outline" className="mt-4">
                  Select from computer
                </Button>
              </div>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*"
            />
          </div>
          
          {/* Right side - Caption and controls */}
          <div className="md:w-1/3 flex flex-col p-4">
            <div className="flex-1 mb-4">
              <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2">
                Write a caption
              </label>
              <Textarea
                id="caption"
                placeholder="Write a caption..."
                className="min-h-[120px]"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleUploadPost}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? "Posting..." : "Share"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCreator;
