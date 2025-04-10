
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    document.title = "Page Not Found • Instagram";
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-screen-xl mx-auto pt-32 px-4 md:px-8 flex flex-col items-center">
        <h1 className="text-5xl font-light mb-6">Sorry, this page isn't available.</h1>
        <p className="text-lg text-instagram-gray mb-8">
          The link you followed may be broken, or the page may have been removed.
        </p>
        <Link to="/">
          <Button className="bg-instagram-primary hover:bg-instagram-primary/90 text-white">
            Go back to Instagram
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
