import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService from '@/lib/socket';

interface SocketContextType {
  connected: boolean;
  connect: (userId: string) => void;
  disconnect: () => void;
  sendMessage: (receiverId: string, content: string ,selectedChat:any, response:any) => any;
  // sendMessage: (response:any ,selectedChat:any) => any;
  onMessage: (callback: (message: any) => void) => () => void; // Return cleanup function
  onChatEvent: (eventName: string, callback: (data: any) => void) => () => void; // Return cleanup function
  joinChat: (chatId: string, userId : string) => void;
  leaveChat: (chatId: string) => void;
}

const defaultContext: SocketContextType = {
  connected: false,
  connect: () => {},
  disconnect: () => {},
  sendMessage: () => null,
  onMessage: () => () => {}, // Return cleanup function
  onChatEvent: () => () => {}, // Return cleanup function
  joinChat: () => {},
  leaveChat: () => {},
};

const SocketContext = createContext<SocketContextType>(defaultContext);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (connected) {
        socketService.disconnect();
      }
    };
  }, [connected]);

  // Setup connection status listeners
  const connect = (userId: string) => {
    socketService.connect(userId);
    setConnected(true);

    // Set up connection status listeners
    socketService.socket?.on("connect", () => {
      console.log("Socket connected successfully");
      setConnected(true);
    });

    socketService.socket?.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });
  };
  
  const disconnect = () => {
    socketService.disconnect();
    setConnected(false);
  };
  
  const sendMessage = (receiverId: string, content: string, selectedChat:any, response:any) => {
    console.log("in sending message");
    console.log("responce : ",content);
    return socketService.sendMessage(receiverId, content, selectedChat,response);
  };
  
  
  // Improved onMessage with cleanup function
  const onMessage = (callback: (message: any) => void) => {
    if (!socketService.socket) {
      console.warn("Socket not connected when trying to listen for messages");
      return () => {};
    }
    
    console.log("Setting up message listeners");
    
    // Set up message listeners
    const handleMessage = (data: any) => {
      console.log("Received message event:", data);
      callback(data);
    };
    
    const handleNewMessage = (data: any) => {
      console.log("Received newMessage event:", data);
      callback(data);
    };
    
    // socketService.socket.on("message", handleMessage);
    // socketService.socket.on("newMessage", handleNewMessage);
    socketService.socket.on("messageReceived", handleNewMessage);
    
    // Return cleanup function to remove listeners
    return () => {
      if (socketService.socket) {
        // socketService.socket.off("message", handleMessage);
        // socketService.socket.off("newMessage", handleNewMessage);
        socketService.socket.off("messageReceived", handleNewMessage);
      }
    };
  };
  
  // Improved onChatEvent with cleanup function
  const onChatEvent = (eventName: string, callback: (data: any) => void) => {
    if (!socketService.socket) {
      console.warn("Socket not connected when trying to listen for chat events");
      return () => {};
    }
    
    console.log(`Setting up listener for chat event: ${eventName}`);
    
    // Set up event listener
    const handleEvent = (data: any) => {
      console.log(`Received ${eventName} event:`, data);
      callback(data);
    };
    
    socketService.socket.on(eventName, handleEvent);
    
    // Return cleanup function
    return () => {
      if (socketService.socket) {
        socketService.socket.off(eventName, handleEvent);
      }
    };
  };
  
  const joinChat = (chatId: string,userId:string) => {
    console.log(`Joining chat room: ${chatId}`);
    socketService.joinChat(chatId,userId);
  };
  
  const leaveChat = (chatId: string) => {
    console.log(`Leaving chat room: ${chatId}`);
    socketService.leaveChat(chatId);
  };
  
  const value = {
    connected,
    connect,
    disconnect,
    sendMessage,
    onMessage,
    onChatEvent,
    joinChat,
    leaveChat,
  };
  
  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
