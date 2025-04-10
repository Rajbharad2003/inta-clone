
import { Link, useNavigate } from "react-router-dom";
import { 
  Home, Search, PlusSquare, Heart, MessageCircle, Compass, User, LogOut
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { profileApi } from "@/lib/api";
import { IUser } from "@/lib/models";
import ImagePostModal from "./ImagePostModal";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<IUser | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string>("/lovable-uploads/a150a5b0-219e-4ef3-823b-d920528ef424.png");
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Fetch profile to get the updated profile photo
        fetchUserProfile(parsedUser._id);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);
  
  const fetchUserProfile = async (userId: string) => {
    try {
      const profileData = await profileApi.getProfile();
      if (profileData.success && profileData.profile) {
        // Update profile photo if available
        if (profileData.profile.profilephoto) {
          setProfilePhoto(profileData.profile.profilephoto);
        }
      }
    } catch (error) {
      console.error("Error fetching profile photo:", error);
    }
  };
  
  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('currentUserId');
    
    toast.success("Signed out successfully");
    navigate("/sign-in");
  };
  
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-gray-200 bg-white z-50">
      <div className="h-full max-w-screen-xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="shrink-0">
          <h1 className="text-2xl font-serif tracking-wide insta-fade-in">Instagram</h1>
        </Link>
        
        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:block w-72 relative animate-fade-in">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input 
            type="search" 
            placeholder="Search" 
            className="pl-10 bg-gray-100 border-none h-9 rounded-lg w-full focus-visible:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        
        {/* Navigation Icons */}
        <nav className="flex items-center space-x-5">
          <Link to="/" className="insta-icon-btn hidden sm:block">
            <Home className="h-6 w-6" />
          </Link>
          <Link to="/messages" className="insta-icon-btn hidden sm:block">
            <MessageCircle className="h-6 w-6" />
          </Link>
          <button onClick={handleOpenCreateModal} className="insta-icon-btn">
            <PlusSquare className="h-6 w-6" />
          </button>
          <Link to="/explore" className="insta-icon-btn hidden sm:block">
            <Compass className="h-6 w-6" />
          </Link>
          <Link to="/activity" className="insta-icon-btn hidden sm:block">
            <Heart className="h-6 w-6" />
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="insta-icon-btn">
              <div className="rounded-full h-8 w-8 bg-gradient-to-tr from-yellow-400 to-purple-600 p-0.5">
                <img 
                  src={profilePhoto} 
                  alt="Profile" 
                  className="rounded-full h-full w-full object-cover border-2 border-white"
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/edit-profile" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  Edit Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer text-red-500">
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
      
      {/* Create Post Modal */}
      <ImagePostModal isOpen={isCreateModalOpen} onClose={handleCloseCreateModal} />
    </header>
  );
};

export default Navbar;
