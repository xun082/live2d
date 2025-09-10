import {
  ApiOutlined,
  BlockOutlined,
  BookOutlined,
  CommentOutlined,
  LayoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useStates } from "../../hooks/useStates";

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const disabled = useStates((state) => state.disabled);
  const forceAllowNav = useStates((state) => state.forceAllowNav);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // 根据当前路径确定选中的菜单项
  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path === "/" || path === "/chat") return ["/chat"];
    return [path];
  };

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="flex justify-center items-center bg-white border border-blue-900 rounded-md overflow-hidden">
        <Menu
          className="border-none justify-center bg-transparent"
          mode="horizontal"
          selectedKeys={getSelectedKeys()}
          onClick={handleMenuClick}
          disabled={disabled !== false && !forceAllowNav}
          items={[
            {
              key: "/memory",
              label: "记忆",
              icon: <BookOutlined />,
            },
            {
              key: "/chat",
              label: "聊天",
              icon: <CommentOutlined />,
            },
            {
              key: "/live2d",
              label: "Live2D控制",
              icon: <LayoutOutlined />,
            },
            {
              key: "config",
              label: "设置",
              icon: <SettingOutlined />,
              children: [
                {
                  key: "/config/main",
                  label: "推理服务设置",
                  icon: <BlockOutlined />,
                },
                {
                  key: "/config/service",
                  label: "语音服务设置",
                  icon: <ApiOutlined />,
                },
                {
                  key: "/config/layout",
                  label: "自定义设置",
                  icon: <LayoutOutlined />,
                },
              ],
            },
          ]}
        />
      </div>
    </div>
  );
}
