import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { API_ENDPOINTS } from "@/const/api";
import { AI_USER_ID } from "@/const/chat";
import type { Message, MessageData, Contact, ChatPartner } from "@/types/chats";
import { message } from "antd";

interface AIChatResponse {
  userMessage: Message;
  aiMessage: Message;
}

export const useMessages = (userId?: string) => {
  const isAIChat = userId === AI_USER_ID;

  return useQuery({
    queryKey: ["messages", userId],
    queryFn: async () => {
      const endpoint = isAIChat
        ? API_ENDPOINTS.AI.GET_MESSAGES
        : API_ENDPOINTS.MESSAGES.GET_MESSAGES(userId!);
      const { data } = await api.get<Message[]>(endpoint);
      return data;
    },
    enabled: !!userId,
  });
};

export const useClearAIMessages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete(API_ENDPOINTS.AI.CLEAR_MESSAGES);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", AI_USER_ID] });
      message.success("AI conversation history cleared");
    },
  });
};

export const useContacts = () => {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data } = await api.get<Contact[]>(
        API_ENDPOINTS.MESSAGES.CONTACTS,
      );
      return data;
    },
  });
};

export const useChatPartners = () => {
  return useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const { data } = await api.get<ChatPartner[]>(
        API_ENDPOINTS.MESSAGES.CHATS,
      );
      return data;
    },
  });
};

export const useSendMessage = (receiverId: string) => {
  const queryClient = useQueryClient();
  const isAIChat = receiverId === AI_USER_ID;

  return useMutation({
    mutationKey: ["sendMessage", receiverId],
    mutationFn: async (messageData: MessageData) => {
      if (isAIChat) {
        const { data } = await api.post<AIChatResponse>(
          API_ENDPOINTS.AI.SEND_MESSAGE,
          { text: messageData.text },
        );
        return data;
      }

      const { data } = await api.post<Message>(
        API_ENDPOINTS.MESSAGES.SEND_MESSAGE(receiverId),
        messageData,
      );
      return data;
    },
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({ queryKey: ["messages", receiverId] });

      const previousMessages = queryClient.getQueryData<Message[]>([
        "messages",
        receiverId,
      ]);

      const authUser = useAuthStore.getState().authUser;
      const optimisticMessage: Message = {
        _id: Date.now().toString(),
        senderId: authUser?._id || "",
        receiverId,
        text: newMessage.text,
        image: newMessage.image,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      queryClient.setQueryData<Message[]>(
        ["messages", receiverId],
        (old = []) => [...old, optimisticMessage],
      );

      return { previousMessages };
    },
    onSuccess: (data) => {
      if (isAIChat && data && "aiMessage" in data) {
        queryClient.setQueryData<Message[]>(
          ["messages", receiverId],
          (old = []) => {
            const withoutOptimistic = old.filter((msg) => !msg.isOptimistic);
            return [...withoutOptimistic, data.userMessage, data.aiMessage];
          },
        );
      }
    },
    onError: (_err, _newMessage, context) => {
      queryClient.setQueryData(
        ["messages", receiverId],
        context?.previousMessages,
      );
    },
    onSettled: (_data, error) => {
      if (error || !isAIChat) {
        queryClient.invalidateQueries({ queryKey: ["messages", receiverId] });
      }
      if (!error) {
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      }
    },
  });
};
