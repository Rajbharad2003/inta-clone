export interface IProfile {
  _id?: string;
  profilename?: string;
  bio?: string;
  profilephoto?: string;
  followers: string[];
  following: string[];
  posts: string[];
  createdAt?: Date;
  updatedAt?: Date;
  saved: string[];
}

export interface IUser {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  profile: IProfile;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserResponse {
  success: boolean;
  user: IUser;
  message?: string;
}

export interface IProfileResponse {
  success: boolean;
  profile: IProfile;
  message?: string;
}

export interface IUsersResponse {
  success: boolean;
  users: IUser[];
  message?: string;
} 