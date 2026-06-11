import { BorderBeam, Button, Flex, Image, Typography } from "antd";
import { Fragment, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import ChatLoadingSkeleton from "../ChatSkeletonLoading/ChatSkeletonLoading";
import styles from "./ChatContent.module.scss";
import ProfilePicture from "@/components/ProfilePicture/ProfilePicture";
import NoChatsFound from "@/components/NoChatsFound/NoChatsFound";
import { formatDateLabel, formatTime, isJumboEmoji } from "@/utils/chat";
import { useMessages, useSendMessage } from "@/hooks/useChat";
import { COLORS, QUICK_MESSAGES } from "@/const/chat";
import type { Message } from "@/types/chats";

const ChatContent = () => {
  const queryClient = useQueryClient();
  const { selectedUser, subscribeToMessages, unsubscribeFromMessages } =
    useChatStore();

  const { data: messages = [], isLoading: isMessagesLoading } = useMessages(
    selectedUser?._id,
  );
  const { mutate: sendMessage } = useSendMessage(selectedUser?._id || "");

  const { authUser } = useAuthStore();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { Text } = Typography;

  useEffect(() => {
    subscribeToMessages((newMessage) => {
      queryClient.setQueryData<Message[]>(
        ["messages", selectedUser?._id],
        (old = []) => [...old, newMessage],
      );
    });

    // clean up
    return () => unsubscribeFromMessages();
  }, [selectedUser, subscribeToMessages, unsubscribeFromMessages, queryClient]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) return <ChatLoadingSkeleton />;

  return (
    <Flex vertical gap={8} className={styles.chatContent}>
      {messages.length === 0 && (
        <Flex
          vertical
          className={styles.noContent}
          align="center"
          justify="center"
          gap={24}
        >
          <NoChatsFound
            title={`Start your conversation with ${selectedUser?.fullName}`}
            description="This is the beginning of your conversation. Send a message to start chatting!"
          />
          <Flex
            align="center"
            justify="center"
            gap={16}
            className={styles.buttons}
          >
            {QUICK_MESSAGES.map((msg, index) => (
              <BorderBeam key={index} color={COLORS}>
                <Button onClick={() => sendMessage({ text: msg.text })}>
                  {msg.label}
                </Button>
              </BorderBeam>
            ))}
          </Flex>
        </Flex>
      )}
      {messages.map((msg, index) => {
        const isMine = msg.senderId === authUser?._id;
        const msgDate = new Date(msg.createdAt).toDateString();
        const prevMsgDate =
          index > 0
            ? new Date(messages[index - 1].createdAt).toDateString()
            : null;
        const isNewDay = msgDate !== prevMsgDate;

        return (
          <Fragment key={msg._id}>
            {isNewDay && (
              <Flex justify="center" className={styles.dateSeparator}>
                <Text className={styles.dateLabel}>
                  {formatDateLabel(msg.createdAt)}
                </Text>
              </Flex>
            )}

            <Flex justify={isMine ? "flex-end" : "flex-start"}>
              <Flex align="end" gap={8} className={styles.messageContainer}>
                {!isMine && (
                  <ProfilePicture
                    size={30}
                    profilePic={selectedUser?.profilePic}
                  />
                )}

                <Flex
                  vertical
                  className={!isMine ? styles.message : styles.mine}
                >
                  {msg.image && (
                    <Image src={msg.image} preview className={styles.image} />
                  )}

                  {msg.text && (
                    <Text
                      className={`${styles.text} ${isJumboEmoji(msg.text) ? styles.jumboEmoji : ""}`}
                    >
                      {msg.text}
                    </Text>
                  )}

                  <Text className={styles.time}>
                    {formatTime(msg.createdAt)}
                  </Text>
                </Flex>

                {isMine && (
                  <ProfilePicture size={30} profilePic={authUser?.profilePic} />
                )}
              </Flex>
            </Flex>
          </Fragment>
        );
      })}

      <div ref={messageEndRef} className={styles.messageEnd} />
    </Flex>
  );
};

export default ChatContent;
