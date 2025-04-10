export interface IMessage {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChat {
  _id: string;
  participants: string[];
  lastMessage?: IMessage;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessageResponse {
  success: boolean;
  message: IMessage;
  error?: string;
}

export interface IMessagesResponse {
  success: boolean;
  messages: IMessage[];
  error?: string;
}

export interface IChatResponse {
  success: boolean;
  chat: IChat;
  error?: string;
}

export interface IChatsResponse {
  success: boolean;
  chats: IChat[];
  error?: string;
}

export interface ISendMessageData {
  receiverId: string;
  content: string;
} 

interface IViewers {
  viewerId: string,
  viewAt: Date
}

enum MediaType {
  Image = "image",
  Video = "video"
}

export interface IStory {
  userId: string,
  mediaUrl: string,
  mediaType: MediaType,
  createdAt: Date,
  expiresAt: Date, // 24-hour expiry
  views: number,
  viewers: IViewers[]
}