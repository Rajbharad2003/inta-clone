
// import { io, Socket } from "socket.io-client";

// // Socket.io connection URL - use the environment variable
// const SOCKET_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5555";

// class SocketService {
//   socket: Socket | null = null;
//   private userId: string | null = null;
//   private eventHandlers: Map<string, Set<(data: any) => void>> = new Map();

//   // Connect to the socket server with user authentication
//   connect(userId: string): void {
//     this.userId = userId;
    
//     // Get the auth token from localStorage
//     const token = localStorage.getItem("authToken");
    
//     if (!token) {
//       console.error("No auth token found for socket connection");
//       alert("Authentication required. Please log in.");
//       return;
//     }
    
//     // Close existing connection if there is one
//     if (this.socket) {
//       this.socket.disconnect();
//     }
    
//     // Connect with auth token
//     this.socket = io(SOCKET_URL, {
//       auth: { token },
//       query: { userId },
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//       timeout: 10000
//     });
    
//     // Setup event listeners
//     this.socket.on("connect", () => {
//       console.log("Socket connected with ID:", this.socket?.id);
//     });
    
//     this.socket.on("disconnect", (reason) => {
//       console.log("Socket disconnected, reason:", reason);
//     });
    
//     this.socket.on("connect_error", (error) => {
//       console.error("Socket connection error:", error);
//     });
    
//     // Set up global message handler
//     this.socket.on("messageReceived", (data) => {
//       console.log("Global message received:", data);
//       const handlers = this.eventHandlers.get("message");
//       if (handlers) {
//         handlers.forEach(handler => handler(data));
//       }
//     });
    
//     this.socket.on("newMessage", (data) => {
//       console.log("Global newMessage received:", data);
//       const handlers = this.eventHandlers.get("newMessage");
//       if (handlers) {
//         handlers.forEach(handler => handler(data));
//       }
//     });
//   }
  
//   // Disconnect from the socket server
//   disconnect(): void {
//     if (this.socket) {
//       this.socket.disconnect();
//       this.socket = null;
//       this.userId = null;
//       this.eventHandlers.clear();
//     }
//   }
  
//   // Send a message to a chat
//   sendMessage(chatId: string, content: string): Promise<any> {
//     return new Promise((resolve, reject) => {
//       if (!this.socket || !this.userId) {
//         reject(new Error("Socket not connected"));
//         return;
//       }
      
//       // const messageData = {
//       //   chatId,
//       //   content,
//       //   sender: this.userId,
//       //   timestamp: new Date()
//       // };
//       const messageData = {
//         chat: chatId, // Ensure correct property name matches backend
//         content,
//         sender: { _id: this.userId }, // Match backend structure
//         timestamp: new Date().toISOString()
//       };

//       console.log("Emitting newMessage event:", messageData);
      
//       this.socket.emit("newMessage", messageData, (response: any) => {
//         if (response && response.error) {
//           console.error("Error sending message:", response.error);
//           reject(new Error(response.error));
//         } else {
//           console.log("Message sent successfully:", response);
//           resolve(response);
//         }
//       });
//     });
//   }
  
//   // Register a callback for incoming messages with proper event handling
//   onMessage(callback: (message: any) => void): void {
//     if (!this.socket) {
//       console.warn("Cannot register message handler - socket not connected");
//       return;
//     }
    
//     // Register for message events
//     if (!this.eventHandlers.has("message")) {
//       this.eventHandlers.set("message", new Set());
//     }
//     this.eventHandlers.get("message")?.add(callback);
    
//     // Also register for newMessage events
//     if (!this.eventHandlers.has("newMessage")) {
//       this.eventHandlers.set("newMessage", new Set());
//     }
//     this.eventHandlers.get("newMessage")?.add(callback);
    
//     // Ensure we're listening on the socket
//     this.socket.on("message", (data) => {
//       console.log("Direct message received:", data);
//       callback(data);
//     });
    
//     this.socket.on("newMessage", (data) => {
//       console.log("Direct newMessage received:", data);
//       callback(data);
//     });
//   }
  
//   // Register a callback for notifications
//   onNotification(callback: (notification: any) => void): void {
//     if (!this.socket) return;
    
//     this.socket.on("notification", callback);
//   }
  
//   // Join a chat room
//   joinChat(chatId: string, userId?: string): void {
//     if (this.socket) {
//       console.log("Joining chat:", chatId);
//       this.socket.emit('joinChat',  chatId );
//       if (userId) {
//         this.socket.emit("joinChat", userId); // Join user ID for direct messages
//       }
//     } else {
//       console.warn("Cannot join chat - socket not connected");
//     }
//   }
  
