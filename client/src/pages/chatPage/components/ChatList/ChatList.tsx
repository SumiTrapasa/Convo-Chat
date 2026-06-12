import { BorderBeam, Button, Flex, Radio, Skeleton, Tooltip } from "antd";
import styles from "./ChatList.module.scss";
import { useState } from "react";
import ChatCard from "@/components/ChatCard/ChatCard";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import NoChatsFound from "@/components/NoChatsFound/NoChatsFound";
import { useContacts, useChatPartners } from "@/hooks/useChat";
import {
  CHAT_TABS,
  AI_USER_ID,
  AI_USER_FULL_NAME,
  AI_USER_PROFILE_PIC,
} from "@/const/chat";
import { RobotOutlined } from "@ant-design/icons";

const ChatList = ({ onSelect }: { onSelect: () => void }) => {
  const [active, setActive] = useState<string>("Chats");
  const { setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const { data: chats = [], isLoading: isChatsLoading } = useChatPartners();
  const { data: allContacts = [], isLoading: isContactsLoading } =
    useContacts();

  const isUsersLoading =
    active === "Chats" ? isChatsLoading : isContactsLoading;

  return (
    <Flex vertical gap={24} className={styles.chatListContainer}>
      <Radio.Group
        block
        options={CHAT_TABS}
        defaultValue="Chats"
        optionType="button"
        buttonStyle="solid"
        className={styles.tab}
        onChange={(e) => setActive(e.target.value)}
      />
      <Flex className={styles.scrollContainer} vertical>
        {isUsersLoading ? (
          <Flex vertical>
            <Skeleton avatar paragraph={{ rows: 0 }} />
            <Skeleton avatar paragraph={{ rows: 0 }} />
            <Skeleton avatar paragraph={{ rows: 0 }} />
          </Flex>
        ) : (
          <Flex vertical className={styles.chatList}>
            {active === "Chats" ? (
              chats.length ? (
                chats.map((chat) => (
                  <ChatCard
                    key={chat._id}
                    name={chat.fullName}
                    profilePic={chat.profilePic}
                    isOnline={onlineUsers.includes(chat._id)}
                    onClick={() => {
                      setSelectedUser(chat);
                      onSelect();
                    }}
                  />
                ))
              ) : (
                <NoChatsFound
                  title="No conversations yet"
                  description="Start a new chat by selecting a contact from the contacts tab"
                />
              )
            ) : (
              allContacts.map((contact) => (
                <ChatCard
                  key={contact._id}
                  name={contact.fullName}
                  profilePic={contact.profilePic}
                  isOnline={onlineUsers.includes(contact._id)}
                  onClick={() => {
                    setSelectedUser(contact);
                    onSelect();
                  }}
                />
              ))
            )}
          </Flex>
        )}
      </Flex>
      <BorderBeam outset={6}>
        <Tooltip title="Convo AI">
          <Button
            shape="circle"
            type="primary"
            size="large"
            onClick={() => {
              setSelectedUser({
                _id: AI_USER_ID,
                fullName: AI_USER_FULL_NAME,
                profilePic: AI_USER_PROFILE_PIC,
              });
              onSelect();
            }}
            icon={<RobotOutlined />}
            className={styles.aiButton}
          />
        </Tooltip>
      </BorderBeam>
    </Flex>
  );
};

export default ChatList;
