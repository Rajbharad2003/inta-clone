import { useToast } from "@/components/ui/use-toast";
import { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ProtectedRoute from './utils/ProtectedRoute';
import { authApi } from './lib/api';
import EditProfile from './pages/EditProfile';
import Index from './pages/Index';
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Search from './pages/Search';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ViewPost from './pages/ViewPost';
import ViewProfile from './pages/ViewProfile';

function App() {
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authApi.getUser();
        if (response && response.user) {
          localStorage.setItem('authToken', response.user._id);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      } catch (error: any) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        toast({
          title: "Authentication Failed",
          description: "Please login again.",
          variant: "destructive",
        });
      }
    };

    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      checkAuth();
    }
  }, [toast]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/user/:id" element={
          <ProtectedRoute>
            <ViewProfile />
          </ProtectedRoute>
        } />
        <Route path="/post/:id" element={
          <ProtectedRoute>
            <ViewPost />
          </ProtectedRoute>
        } />
        <Route path="/edit-profile" element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />
        <Route path="/search" element={
          <ProtectedRoute>
            <Search />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
