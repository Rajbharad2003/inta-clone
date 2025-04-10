import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { authApi } from "@/lib/api";
import { Instagram, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  
  useEffect(() => {
    // If user is already logged in, redirect them
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      navigate(from, { replace: true });
    }
    
    document.title = "Instagram • Sign Up";
  }, [navigate, from]);
  
  const validateStep1 = () => {
    if (!firstName || !lastName || !email) {
      toast({
        title: "Missing fields",
        description: "Please fill in all the required fields.",
        variant: "destructive",
      });
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const validateStep2 = () => {
    if (!username) {
      toast({
        title: "Missing username",
        description: "Please enter a username.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!password || !confirmPassword) {
      toast({
        title: "Missing password",
        description: "Please enter and confirm your password.",
        variant: "destructive",
      });
      return false;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return false;
    }
    
    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const handleSendOtp = async () => {
    if (!validateStep1()) return;
    
    setLoading(true);
    
    try {
      // Send OTP to email
      await authApi.sendOtp(email);
      
      setOtpSent(true);
      
      toast({
        title: "OTP sent",
        description: "A verification code has been sent to your email.",
      });
      
      // Move to step 2
      setStep(2);
    } catch (error: any) {
      toast({
        title: "Failed to send OTP",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    if (!otp) {
      toast({
        title: "OTP required",
        description: "Please enter the verification code sent to your email.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Send sign up request to backend
      const response = await authApi.signup({
        firstName,
        lastName,
        email,
        username,
        password,
        otp
      });
      
      // Store token and user data in localStorage
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      
      toast({
        title: "Account created",
        description: "Welcome to Instagram! Your account has been created successfully.",
      });
      
      // Redirect to home page
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const resendOtp = async () => {
    setLoading(true);
    
    try {
      // Resend OTP to email
      await authApi.sendOtp(email);
      
      toast({
        title: "OTP resent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend OTP",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-grow items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center">
            <Instagram className="h-12 w-12 text-black mb-1" />
            <h2 className="text-2xl font-serif tracking-wide text-center">Instagram</h2>
            <p className="mt-2 text-gray-600 text-center">
              Sign up to see photos and videos from your friends.
            </p>
          </div>
          
          {/* Sign Up Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
            {step === 1 ? (
              /* Step 1: Basic Info */
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <div className="w-1/2">
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className="h-11"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="w-1/2">
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className="h-11"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="h-11"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <Button
                  type="button"
                  className="w-full h-11 bg-instagram-primary hover:bg-instagram-primary-dark"
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full" />
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            ) : (
              /* Step 2: Username and Password */
              <div className="space-y-4">
                <div>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className="h-11"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="h-11"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="h-11"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    className="h-11"
                    placeholder="Verification Code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the verification code sent to your email.{" "}
                    <button
                      type="button"
                      className="text-instagram-primary"
                      onClick={resendOtp}
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Resend"}
                    </button>
                  </p>
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-11 bg-instagram-primary hover:bg-instagram-primary-dark"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full" />
                  ) : (
                    <span className="flex items-center justify-center">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Sign up
                    </span>
                  )}
                </Button>
                
                <button
                  type="button"
                  className="text-instagram-primary font-semibold text-sm mt-2 w-full text-center"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Back
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-center">
              <div className="border-t border-gray-200 w-full"></div>
              <div className="text-gray-500 text-sm mx-4">OR</div>
              <div className="border-t border-gray-200 w-full"></div>
            </div>
          </form>
          
          {/* Sign In Link */}
          <div className="mt-4 text-center text-sm">
            <p>
              Have an account?{" "}
              <Link to="/sign-in" className="text-instagram-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
