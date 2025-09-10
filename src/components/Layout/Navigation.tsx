import {
  Blocks,
  BookOpen,
  ChevronDown,
  Layout,
  MessageCircle,
  Network,
  Settings,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStates } from "../../stores/useStates";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

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

  const navItems = [
    {
      key: "/memory",
      label: "记忆",
      icon: BookOpen,
    },
    {
      key: "/chat",
      label: "聊天",
      icon: MessageCircle,
    },
  ];

  const configItems = [
    {
      key: "/config/main",
      label: "推理服务设置",
      icon: Blocks,
    },
    {
      key: "/config/service",
      label: "语音服务设置",
      icon: Network,
    },
    {
      key: "/config/layout",
      label: "自定义设置",
      icon: Layout,
    },
  ];

  return (
    <div className="w-full h-full flex justify-center items-center">
      <Card className="flex justify-center items-center overflow-hidden">
        <nav className="flex items-center space-x-1 p-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.key}
                variant={isSelected(item.key) ? "default" : "ghost"}
                size="sm"
                onClick={() => handleNavigation(item.key)}
                disabled={isDisabled}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            );
          })}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={
                  configItems.some((item) => isSelected(item.key))
                    ? "default"
                    : "ghost"
                }
                size="sm"
                disabled={isDisabled}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                设置
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {configItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.key}
                    onClick={() => handleNavigation(item.key)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </Card>
    </div>
  );
}
