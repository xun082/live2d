import { useRef } from "react";
import { Outlet } from "react-router-dom";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ImperativePanelHandle,
} from "react-resizable-panels";
import { Navigation } from "./Navigation";
import { useLive2dContainerWidth } from "../../hooks/useLive2dContainerWidth";
import { useResponsive } from "../../hooks/useResponsive";

export function DesktopLayout() {
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const { updateLive2dContainerWidth } = useLive2dContainerWidth(leftPanelRef);
  const { screenType } = useResponsive();

  // 根据屏幕类型动态调整面板比例
  const getPanelSizes = () => {
    switch (screenType) {
      case "tablet":
        return { left: 50, right: 50 }; // 平板时平分
      case "desktop-sm":
        return { left: 55, right: 45 }; // 小桌面屏幕
      case "desktop-md":
        return { left: 60, right: 40 }; // 中等桌面屏幕
      case "desktop-lg":
        return { left: 65, right: 35 }; // 大桌面屏幕，Live2D区域更大
      default:
        return { left: 50, right: 50 };
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
          minSize={screenType === "tablet" ? 40 : 30}
          maxSize={screenType === "tablet" ? 70 : 80}
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
          minSize={screenType === "tablet" ? 30 : 20}
          maxSize={screenType === "tablet" ? 60 : 70}
          className="bg-white"
        >
          <div className="w-full h-full overflow-hidden grid grid-rows-[1fr_auto]">
            <div
              className={`
                w-full h-full overflow-hidden flex flex-col justify-center items-center py-4
                transition-all duration-300
                ${
                  screenType === "tablet" || screenType === "desktop-sm"
                    ? "px-4"
                    : "px-6"
                }
              `}
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