//   // Leave a chat room
//   leaveChat(chatId: string): void {
//     if (!this.socket) {
//       console.warn("Cannot leave chat - socket not connected");
//       return;
//     }
    
//     console.log("Leaving chat:", chatId);
//   this.socket.emit("leaveChat", chatId);
//   }
  
//   // Check if the socket is connected
//   isConnected(): boolean {
//     return this.socket?.connected || false;
//   }

//   // Helper method to send a direct message
//   sendNewMessage(chatId: string, message: any): void {
//     if (this.socket) {
//       console.log("Emitting new message to chat:", chatId, message);
//       this.socket.emit('newMessage', { chatId, message });
//     } else {
//       console.warn("Cannot send message - socket not connected");
//     }
//   }
  
//   // Remove message handler
//   removeMessageHandler(callback: (message: any) => void): void {
//     if (!this.socket) return;
    
//     const messageHandlers = this.eventHandlers.get("message");
//     if (messageHandlers) {
//       messageHandlers.delete(callback);
//     }
    
//     const newMessageHandlers = this.eventHandlers.get("newMessage");
//     if (newMessageHandlers) {
//       newMessageHandlers.delete(callback);
//     }
//   }
// }

// // Export a singleton instance
// const socketService = new SocketService();
// export default socketService;
import { io, Socket } from "socket.io-client";

// Socket.io connection URL - use the environment variable
const SOCKET_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5555";

class SocketService {
  socket: Socket | null = null;
  private userId: string | null = null;
  private eventHandlers: Map<string, Set<(data: any) => void>> = new Map();

  connect(userId: string): void {
    try {
      console.log("Attempting socket connection for user:", userId);
      this.userId = userId;
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No auth token found for socket connection");
      }

      if (this.socket) {
        console.log("Disconnecting existing socket connection");
        this.socket.disconnect();
      }

      console.log("Creating new socket connection to:", SOCKET_URL);
      this.socket = io(SOCKET_URL, {
        auth: { token },
        query: { userId },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        transports: ['websocket', 'polling'],
        withCredentials: true
      });

      this.setupBaseListeners();
    } catch (error) {
      console.error("Error in socket connection:", error);
      throw error;
    }
  }

  private setupBaseListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    this.socket.on("connect", () => {
      console.log("Socket connected successfully with ID:", this.socket?.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected, reason:", reason);
    });

    this.socket.on("messageReceived", (data) => {
      console.log("Message received:", data);
      this.handleEvent("messageReceived", data);
    });

    // this.socket.on("newMessage", (data) => {
    //   console.log("New message received:", data);
    //   this.handleEvent("newMessage", data);
    // });
  }

  disconnect(): void {
    if (this.socket) {
      console.log("Disconnecting socket");
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.eventHandlers.clear();
    }
  }

  sendMessage(chatId: string, content: string, selectedChat:any, response:any): Promise<any> {
  // sendMessage(response: any, selectedChat:any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.userId) {
        reject(new Error("Socket not connected"));
        return;
      }

      const messageData = {
        chat: selectedChat.id,
        content,
        sender: { _id: this.userId },
        timestamp: new Date().toISOString(),
        selectedChat,
        newMessage: response
      };

      console.log("Sending message:", messageData);

      this.socket.emit("newMessage", messageData, (response: any) => {
        if (response?.error) {
          console.error("Error sending message:", response.error);
          reject(new Error(response.error));
        } else {
          console.log("Message sent successfully:", response);
          resolve(response);
        }
      });
    });
  }

  onMessage(callback: (message: any) => void): void {
    this.registerEventHandler("messageReceived", callback);
    this.registerEventHandler("newMessage", callback);
  }

  joinChat(chatId: string, userId: string): void {
    if (!this.socket) {
      console.warn("Cannot join chat - socket not connected");
      return;
    }

    console.log(`Joining chat: ${chatId} for user: ${userId}`);
    this.socket.emit("joinChat", { chatId, userId });
  }

  leaveChat(chatId: string): void {
    if (!this.socket) {
      console.warn("Cannot leave chat - socket not connected");
      return;
    }

    console.log(`Leaving chat: ${chatId}`);
    this.socket.emit("leaveChat", chatId);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  private registerEventHandler(event: string, callback: (data: any) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)?.add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  private handleEvent(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }
}

const socketService = new SocketService();
export default socketService;
