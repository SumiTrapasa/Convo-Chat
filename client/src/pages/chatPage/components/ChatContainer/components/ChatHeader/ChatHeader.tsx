import { Button, Flex, Typography } from "antd";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { CloseOutlined } from "@ant-design/icons";
import ProfilePicture from "@/components/ProfilePicture/ProfilePicture";
import styles from "./ChatHeader.module.scss";
import { AI_USER_FULL_NAME } from "@/const/chat";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = selectedUser && onlineUsers.includes(selectedUser._id);
  if (!selectedUser) return null;

  return (
    <Flex align="center" justify="space-between" className={styles.chatHeader}>
      <Flex gap={16} align="center">
        <ProfilePicture
          size={52}
          offset={[-10, 6]}
          profilePic={selectedUser.profilePic}
          isOnline={!!isOnline || AI_USER_FULL_NAME === selectedUser?.fullName}
        />
        <Flex vertical>
          <Typography.Text strong className={styles.username}>
            {selectedUser?.fullName}
          </Typography.Text>
          <Typography.Text type="secondary">
            {isOnline || AI_USER_FULL_NAME === selectedUser?.fullName
              ? "Online"
              : "Offline"}
          </Typography.Text>
        </Flex>
      </Flex>
      <Button
        type="text"
        icon={<CloseOutlined />}
        onClick={() => setSelectedUser(null)}
      />
    </Flex>
  );
};
export default ChatHeader;
