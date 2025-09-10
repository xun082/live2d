import { Toaster } from "@/components/ui/sonner";
import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ImperativePanelHandle,
} from "react-resizable-panels";
import { Footer } from "./components/Layout/Footer";
import { Navigation } from "./components/Layout/Navigation";
import { useIsMobile } from "./hooks/useIsMobile";
import { useLive2dEffects } from "./hooks/useLive2dEffects";
import { useLive2dApi } from "./stores/useLive2dApi";
import { migrateFromWebToTauri } from "./lib/utils";

export default function App() {
  const setTips = useLive2dApi((state) => state.setTips);
  const showTips = useLive2dApi((state) => state.showTips);
  const hideTips = useLive2dApi((state) => state.hideTips);
  const isMobile = useIsMobile();
  const { isFullScreen } = useLive2dEffects();
  const leftPanelRef = useRef<ImperativePanelHandle>(null);

  // 数据迁移和欢迎消息
  useEffect(() => {
    // 执行数据迁移（从 Web 存储到 Tauri 存储）
    migrateFromWebToTauri().catch(console.error);

    if (sessionStorage.getItem("welcome-message-shown") === "yes" || isMobile) {
      return;
    }
    sessionStorage.setItem("welcome-message-shown", "yes");
    const timer = setTimeout(() => {
      setTips("用户, 我们又见面啦!");
      showTips();
      hideTips(8);
    }, 1000);
    return () => clearTimeout(timer);
  }, [setTips, showTips, hideTips, isMobile]);

  // 更新 Live2D 容器宽度的函数
  const updateLive2dContainerWidth = () => {
    const bg = document.getElementById("back-container");
    const l2d = document.getElementById("live2d-container");

    if (!bg || !l2d) {
      console.error("容器加载失败");
      return;
    }

    if (isFullScreen) {
      bg.style.width = "100dvw";
      l2d.style.width = "100dvw";
    } else if (isMobile) {
      bg.style.width = "0";
      l2d.style.width = "0";
    } else {
      // 在桌面模式下，获取左侧面板的实际宽度
      const leftPanel = leftPanelRef.current;
      if (leftPanel) {
        const size = leftPanel.getSize();
        const leftWidth = `${size}%`;
        bg.style.width = leftWidth;
        l2d.style.width = leftWidth;
      }
    }
  };

  // 布局调整 - 使用 react-resizable-panels
  useEffect(() => {
    updateLive2dContainerWidth();
  }, [isMobile, isFullScreen]);

  // 监听面板大小变化
  useEffect(() => {
    if (isMobile || isFullScreen) return;

    const handleResize = () => {
      updateLive2dContainerWidth();
    };

    // 使用 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver(handleResize);
    const targetNode = document.body;
    observer.observe(targetNode, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ["style"],
    });

    return () => {
      observer.disconnect();
    };
  }, [isMobile, isFullScreen]);

  // 如果是移动端或全屏模式，使用简单布局
  if (isMobile || isFullScreen) {
    return (
      <main className="w-dvw h-dvh overflow-hidden">
        <div className="h-dvh overflow-hidden">
          <div className="w-full h-full overflow-hidden grid grid-rows-[1fr_3.2rem_2.8rem]">
            <div
              className="w-full h-full overflow-hidden flex flex-col justify-center items-center py-4"
              style={{
                paddingLeft: isMobile ? "1rem" : "1.5rem",
                paddingRight: isMobile ? "1rem" : "1.5rem",
              }}
            >
              <div className="w-full overflow-hidden">
                <Outlet />
              </div>
            </div>
            <Navigation />
            <Footer />
          </div>
        </div>
        <Toaster />
      </main>
    );
  }

  // 桌面模式使用可调整大小的面板
  return (
    <main className="w-dvw h-dvh overflow-hidden">
      <PanelGroup direction="horizontal" className="h-full">
        {/* 左侧 Live2D 区域 */}
        <Panel
          ref={leftPanelRef}
          defaultSize={60}
          minSize={30}
          maxSize={80}
          className="relative"
          onResize={updateLive2dContainerWidth}
        >
          <div
            id="back-container"
            className="w-full h-full"
            style={{ width: "100%" }}
          />
          <div
            id="live2d-container"
            className="absolute inset-0 w-full h-full"
            style={{ width: "100%" }}
          />
        </Panel>

        {/* 拖拽手柄 */}
        <PanelResizeHandle className="w-1 bg-gray-300 hover:bg-gray-400 transition-colors cursor-col-resize" />

        {/* 右侧控制面板 */}
        <Panel defaultSize={40} minSize={20} maxSize={70} className="bg-white">
          <div className="w-full h-full overflow-hidden grid grid-rows-[1fr_3.2rem_2.8rem]">
            <div
              className="w-full h-full overflow-hidden flex flex-col justify-center items-center py-4"
              style={{
                paddingLeft: "1.5rem",
                paddingRight: "1.5rem",
              }}
            >
              <div className="w-full overflow-hidden">
                <Outlet />
              </div>
            </div>
            <Navigation />
            <Footer />
          </div>
        </Panel>
      </PanelGroup>
      <Toaster />
    </main>
  );
}
