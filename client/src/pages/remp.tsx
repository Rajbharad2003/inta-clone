import ImagePostModal from "@/components/ImagePostModal";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import ProfileSidebar from "@/components/ProfileSidebar";
import StoryCircle from "@/components/StoryCircle";
import StoryView from "@/components/StoryView";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { postsApi, storiesApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface StoryUser {
  username: string;
  image: string;
  viewed: boolean;
  isOwn?: boolean;
  userId: string;
  hasActiveStory: boolean;
  latestStoryTimestamp?: number;
}

interface StoryItem {
  id: string;
  imageUrl: string;
  username: string;
  timestamp: string;
  userAvatar: string;
  storyId: string;
  userId: string;
}

const Index = () => {
  const [userData, setUserData] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  // const [dropdownTriggerRef, setDropdownTriggerRef] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        setUserData(JSON.parse(user));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const { data: posts = [], isLoading: postsLoading, refetch: refetchPosts } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      try {
        const response = await postsApi.getAllPosts();
        return Array.isArray(response.posts) ? response.posts : [];
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast({
          title: "Error loading posts",
          description: "Failed to load posts. Please refresh the page.",
          variant: "destructive",
        });
        return [];
      }
    }
  });

  const { data: stories = [], isLoading: storiesLoading, refetch: refetchStories } = useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
      try {
        const response = await storiesApi.getAllStories();
        console.log("story response : ", response.stories);
        console.log(typeof (response.stories));
        console.log(Array.isArray(response.stories));

        return Array.isArray(response.stories) ? response.stories : [];
      } catch (error) {
        console.error("Error fetching stories:", error);
        return [];
      }
    }
  });

  // Get user's own stories
  const { data: userStories = [], refetch: refetchUserStories } = useQuery({
    queryKey: ['userStories'],
    queryFn: async () => {
      if (!userData) return [];
      try {
        const response = await storiesApi.getUserStories();
        // console.log(response);

        if (response.success) {

          console.log("user own story response : ", response.story);
          console.log(typeof (response.story));
          console.log(Array.isArray(response.story));
          return Array.isArray(response.story) ? response.story : [];
        }
        else {
          return [];
        }
      } catch (error) {
        console.error("Error fetching user stories:", error);
        return [];
      }
    },
    enabled: !!userData
  });

  const [storyUsers, setStoryUsers] = useState<StoryUser[]>([]);

  useEffect(() => {

    if (!storyUsers)
      return;

    console.log("storyUsers useEffect : ", storyUsers);

  }, [storyUsers]);

  // First useEffect for story users
  useEffect(() => {
    if (!userData || stories.length === 0 || userStories.length === 0) return;

    // Start with user's own story circle
    const hasOwnActiveStory = userStories && userStories.length > 0;
    const transformedStories: StoryUser[] = [
      {
        username: userData.username,
        image: userData.profile?.profilephoto,
        viewed: false,
        isOwn: true,
        userId: userData._id,
        hasActiveStory: hasOwnActiveStory
      }
    ];

    // Add stories from other users the current user follows
    if (stories && stories.length > 0) {
      const storyUserMap = new Map<string, StoryUser>();

      // First pass: collect all stories and their viewed status
      stories.forEach((story: any) => {
        if (story.user && story.user._id !== userData._id) {
          const hasViewed = story.viewers.some(viewer => viewer.viewerId.toString() === userData._id.toString());

          if (!storyUserMap.has(story.user._id)) {
            storyUserMap.set(story.user._id, {
              username: story.user.username || "user",
              image: story.user.profile?.profilephoto || "/placeholder.svg",
              viewed: hasViewed,
              userId: story.user._id,
              hasActiveStory: true,
              latestStoryTimestamp: new Date(story.createdAt).getTime()
            });
          } else {
            // If user has multiple stories, update viewed status if any story is unviewed
            const existingUser = storyUserMap.get(story.user._id)!;
            if (!hasViewed) {
              existingUser.viewed = false;
            }
            // Update latest story timestamp if this story is newer
            const storyTimestamp = new Date(story.createdAt).getTime();
            if (storyTimestamp > existingUser.latestStoryTimestamp!) {
              existingUser.latestStoryTimestamp = storyTimestamp;
            }
          }
        }
      });

      // Convert map to array and sort by viewed status and timestamp
      const otherUsers = Array.from(storyUserMap.values())
        .sort((a, b) => {
          // First sort by viewed status (unviewed first)
          if (a.viewed !== b.viewed) {
            return a.viewed ? 1 : -1;
          }
          // Then sort by latest story timestamp (newest first)
          return (b.latestStoryTimestamp || 0) - (a.latestStoryTimestamp || 0);
        });

      transformedStories.push(...otherUsers);
    }

    // console.log("transformedStories 222 : ", transformedStories);

    // setStoryUsers(transformedStories);
    setStoryUsers((prevUsers) => {
      if (JSON.stringify(prevUsers) !== JSON.stringify(transformedStories)) {
        return transformedStories;
      }
      return prevUsers;
    });

  }, [stories, userData, userStories]);

  const [storyItems, setStoryItems] = useState<StoryItem[]>([]);

  // Second useEffect for story items
  useEffect(() => {
    if (!stories.length || !userData) return;

    // First, prepare user's own stories
    const ownStories = userStories
      .map((story: any) => {
        const createdAt = new Date(story.createdAt).getTime();
        return {
          id: story._id || `story-${Math.random()}`,
          storyId: story._id,
          imageUrl: story.mediaUrl || "/placeholder.svg",
          username: userData.username,
          timestamp: new Date(createdAt).toLocaleString(),
          userAvatar: userData.profile?.profilephoto || "/placeholder.svg",
          userId: userData._id,
          createdAt,
          viewed: false // User's own stories are always unviewed
        };
      })
      .sort((a, b) => a.createdAt - b.createdAt); // Sort by newest first

    // Then prepare other users' stories
    const otherStories = stories
      .filter((story: any) => story.user && story.user._id !== userData._id)
      .map((story: any) => {
        const createdAt = new Date(story.createdAt).getTime();
        return {
          id: story._id || `story-${Math.random()}`,
          storyId: story._id,
          imageUrl: story.mediaUrl || "/placeholder.svg",
          username: story.user?.username || "user",
          timestamp: new Date(createdAt).toLocaleString(),
          userAvatar: story.user?.profile?.profilephoto || "/placeholder.svg",
          userId: story.user?._id,
          createdAt,
          viewed: story.viewers.some(viewer => viewer.viewerId.toString() === userData._id.toString())
        };
      })
      .sort((a, b) => {
        // First sort by viewed status (unviewed first)
        if (a.viewed !== b.viewed) {
          return a.viewed ? 1 : -1;
        }
        // Then sort by timestamp (newest first)
        return a.createdAt - b.createdAt;
      });

    // Combine own stories with other stories
    // setStoryItems([...ownStories, ...otherStories]);
    setStoryItems((prevItems) => {
      const newItems = [...ownStories, ...otherStories];
      if (JSON.stringify(prevItems) !== JSON.stringify(newItems)) {
        return newItems;
      }
      return prevItems;
    });

  }, [stories, userData, userStories]);

  const [isStoryViewOpen, setIsStoryViewOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [selectedStoryUserId, setSelectedStoryUserId] = useState<string | null>(null);
  const [isImagePostModalOpen, setIsImagePostModalOpen] = useState(false);

  // Update handleStoryClick to prevent unnecessary re-renders
  const handleStoryClick = useCallback((index: number) => {
    const clickedUser = storyUsers[index];

    if (clickedUser.hasActiveStory) {
      setSelectedStoryUserId(clickedUser.userId);

      const storyIndex = storyItems.findIndex(item => item.userId === clickedUser.userId);

      if (storyIndex !== -1) {
        setSelectedStoryIndex(storyIndex);
        setIsStoryViewOpen(true);

        // Mark as viewed in the UI
        setStoryUsers(prevUsers => {
          const updatedUsers = [...prevUsers];
          updatedUsers[index].viewed = true;
          return updatedUsers;
        });
      }
    }
  }, [storyUsers, storyItems]);

  const handleViewOwnStory = (index: number) => {
    if (userData) {
      const storyIndex = storyItems.findIndex(item => item.userId === userData._id);
      if (storyIndex !== -1) {
        setSelectedStoryIndex(storyIndex);
        setSelectedStoryUserId(userData._id);
        setIsStoryViewOpen(true);
      }
    }
  };

  const handleCreateNewStory = () => {
    setIsImagePostModalOpen(true);
  };

  const handlePostSuccess = () => {
    // Refetch posts and stories after successful upload
    refetchPosts();
    refetchStories();
    refetchUserStories();
    navigate("/profile");
  };

  if (postsLoading || storiesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-instagram-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  // Prepare story circles to display
  const displayStoryUsers = storyUsers.length > 0 ? storyUsers : (userData ? [
    {
      username: userData.username,
      image: userData.profile?.profilephoto,// || "/placeholder.svg", 
      viewed: false,
      isOwn: true,
      userId: userData._id,
      hasActiveStory: false
    }
  ] : [{
    username: "your story",
    image: "/placeholder.svg",
    viewed: false,
    isOwn: true,
    userId: "",
    hasActiveStory: false
  }]);

  const displayPosts = posts.map((post: any) => ({
    id: post._id,
    username: post.user?.username || "unknown",
    userId: typeof post.user === 'string' ? post.user : post.user?._id,
    userImage: post.user?.profile?.profilephoto || "/placeholder.svg",
    image: post.posturl || "/placeholder.svg",
    caption: post.caption || "",
    likes: post.like?.length || 0,
    comments: post.comment?.length || 0,
    timeAgo: post.createdAt ? new Date(post.createdAt).toLocaleString() : "1 HOUR AGO",
    postComments: (post.comment || []).map((comment: any) => ({
      id: comment._id,
      username: comment.user?.username || "unknown",
      text: comment.comment || "",
      timestamp: comment.updatedAt ? new Date(comment.updatedAt).toLocaleString() : "now"
    }))
  }));

  // Filter stories to show only those from the selected user if viewing stories
  const filteredStoryItems = selectedStoryUserId
    ? storyItems.filter(item => item.userId === selectedStoryUserId)
    : storyItems;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-screen-xl mx-auto pt-20 px-4 md:px-8 flex">
        <div className="w-full lg:w-2/3 xl:w-3/5 mx-auto lg:mx-0">
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex space-x-5 overflow-x-auto pb-2 custom-scrollbar">

              {displayStoryUsers.map((user, index) => (
                <div key={index} className="relative">
                  {(user.isOwn) ?
                    (
                      (user.hasActiveStory)
                        ?
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <StoryCircle
                              username={user.username}
                              image={user.image}
                              viewed={user.viewed}
                              isOwn={user.isOwn}
                              hasActiveStory={user.hasActiveStory}
                            // onClick={() => handleStoryClick(index)}
                            />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => handleStoryClick(index)}>
                              View Story
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleCreateNewStory}>
                              Create New Story
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        :
                        (
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <StoryCircle
                                username={user.username}
                                image={user.image}
                                viewed={user.viewed}
                                isOwn={user.isOwn}
                                hasActiveStory={user.hasActiveStory}
                              // onClick={() => handleStoryClick(index)}
                              />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem onClick={handleCreateNewStory}>
                                Create New Story
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )
                    )
                    :
                    <StoryCircle
                      username={user.username}
                      image={user.image}
                      viewed={user.viewed}
                      isOwn={user.isOwn}
                      hasActiveStory={user.hasActiveStory}
                      onClick={() => handleStoryClick(index)}
                    />
                  }

                </div>
              ))}
            </div>
          </div>

          <div>
            {displayPosts.length > 0 ? (
              displayPosts.map((post: any) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  username={post.username}
                  userId={post.userId}
                  userImage={post.userImage}
                  image={post.image}
                  caption={post.caption}
                  likes={post.likes}
                  comments={post.comments}
                  timeAgo={post.timeAgo}
                  postComments={post.postComments}
                />
              ))
            ) : (
              <div className="text-center py-10 bg-white border border-gray-200 rounded-lg">
                <p className="text-gray-500">No posts found. Follow people to see their posts.</p>
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/3 xl:w-2/5 lg:pl-8 xl:pl-12">
          <div className="sticky top-24">
            <ProfileSidebar />
          </div>
        </div>
      </div>

      {isStoryViewOpen && filteredStoryItems.length > 0 && (
        <StoryView
          stories={filteredStoryItems}
          initialIndex={selectedStoryIndex}
          onClose={() => setIsStoryViewOpen(false)}
        />
      )}

      <ImagePostModal
        isOpen={isImagePostModalOpen}
        onClose={() => setIsImagePostModalOpen(false)}
        onSuccess={handlePostSuccess}
      />
    </div>
  );
};

export default Index;