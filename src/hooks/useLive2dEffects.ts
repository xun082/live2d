import { useEffect } from "react";
import { message } from "antd";
import { useIsMobile } from "./useIsMobile";
import { useLive2dApi } from "./useLive2dApi";

export function useLive2dEffects() {
  const messageApi = message.useMessage()[0];
  const isMobile = useIsMobile();

  const setLive2dOpen = useLive2dApi((state) => state.setLive2dOpen);
  const background = useLive2dApi((state) => state.background);
  const isFullScreen = useLive2dApi((state) => state.isFullScreen);
  const live2dPositionY = useLive2dApi((state) => state.live2dPositionY);
  const live2dPositionX = useLive2dApi((state) => state.live2dPositionX);
  const live2dScale = useLive2dApi((state) => state.live2dScale);

  // 加载看板娘
  useEffect(() => {
    if (isMobile) return;
    setLive2dOpen(true);
    return () => setLive2dOpen(false);
  }, [setLive2dOpen, isMobile]);

  // 调整看板娘位置 (Y)
  useEffect(() => {
    const container = document.getElementById("live2d-container");
    if (!container) {
      messageApi.error("Live2d容器加载失败");
      return;
    }
    if (live2dPositionY >= 0) {
      container.style.bottom = "unset";
      container.style.top = `${live2dPositionY}px`;
    } else {
      container.style.top = "unset";
      container.style.bottom = `${-live2dPositionY}px`;
    }

    const message = document.getElementById("live2d-message");
    if (!message) {
      messageApi.error("Live2d消息框加载失败");
      return;
    }
    const canvas = document.getElementById("live2d");
    if (!canvas) {
      messageApi.error("Live2d模型加载失败");
      return;
    }
    const messageTop = canvas.clientHeight * 0.05 + 10;
    message.style.top = `${messageTop}px`;

    return () => {
      message.style.top = "0";
      container.style.top = "0";
      container.style.bottom = "unset";
    };
  }, [live2dPositionY, messageApi]);

  // 调整看板娘位置 (X)
  useEffect(() => {
    const container = document.getElementById("live2d-container");
    if (!container) {
      messageApi.error("Live2d容器加载失败");
      return;
    }
    container.style.left = `${live2dPositionX}px`;
    return () => {
      container.style.left = "0";
    };
  }, [live2dPositionX, messageApi]);

  // 调整看板娘缩放
  useEffect(() => {
    const canvas = document.getElementById("live2d");
    if (!canvas) {
      messageApi.error("Live2d模型加载失败");
      return;
    }
    canvas.style.transform = `scale(${live2dScale})`;
    return () => {
      canvas.style.transform = "scale(1)";
    };
  }, [live2dScale, messageApi]);

  // 加载背景
  useEffect(() => {
    const element = document.getElementById("back");
    if (!(element instanceof HTMLImageElement)) {
      messageApi.error("背景图片加载失败");
      return;
    }
    element.src = background;
  }, [background, messageApi]);

  // 切换移动模式时发送提示
  useEffect(() => {
    isMobile && messageApi.info("当前为屏幕宽度较小, 将不会显示 Live2D 模型");
  }, [isMobile, messageApi]);

  return { isFullScreen, isMobile };
}
