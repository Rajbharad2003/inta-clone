
import Navbar from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { profileApi } from "@/lib/api";
import { IUser } from "@/lib/models";
import { Loader2, Search as SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Search = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Search • Instagram";
  }, []);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    } else {
      setResults([]);
    }
  }, [searchParams]);

  const performSearch = async (query: string) => {
    try {
      setLoading(true);
      const response = await profileApi.searchUsers(query);
      if (response && response.users) {
        setResults(response.users);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/user/${userId}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto pt-20 px-4">
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              className="pl-10 h-12 focus-visible:ring-0 border-gray-200"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : searchQuery.trim() === "" ? (
            <div className="py-8 text-center text-gray-500">
              Search for users to connect with
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No results found for "{searchQuery}"
            </div>
          ) : (
            <div>
              {results.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleUserClick(user._id)}
                >
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage
                      src={user.profile?.profilephoto || "/lovable-uploads/a150a5b0-219e-4ef3-823b-d920528ef424.png"}
                      alt={user.username}
                    />
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{user.username}</h3>
                    <p className="text-sm text-gray-500">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
