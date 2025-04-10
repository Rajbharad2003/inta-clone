
import { useState, useRef } from 'react';
import { Camera, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { storiesApi } from '@/lib/api';

interface StoryCreatorProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const StoryCreator: React.FC<StoryCreatorProps> = ({ onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
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

  const handleUploadStory = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('posturl', selectedFile);
      formData.append('mediaType', 'image');
      
      const response = await storiesApi.createStory(formData);
      
      if (response.success) {
        toast({
          title: "Story uploaded",
          description: "Your story has been uploaded successfully!"
        });
        
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        throw new Error(response.error || "Failed to upload story");
      }
    } catch (error) {
      console.error("Error uploading story:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload story",
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
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Create Story</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {preview ? (
            <div className="relative">
              <img 
                src={preview} 
                alt="Story preview" 
                className="w-full h-auto rounded-lg"
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
              className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 bg-gray-50"
              onClick={triggerFileInput}
            >
              <Image className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Click to upload an image</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG files only</p>
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
        
        <div className="border-t p-4 flex justify-between">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          
          <div className="flex gap-2">
            {!preview && (
              <Button
                variant="outline"
                onClick={triggerFileInput}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Select Image
              </Button>
            )}
            
            <Button
              onClick={handleUploadStory}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? "Uploading..." : "Share Story"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryCreator;
