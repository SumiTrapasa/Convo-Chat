import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import api from "../api/axios";
import { message } from "antd";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface AuthUser {
  _id: string;
  fullName: string;
  email: string;
  profilePic?: string;
}

interface AuthState {
  authUser: AuthUser | null;
  isCheckingAuth: boolean;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  socket: Socket | null;
  onlineUsers: string[];
  checkAuth: () => Promise<void>;
  signup: (data: object) => Promise<void>;
  login: (data: object) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: object) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  socket: null,
  onlineUsers: [] as string[],

  checkAuth: async () => {
    try {
      const res = await api.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data: object) => {
    set({ isSigningUp: true });
    try {
      const res = await api.post("/auth/signup", data);
      set({ authUser: res.data });

      message.success("Account created successfully!");
      get().connectSocket();
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data: object) => {
    set({ isLoggingIn: true });
    try {
      const res = await api.post("/auth/login", data);
      set({ authUser: res.data });

      message.success("Logged in successfully");

      get().connectSocket();
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    await api.post("/auth/logout");
    set({ authUser: null });
    message.success("Logged out successfully");
    get().disconnectSocket();
  },

  updateProfile: async (data: object) => {
    const res = await api.put("/auth/update-profile", data);
    set({ authUser: res.data });
    message.success("Profile updated successfully");
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials: true, // this ensures cookies are sent with the connection
    });

    socket.connect();

    set({ socket });

    // listen for online users event
    socket.on("getOnlineUsers", (userIds: string[]) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) socket.disconnect();
  },
}));
