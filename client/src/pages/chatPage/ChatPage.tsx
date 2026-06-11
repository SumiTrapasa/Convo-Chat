import { Layout, Flex, Divider } from "antd";
import { useEffect, useState } from "react";
import styles from "./ChatPage.module.scss";

import ProfileHeader from "./components/ProfileHeader/ProfileHeader";
import ChatList from "./components/ChatList/ChatList";
import ChatContainer from "./components/ChatContainer/ChatContainer";
import NoChatsFound from "@/components/NoChatsFound/NoChatsFound";

import { useChatStore } from "@/store/useChatStore";

const { Sider, Content } = Layout;

export default function ChatPage() {
  const { selectedUser } = useChatStore();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    if (isMobile) {
      setCollapsed(false);
    }
  }, [isMobile]);

  return (
    <Flex align="center" justify="center" className={styles.flexContainer}>
      <Layout className={styles.chatPageLayout}>
        {/* SIDEBAR */}
        <Sider
          width={320}
          className={styles.chatPageSidebar}
          breakpoint="lg"
          collapsedWidth="0"
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <Flex vertical className={styles.SidebarContainer}>
            <ProfileHeader />
            <Divider />

            <ChatList onSelect={() => isMobile && setCollapsed(true)} />
          </Flex>
        </Sider>

        {/* CHAT */}
        <Content>
          {(isMobile && collapsed) || !isMobile ? (
            <Flex vertical className={styles.chatPageContent}>
              {selectedUser ? (
                <ChatContainer />
              ) : (
                <Flex
                  className={styles.noContent}
                  align="center"
                  justify="center"
                >
                  <NoChatsFound
                    title="Select a conversation"
                    description="Choose a contact to start chatting"
                  />
                </Flex>
              )}
            </Flex>
          ) : null}
        </Content>
      </Layout>
    </Flex>
  );
}
