import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import type { AuthUser } from "@/types/auth";
import { BASE_URL } from "@/const/config";

interface AuthState {
  authUser: AuthUser | null;
  socket: Socket | null;
  onlineUsers: string[];
  setAuthUser: (user: AuthUser | null) => void;
  connectSocket: (user?: AuthUser) => void;
  disconnectSocket: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  socket: null,
  onlineUsers: [],

  setAuthUser: (user) => set({ authUser: user }),

  connectSocket: (userFromAuthHook) => {
    const authUser = userFromAuthHook || get().authUser; // Use passed user or current state
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials: true, // this ensures cookies are sent with the connection
    });

    socket.connect();

    set({ socket });

    socket.on("getOnlineUsers", (userIds: string[]) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) socket.disconnect();
    set({ socket: null, onlineUsers: [] }); // Clear socket and online users on disconnect
  },
}));
