import { Flex, Skeleton } from "antd";
import styles from "./ChatSkeletonLoading.module.scss";

const ChatLoadingSkeleton = () => {
  return (
    <Flex vertical gap={24} className={styles.chatLoadingSkeleton}>
      {Array.from({ length: 6 }).map((_, index) => {
        const isMine = index % 2 !== 0;

        return (
          <Flex key={index} justify={isMine ? "flex-end" : "flex-start"}>
            <Skeleton.Input
              active
              size="large"
              style={{
                width: 120 + Math.random() * 120,
              }}
            />
          </Flex>
        );
      })}
    </Flex>
  );
};

export default ChatLoadingSkeleton;
