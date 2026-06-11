import type { CheckboxGroupProps } from "antd/es/checkbox";

export const COLORS = [
  { color: "#22c55e", percent: 0 },
  { color: "#a3e635", percent: 54 },
  { color: "#06b6d4", percent: 57 },
];

export const QUICK_MESSAGES = [
  { label: "Say Hello 👋", text: "Hello 👋" },
  { label: "How are you? 😊", text: "How are you? 😊" },
  { label: "Meet up soon? 📅", text: "Meet up soon? 📅" },
];

export const CHAT_TABS: CheckboxGroupProps<string>["options"] = [
  { label: "Chats", value: "Chats" },
  { label: "Contacts", value: "Contacts" },
];
