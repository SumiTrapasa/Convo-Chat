import { Flex } from "antd";
import ChatHeader from "./components/ChatHeader/ChatHeader";
import styles from "./ChatContainer.module.scss";
import ChatContent from "./components/ChatContent/ChatContent";
import ChatInput from "./components/ChatInput/ChatInput";

const ChatContainer = () => {
  return (
    <Flex vertical className={styles.chatContainer}>
      <ChatHeader />

      <Flex className={styles.chatContent}>
        <ChatContent />
      </Flex>

      <ChatInput />
    </Flex>
  );
};

export default ChatContainer;
