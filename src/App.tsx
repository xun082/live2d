import { Toaster } from "@/components/ui/sonner";
import { MobileLayout } from "./components/Layout/MobileLayout";
import { DesktopLayout } from "./components/Layout/DesktopLayout";
import { useIsMobile } from "./hooks/useIsMobile";
import { useLive2dEffects } from "./hooks/useLive2dEffects";
import { useWelcomeMessage } from "./hooks/useWelcomeMessage";

export default function App() {
  const isMobile = useIsMobile();
  const { isFullScreen } = useLive2dEffects();

  // 初始化欢迎消息和数据迁移
  useWelcomeMessage();

  // 根据设备类型和全屏状态选择布局
  if (isMobile || isFullScreen) {
    return (
      <>
        <MobileLayout />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <DesktopLayout />
      <Toaster />
    </>
  );
}
