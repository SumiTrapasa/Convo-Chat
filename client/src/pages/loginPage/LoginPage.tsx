import { Flex, Row, Col, Image } from "antd";
import styles from "./LoginPage.module.scss";
import Login from "./components/Login/Login";
import { ROUTES } from "@/const/common";
import SignUp from "./components/SignUp/SignUp";

export default function LoginPage() {
  const isLogin = ROUTES.LOGIN == window.location.pathname;

  return (
    <Flex justify="center" align="center" className={styles.loginContainer}>
      <Row className={styles.loginRow}>
        <Col xxl={10} xl={10} lg={10} md={24} sm={24} xs={24}>
          {isLogin ? <Login /> : <SignUp />}
        </Col>
        <Col
          xxl={14}
          xl={14}
          lg={14}
          md={0}
          sm={0}
          xs={0}
          className={styles.loginImageContainer}
        >
          <Image
            src="/login.png"
            alt="Convo Chat Features"
            className={styles.loginImageImg}
            preview={false}
          />
        </Col>
      </Row>
    </Flex>
  );
}
