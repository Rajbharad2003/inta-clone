import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { authApi } from "@/lib/api";
import { Instagram, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const SignIn = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState(true);
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
    
    document.title = "Instagram • Login";
  }, [navigate, from]);
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter your email/username and password.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Send login request to backend
      const response = await authApi.login(identifier, password);
      console.log("Login response:", response);
      
      if (response && response.success) {
        // Store the token from the response
        localStorage.setItem("authToken", response.token);
        
        if (response.user) {
          // Store the user data from the login response
          console.log("Setting user data from login response:", response.user);
          localStorage.setItem("user", JSON.stringify(response.user));
        } else {
          console.log("User data not found in login response, fetching separately");
          
          // Fetch user data separately
          try {
            const userData = await authApi.getUser();
            console.log("User data fetched separately:", userData);
            
            if (userData && userData.success && userData.user) {
              localStorage.setItem("user", JSON.stringify(userData.user));
            } else {
              console.error("Failed to fetch user data");
            }
          } catch (userError) {
            console.error("Error fetching user data:", userError);
          }
        }
        
        toast({
          title: "Sign in successful",
          description: "Welcome back to Instagram!",
        });
        
        // Redirect to the page they tried to visit or home
        navigate(from, { replace: true });
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Sign in failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setCredentials(false);
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
            <p>Sign in to see photos and videos from your friends</p>
            {!credentials && (
              <p className="text-red-500 text-sm mt-2">Invalid credentials. Please try again.</p>
            )}
          </div>
          
          {/* Sign In Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="email"
                  required
                  className="h-11"
                  placeholder="Email or username"
                  value={identifier}
                  onChange={(e) => {setIdentifier(e.target.value); setCredentials(true);}}
                />
              </div>
              <div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="h-11"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {setPassword(e.target.value); setCredentials(true);}}
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full h-11 bg-instagram-primary hover:bg-instagram-primary-dark"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full" />
                ) : (
                  <span className="flex items-center justify-center">
                    <Lock className="mr-2 h-4 w-4" />
                    Sign in
                  </span>
                )}
              </Button>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="border-t border-gray-200 w-full"></div>
              <div className="text-gray-500 text-sm mx-4">OR</div>
              <div className="border-t border-gray-200 w-full"></div>
            </div>
            
            <div className="flex flex-col space-y-4 items-center text-sm">
              <a href="#" className="text-instagram-primary font-semibold hover:underline">
                Forgot password?
              </a>
            </div>
          </form>
          
          {/* Sign Up Link */}
          <div className="mt-4 text-center text-sm">
            <p>
              Don't have an account?{" "}
              <Link to="/sign-up" className="text-instagram-primary font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
