import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../api/axios";
import { useAuthStore } from "../store/useAuthStore";
import { API_ENDPOINTS } from "@/const/api";
import type { AuthUser } from "@/types/auth";
import { useEffect } from "react";

export const useCheckAuth = () => {
  const setAuthUser = useAuthStore((s) => s.setAuthUser);
  const connectSocket = useAuthStore((s) => s.connectSocket);

  const query = useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const { data } = await api.get<AuthUser>(API_ENDPOINTS.AUTH.CHECK);
      return data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isSuccess && query.data) {
      setAuthUser(query.data);
      connectSocket(query.data);
    } else if (query.isError) {
      setAuthUser(null);
    }
  }, [query.isSuccess, query.data, query.isError, setAuthUser, connectSocket]);

  return query;
};

export const useSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: object) => {
      const { data } = await api.post<AuthUser>(
        API_ENDPOINTS.AUTH.SIGNUP,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      message.success("Account created successfully!");
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: object) => {
      const { data } = await api.post<AuthUser>(
        API_ENDPOINTS.AUTH.LOGIN,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      message.success("Logged in successfully");
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const disconnectSocket = useAuthStore((s) => s.disconnectSocket);
  const setAuthUser = useAuthStore((s) => s.setAuthUser);

  return useMutation({
    mutationFn: async () => {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    },
    onSettled: () => {
      queryClient.setQueryData(["auth"], null);
      setAuthUser(null);
      disconnectSocket();
      queryClient.clear();
    },
    onSuccess: () => {
      message.success("Logged out successfully");
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setAuthUser = useAuthStore((s) => s.setAuthUser);

  return useMutation({
    mutationFn: async (payload: object) => {
      const { data } = await api.put<AuthUser>(
        API_ENDPOINTS.AUTH.UPDATE_PROFILE,
        payload,
      );
      return data;
    },
    onSuccess: (updatedUser) => {
      setAuthUser(updatedUser);
      queryClient.setQueryData(["auth"], updatedUser);
      message.success("Profile updated successfully");
    },
    onError: () => {
      message.error("Failed to update profile");
    },
  });
};
