import { Blocks, BookOpen, Layout, MessageCircle, Network } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStates } from "../../stores/useStates";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const disabled = useStates((state) => state.disabled);
  const forceAllowNav = useStates((state) => state.forceAllowNav);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // 根据当前路径确定选中的菜单项
  const isSelected = (path: string) => {
    const currentPath = location.pathname;
    if (path === "/chat" && (currentPath === "/" || currentPath === "/chat")) {
      return true;
    }
    return currentPath === path;
  };

  const isDisabled = disabled !== false && !forceAllowNav;

  const allNavItems = [
    {
      key: "/memory",
      label: "记忆",
      icon: BookOpen,
      category: "main",
    },
    {
      key: "/chat",
      label: "聊天",
      icon: MessageCircle,
      category: "main",
    },
    {
      key: "/config/main",
      label: "推理服务",
      icon: Blocks,
      category: "config",
    },
    {
      key: "/config/service",
      label: "语音服务",
      icon: Network,
      category: "config",
    },
    {
      key: "/config/layout",
      label: "自定义设置",
      icon: Layout,
      category: "config",
    },
  ];

  return (
    <div className="w-full flex justify-center items-center py-4 px-4">
      <Card className="w-full max-w-4xl shadow-lg border-0 bg-gradient-to-r from-white to-gray-50/50 backdrop-blur-sm">
        <nav className="flex items-center justify-center p-3">
          <div className="flex items-center space-x-2">
            {allNavItems.map((item, index) => {
              const Icon = item.icon;
              const isItemSelected = isSelected(item.key);
              const isConfigItem = item.category === "config";

              return (
                <div key={item.key} className="relative">
                  {/* 分隔线 */}
                  {index === 2 && (
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
                  )}

                  <Button
                    variant={isItemSelected ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleNavigation(item.key)}
                    disabled={isDisabled}
                    className={`
											relative flex items-center gap-2 px-4 py-2 h-10
											transition-all duration-300 ease-in-out
											${
                        isItemSelected
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
                          : "hover:bg-gray-100 hover:scale-105 text-gray-700 hover:text-gray-900"
                      }
											${isConfigItem ? "text-sm" : "text-base font-medium"}
											rounded-xl border-0
											hover:border-0
											disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
										`}
                  >
                    <Icon
                      className={`h-4 w-4 transition-colors duration-200 ${
                        isItemSelected ? "text-white" : "text-gray-600"
                      }`}
                    />
                    <span className="font-medium">{item.label}</span>

                    {/* 选中状态指示器 */}
                    {isItemSelected && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-sm" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </nav>
      </Card>
    </div>
  );
}
