import { Image } from "antd";

const Logo = () => {
  return (
    <Image
      src="/logo.png"
      alt="Convo Chat Features"
      preview={false}
      height={80}
      width={200}
    />
  );
};

export default Logo;
