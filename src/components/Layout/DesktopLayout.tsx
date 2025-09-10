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

export function DesktopLayout() {
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const { updateLive2dContainerWidth } = useLive2dContainerWidth(leftPanelRef);

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
          <div className="w-full h-full overflow-hidden grid grid-rows-[1fr_auto]">
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
          </div>
        </Panel>
      </PanelGroup>
    </main>
  );
}
