import { toast } from "sonner";

// API Base URL - use environment variable
const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5555';
const cloudname = import.meta.env.VITE_CLOUD_NAME;
const preset = import.meta.env.VITE_UPLOAD_PRESET;

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // Try to get error message from response
    let errorMessage = "An unexpected error occurred";
    try {
      const data = await response.json();
      errorMessage = data.message || errorMessage;
    } catch (error) {
      // If response can't be parsed as JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  // Parse JSON response, handling potential variations in response format
  const data = await response.json();
  return data;
};

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('authToken');

// Generic API request function with error handling
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();
    // console.log("Using token:", token);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization token if available - without 'Bearer' prefix
    if (token) {
      headers['Authorization'] = token; // Remove 'Bearer' prefix as requested
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    return await handleResponse(response);
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    throw error;
  }
};

// Update token formats for file uploads too
const uploadFileRequest = (url: string, formData: FormData) => {
  const token = getAuthToken();
  const headers: HeadersInit = {};

  if (token) {
    headers['Authorization'] = token; // Remove 'Bearer' prefix
  }

  return fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    body: formData,
    headers,
    credentials: 'include',
  }).then(handleResponse);
};

// Authentication
export const authApi = {
  sendOtp: (email: string) =>
    apiRequest('/user/sendotp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  signup: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    otp: string;
  }) =>
    apiRequest('/user/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (identifier: string, password: string) =>
    apiRequest('/user/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),

  getUser: () =>
    apiRequest('/user/getuser'),

  getUserById: (userId: string) =>
    apiRequest(`/user/getuserbyid/${userId}`),

  getBatchUserById: (userIds: string[]) =>
    apiRequest('/user/batchUsers', {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    }),
};

const uploadImageToCloudnary = async (postData: FormData) => {
  const data = new FormData();
  console.log("data : ", postData.get('posturl'));
  data.append("file", postData.get('posturl'));
  console.log("file : ", data.get('file'));
  data.append("upload_preset", preset);
  data.append("cloud_name", cloudname);
  console.log("uploading");
  console.log("data : ", data);
  const response = await fetch(
    `http://api.cloudinary.com/v1_1/${cloudname}/image/upload`,
    {
      method: "POST",
      body: data,
    }
  );
  console.log("uploaded");
  console.log("response : ", response);

  if (!response.ok) {
    throw new Error(`Image upload failed with status: ${response.status}`);
  }
  const responseData = await response.json();
  return responseData;
}
// Posts
export const postsApi = {
  createPost: async (postData: FormData) => {
    const responseData = await uploadImageToCloudnary(postData);
    const token = getAuthToken();
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = token; // Remove 'Bearer' prefix
    }
    // For file uploads without Bearer prefix
    const formData = new FormData();
    if (responseData.url) {
      formData.append('posturl', responseData.url);
    }

    formData.append('caption', postData.get('caption'));

    return fetch(`${API_BASE_URL}/user/createpost`, {
      method: 'POST',
      body: formData,
      headers, // you can keep headers if needed, but avoid setting Content-Type as 'multipart/form-data' because fetch will automatically handle it
      credentials: 'include',
    }).then(handleResponse);

  },

  getAllPosts: () =>
    apiRequest('/user/getallpost'),

  getPostById: (postId: string) =>
    apiRequest(`/user/getPostByid/${postId}`),

  likePost: (postId: string) =>
    apiRequest(`/user/likepost/${postId}`, {
      method: 'POST',
    }),

  getLikePost: (postId: string) =>
    apiRequest(`/user/getlikepost/${postId}`),

  commentPost: (postId: string, comment: string) =>
    apiRequest(`/user/commentpost/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    }),

  savePost: (postId: string) =>
    apiRequest(`/user/savedpost/${postId}`, {
      method: 'POST',
    }),

  checkSavedPost: (postId: string) =>
    apiRequest(`/user/${postId}/isSaved`),

  getBatchPostsById: (postIds: string[]) =>
    apiRequest('/user/batchPosts', {
      method: 'POST',
      body: JSON.stringify({ postIds }),
    }),
};

// User profiles
export const profileApi = {
  getProfile: () =>
    apiRequest('/user/getprofile'),

  getProfileById: (profileId: string) =>
    apiRequest(`/user/getprofilebyid/${profileId}`),

  getUserProfileById: (userId: string) =>
    apiRequest(`/user/getUserProfileById/${userId}`),

  editProfile: (profileData: any) =>
    apiRequest('/user/editprofile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  changePassword: (passwordData: any) =>
    apiRequest('/user/changePassword', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    }),

  editProfilePicture: (userId: string, imageData: FormData) => {
    const token = getAuthToken();
    return fetch(`${API_BASE_URL}/user/editProfilePicture/${userId}`, {
      method: 'PUT',
      body: imageData,
      headers: token ? { 'Authorization': token } : undefined,
    }).then(handleResponse);
  },

  followUser: (followId: string) =>
    apiRequest(`/user/follow/${followId}`, {
      method: 'POST',
    }),

  unfollowUser: (followId: string) =>
    apiRequest(`/user/removefollow/${followId}`, {
      method: 'POST',
    }),

  getAllUsers: () =>
    apiRequest('/user/getalluser'),

  searchUsers: (query: string) =>
    apiRequest(`/user/search?query=${encodeURIComponent(query)}`),
};

// Stories
export const storiesApi = {
  createStory: async (storyData: FormData) => {
    const responseData = await uploadImageToCloudnary(storyData);
    const token = getAuthToken();
    const headers: HeadersInit = {};

    console.log("responseData : ", responseData);
    if (token) {
      headers['Authorization'] = token; // Remove 'Bearer' prefix
    }
    // For file uploads without Bearer prefix
    const formData = new FormData();
    if (responseData.url) {
      formData.append('mediaUrl', responseData.url);
    }

    formData.append('mediaType', storyData.get('mediaType'));

    return fetch(`${API_BASE_URL}/user/createStory`, {
      method: 'POST',
      body: formData,
      headers,
      credentials: 'include',
    }).then(handleResponse);
  },

  getAllStories: () =>
    apiRequest('/user/getAllStory'),

  getStoryById: (storyId: string) =>
    apiRequest(`/user/getStoryById/${storyId}`),

  getUserStories: () =>
    apiRequest('/user/getUserStory'),

  ViewStory: (storyId: string) =>
    apiRequest(`/user/${storyId}/view`),

  GetStoryViews: (storyId: string) =>
    apiRequest(`/user/${storyId}/viewers`),
};

// Chat & Messages
export const chatApi = {
  accessChat: (userId: string) =>
    apiRequest('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  allMessages: (chatId: string) =>
    apiRequest(`/api/message/${chatId}`),

  sendMessage: (data: { content: string; chatId: string }) =>
    apiRequest('/api/message', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  fetchChats: () =>
    apiRequest('/api/chat'),

  createGroupChat: (users: string[], name: string) =>
    apiRequest('/api/chat/group', {
      method: 'POST',
      body: JSON.stringify({ users, name }),
    }),

  renameGroup: (chatId: string, chatName: string) =>
    apiRequest('/api/chat/rename', {
      method: 'PUT',
      body: JSON.stringify({ chatId, chatName }),
    }),

  removeFromGroup: (chatId: string, userId: string) =>
    apiRequest('/api/chat/groupremove', {
      method: 'PUT',
      body: JSON.stringify({ chatId, userId }),
    }),

  addToGroup: (chatId: string, userId: string) =>
    apiRequest('/api/chat/groupadd', {
      method: 'PUT',
      body: JSON.stringify({ chatId, userId }),
    }),
};

export const messageApi = {
  sendMessage: (content: string, chatId: string) =>
    apiRequest('/api/message', {
      method: 'POST',
      body: JSON.stringify({ content, chatId }),
    }),

  fetchMessages: (chatId: string) =>
    apiRequest(`/api/message/${chatId}`),
};

export default {
  auth: authApi,
  posts: postsApi,
  profile: profileApi,
  stories: storiesApi,
  chat: chatApi,
  message: messageApi,
};
