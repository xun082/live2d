import { message } from "antd";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { DragHandle } from "./components/Layout/DragHandle";
import { Footer } from "./components/Layout/Footer";
import { Navigation } from "./components/Layout/Navigation";
import { useIsMobile } from "./hooks/useIsMobile";
import { useLive2dApi } from "./hooks/useLive2dApi";
import { useLive2dEffects } from "./hooks/useLive2dEffects";
import { useStates } from "./hooks/useStates";

export default function App() {
  const setMessageApi = useStates((state) => state.setMessageApi);
  const setTips = useLive2dApi((state) => state.setTips);
  const showTips = useLive2dApi((state) => state.showTips);
  const hideTips = useLive2dApi((state) => state.hideTips);

  const [messageApi, messageElement] = message.useMessage();
  const isMobile = useIsMobile();
  const { isFullScreen } = useLive2dEffects();

  // 显示欢迎消息
  useEffect(() => {
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

  // 加载消息通知
  useEffect(() => {
    setMessageApi(messageApi);
  }, [messageApi, setMessageApi]);

  // 布局调整
  const [x, setX] = useState<number>(450);

  useEffect(() => {
    const bg = document.getElementById("back-container");
    const l2d = document.getElementById("live2d-container");

    if (!bg || !l2d) {
      messageApi.error("容器加载失败");
      return;
    }

    if (isFullScreen) {
      bg.style.width = "100dvw";
      l2d.style.width = "100dvw";
    } else if (isMobile) {
      bg.style.width = "0";
      l2d.style.width = "0";
    } else {
      bg.style.width = `calc(100dvw - ${x}px)`;
      l2d.style.width = `calc(100dvw - ${x}px)`;
    }
  }, [x, isMobile, isFullScreen, messageApi]);

  return (
    <main className="w-dvw h-dvh overflow-hidden">
      <DragHandle x={x} setX={setX} leftGap={350} rightGap={450} />
      <div
        className="h-dvh overflow-hidden float-right"
        style={{ width: isMobile ? "100dvw" : `${x}px` }}
      >
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
      {messageElement}
    </main>
  );
}
