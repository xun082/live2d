import { useRef, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ImperativePanelHandle,
} from "react-resizable-panels";
import { Navigation } from "./Navigation";
import { useLive2dContainerWidth } from "../../hooks/useLive2dContainerWidth";

export function DesktopLayout() {
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const { updateLive2dContainerWidth } = useLive2dContainerWidth(leftPanelRef);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 根据窗口大小动态调整面板比例
  const getPanelSizes = () => {
    if (windowSize.width < 1200) {
      return { left: 50, right: 50 }; // 小屏幕时平分
    } else if (windowSize.width < 1600) {
      return { left: 60, right: 40 }; // 中等屏幕
    } else {
      return { left: 65, right: 35 }; // 大屏幕时Live2D区域更大
    }
  };

  const panelSizes = getPanelSizes();

  return (
    <main className="w-dvw h-dvh overflow-hidden desktop-layout">
      <PanelGroup direction="horizontal" className="h-full">
        {/* 左侧 Live2D 区域 */}
        <Panel
          ref={leftPanelRef}
          defaultSize={panelSizes.left}
          minSize={windowSize.width < 1200 ? 40 : 30}
          maxSize={windowSize.width < 1200 ? 70 : 80}
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
        <Panel
          defaultSize={panelSizes.right}
          minSize={windowSize.width < 1200 ? 30 : 20}
          maxSize={windowSize.width < 1200 ? 60 : 70}
          className="bg-white"
        >
          <div className="w-full h-full overflow-hidden grid grid-rows-[1fr_auto]">
            <div
              className="w-full h-full overflow-hidden flex flex-col justify-center items-center py-4"
              style={{
                paddingLeft: windowSize.width < 1200 ? "1rem" : "1.5rem",
                paddingRight: windowSize.width < 1200 ? "1rem" : "1.5rem",
              }}
            >
              <div className="w-full overflow-hidden">
                <Outlet />
              </div>
            </div>
            <Navigation />
          </div>
        </Panel>
      </PanelGroup>
    </main>
  );
}
