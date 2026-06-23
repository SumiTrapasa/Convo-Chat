import { Button, Flex, Tooltip, Typography } from "antd";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { CloseOutlined, VideoCameraOutlined } from "@ant-design/icons";
import ProfilePicture from "@/components/ProfilePicture/ProfilePicture";
import styles from "./ChatHeader.module.scss";
import { AI_USER_FULL_NAME } from "@/const/chat";
import { useCallStore } from "@/store/useCallStore";
import { CALL_STATUS } from "@/const/call";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { status, startCall } = useCallStore();
  const isOnline = selectedUser && onlineUsers.includes(selectedUser._id);
  const canCall =
    selectedUser &&
    selectedUser.fullName !== AI_USER_FULL_NAME &&
    status === CALL_STATUS.IDLE;

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
      <Flex align="center" gap={8}>
        {canCall ? (
          <Tooltip title={isOnline ? "Start video call" : "User is offline"}>
            <Button
              type="text"
              disabled={!isOnline}
              icon={<VideoCameraOutlined />}
              onClick={() => startCall(selectedUser)}
            />
          </Tooltip>
        ) : null}
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={() => setSelectedUser(null)}
        />
      </Flex>
    </Flex>
  );
};
export default ChatHeader;
