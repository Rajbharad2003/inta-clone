
import { useState, useEffect } from "react";
import { X, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatApi, messageApi } from "@/lib/api";

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId: string;
  receiverName: string;
  receiverImage?: string;
}

const SendMessageModal = ({
  isOpen,
  onClose,
  receiverId,
  receiverName,
  receiverImage
}: SendMessageModalProps) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Prevent scrolling on body when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !receiverId) return;
    
    try {
      setSending(true);
      
      // First, create or access a chat with this user
      const chatResponse = await chatApi.accessChat(receiverId);
      
      if (chatResponse && chatResponse.chat) {
        // Now send a message in this chat
        await messageApi.sendMessage(message.trim(), chatResponse.chat._id);
        
        toast({
          title: "Message sent",
          description: "Your message has been sent successfully.",
        });
        
        // Reset form and close modal
        setMessage("");
        onClose();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in duration-300">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="font-semibold">New Message</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Recipient */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage
                src={receiverImage || "/lovable-uploads/a150a5b0-219e-4ef3-823b-d920528ef424.png"}
                alt={receiverName}
              />
              <AvatarFallback>{receiverName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{receiverName}</p>
            </div>
          </div>
        </div>
        
        {/* Message Form */}
        <form onSubmit={handleSendMessage} className="p-4">
          <Textarea
            placeholder="Write your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px] resize-none mb-4 focus-visible:ring-0"
            disabled={sending}
          />
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-instagram-primary hover:bg-instagram-primary/90"
              disabled={!message.trim() || sending}
            >
              {sending ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                  Sending...
                </div>
              ) : (
                <div className="flex items-center">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendMessageModal;
