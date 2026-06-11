import { Form, Input, Button, Typography, Divider, Flex, Grid } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import styles from "./Login.module.scss";
import Logo from "@/components/logo/Logo";
import { useNavigate } from "react-router";
import { ROUTES } from "@/const/common";
import { useAuthStore } from "@/store/useAuthStore";

export default function Login() {
  const { Title, Text } = Typography;
  const naviagte = useNavigate();
  const screens = Grid.useBreakpoint();
  const { login, isLoggingIn } = useAuthStore();

  const onFinish = (values: { email: string; password: string }) => {
    login(values);
  };

  return (
    <Flex
      vertical
      justify="center"
      align="center"
      gap={16}
      className={styles.loginContent}
    >
      {!screens.lg && <Logo />}
      <Flex vertical justify="center" align="center">
        <Title level={1} className={styles.title}>
          Welcome back!
        </Title>
        <Text type="secondary" className={styles.subtitle}>
          Simplify your workflow and boost your productivity with{" "}
          <strong>Convo</strong>. Get started for free.
        </Text>
      </Flex>

      <Form
        name="convo_login"
        layout="vertical"
        onFinish={onFinish}
        size="large"
        className={styles.loginForm}
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Please input your Email!" },
            { type: "email", message: "The input is not valid Email!" },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your Password!" }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={isLoggingIn}>
            Login
          </Button>
        </Form.Item>
        <div className={styles.forgotLink}>
          <Button type="text" size={"small"}>
            Forgot Password?
          </Button>
        </div>
      </Form>

      <Divider>or</Divider>
      <Flex justify="center" align="center">
        <Text type="secondary">Don't have an account?</Text>
        <Button
          type="link"
          size={"small"}
          className={styles.registerLink}
          onClick={() => naviagte(ROUTES.SIGNUP)}
        >
          Sign Up
        </Button>
      </Flex>
    </Flex>
  );
}
