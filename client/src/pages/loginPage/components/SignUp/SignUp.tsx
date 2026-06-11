import {
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Flex,
  Grid,
  Checkbox,
} from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import styles from "./SignUp.module.scss";
import Logo from "@/components/logo/Logo";
import { ROUTES } from "@/const/common";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/store/useAuthStore";

export default function SignUp() {
  const screens = Grid.useBreakpoint();
  const { Title, Text } = Typography;
  const navigate = useNavigate();
  const { signup, isSigningUp } = useAuthStore();
  const [form] = Form.useForm();
  const isSendEmail = Form.useWatch("isSendEmail", form);

  const onFinish = (values: {
    fullName: string;
    email: string;
    password: string;
    isSendEmail: boolean;
  }) => {
    signup(values);
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
          Create Account
        </Title>
        <Text type="secondary" className={styles.subtitle}>
          Simplify your workflow and boost your productivity with{" "}
          <strong>Convo</strong>. Get started for free.
        </Text>
      </Flex>

      <Form
        name="convo_login"
        form={form}
        layout="vertical"
        onFinish={onFinish}
        size="large"
        className={styles.loginForm}
      >
        <Form.Item
          name="fullName"
          rules={[{ required: true, message: "Please input your Full Name!" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Full Name" />
        </Form.Item>

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

        <Form.Item name="isSendEmail" valuePropName="checked">
          <Checkbox>
            <Text type={isSendEmail ? undefined : "secondary"}>
              I want to receive email updates and productivity tips from{" "}
              <strong>Convo</strong>.
            </Text>
          </Checkbox>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={isSigningUp}>
            Create Account
          </Button>
        </Form.Item>
      </Form>

      <Divider>or</Divider>
      <Flex justify="center" align="center">
        <Text type="secondary">Already have an account?</Text>
        <Button
          type="link"
          size={"small"}
          className={styles.registerLink}
          onClick={() => navigate(ROUTES.LOGIN)}
        >
          Login
        </Button>
      </Flex>
    </Flex>
  );
}
