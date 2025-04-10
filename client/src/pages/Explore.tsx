
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import ExploreGrid from "@/components/ExploreGrid";

const Explore = () => {
  useEffect(() => {
    document.title = "Explore • Instagram";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-screen-xl mx-auto pt-24 px-4 md:px-8">
        <ExploreGrid />
      </div>
    </div>
  );
};

export default Explore;
