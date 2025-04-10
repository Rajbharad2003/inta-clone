
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Camera } from "lucide-react";
import { profileApi } from "@/lib/api";
import { ChangePasswordForm } from "@/forms/changePassword";

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("editProfile");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string>("/lovable-uploads/a150a5b0-219e-4ef3-823b-d920528ef424.png");
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    website: "",
    bio: "",
    email: "",
    phone: "",
    gender: ""
  });

  useEffect(() => {
    // Fetch user data from localStorage first for immediate display
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setFormData({
          username: user.username || "",
          fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          website: user.website || "",
          bio: user.bio || "",
          email: user.email || "",
          phone: user.phone || "",
          gender: user.gender || ""
        });
        setLoading(false);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    // Then fetch fresh data from API
    const fetchProfile = async () => {
      try {
        const profile = await profileApi.getProfile();
        if (profile.profile && profile.profile.profilephoto) {
          setProfilePhoto(profile.profile.profilephoto);
        }

        setFormData({
          username: profile.user.username || "",
          fullName: `${profile.user.firstName || ""} ${profile.user.lastName || ""}`.trim(),
          website: profile.user.website || "",
          bio: profile.user.profile.bio || "",
          email: profile.user.email || "",
          phone: profile.user.phone || "",
          gender: profile.user.gender || ""
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error loading profile",
          description: "Failed to load your profile data. Using cached data instead.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    document.title = "Edit Profile • Instagram";
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      // Split fullName into firstName and lastName
      const nameParts = formData.fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Create updated profile data
      const profileData = {
        username: formData.username,
        firstName: firstName,
        lastName: lastName,
        website: formData.website,
        bio: formData.bio,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender
      };

      // Send update to API
      await profileApi.editProfile(profileData);

      // Update localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...userData,
        username: formData.username,
        firstName: firstName,
        lastName: lastName,
        website: formData.website,
        bio: formData.bio,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });

      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "An error occurred updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto pt-20 px-4">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="md:flex">
            {/* Left sidebar */}
            <div className="w-full md:w-1/4 border-r border-gray-200">
              <nav className="p-0">
                <ul>
                  <li className={`border-l-2 ${activeTab === "editProfile" ? "border-instagram-primary bg-gray-50" : "border-transparent"}`}>
                    <button
                      onClick={() => setActiveTab("editProfile")}
                      className="block w-full py-3 px-4 text-sm font-medium text-left"
                    >
                      Edit Profile
                    </button>
                  </li>
                  <li className={`border-l-2 ${activeTab === "changePassword" ? "border-instagram-primary bg-gray-50" : "border-transparent"}`}>
                    <button
                      onClick={() => setActiveTab("changePassword")}
                      className="block w-full py-3 px-4 text-sm text-left"
                    >
                      Change Password
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Main content */}
            <div className="w-full md:w-3/4 p-8">
            {activeTab === "editProfile" ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile picture */}
                <div className="flex items-center mb-6">
                  <div className="mr-8">
                    <img
                      src={profilePhoto}
                      alt="Profile"
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="font-medium">{formData.username}</h2>
                    <button
                      type="button"
                      className="text-instagram-primary text-sm font-semibold"
                    >
                      Change Profile Photo
                    </button>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-3 gap-4 items-center">
                  <label htmlFor="username" className="text-right font-medium">Username</label>
                  <div className="col-span-2">
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="max-w-md"
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label htmlFor="fullName" className="text-right font-medium">Name</label>
                  <div className="col-span-2">
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="max-w-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-start">
                  <label htmlFor="website" className="text-right font-medium">Website</label>
                  <div className="col-span-2">
                    <Input
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="max-w-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-start">
                  <label htmlFor="bio" className="text-right font-medium">Bio</label>
                  <div className="col-span-2">
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="max-w-md resize-none h-24"
                    />
                  </div>
                </div>

                <div className="col-span-3 border-t border-gray-200 pt-4"></div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label htmlFor="email" className="text-right font-medium">Email</label>
                  <div className="col-span-2">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="max-w-md"
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label htmlFor="phone" className="text-right font-medium">Phone Number</label>
                  <div className="col-span-2">
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="max-w-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label htmlFor="gender" className="text-right font-medium">Gender</label>
                  <div className="col-span-2">
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full max-w-md rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center mt-6">
                  <div className="col-span-1"></div>
                  <div className="col-span-2 flex space-x-4">
                    <Button
                      type="submit"
                      className="bg-instagram-primary hover:bg-instagram-primary/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
              ) : (
                <ChangePasswordForm />
              )
            }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
