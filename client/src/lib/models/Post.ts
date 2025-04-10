export interface IComment {
  _id: string;
  userId: string;
  postId: string;
  content: string;
  likes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPost {
  _id: string;
  user: string;
  caption?: string;
  posturl: string;
  like: string[];
  comment: IComment[];
  tags?: string[];
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostResponse {
  success: boolean;
  post: IPost;
  message?: string;
}

export interface IPostsResponse {
  success: boolean;
  posts: IPost[];
  message?: string;
}

export interface ICommentResponse {
  success: boolean;
  comment: IComment;
  message?: string;
}

export interface ICreatePostData {
  caption?: string;
  image: File;
  tags?: string[];
  location?: string;
} 