import { Flex, Spin } from "antd";
import styles from "./PageLoader.module.scss";

export default function PageLoader() {
  return (
    <Flex className={styles.pageLoader} justify="center" align="center">
      <Spin
        description="Loading..."
        className={styles.customSpin}
        size="large"
      />
    </Flex>
  );
}
