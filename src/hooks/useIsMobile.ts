import { useSyncExternalStore } from "react";

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

function subscribe(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

function getSnapshot() {
  // 在桌面端Tauri应用中，使用更合理的断点
  // 同时考虑用户代理字符串来更准确判断设备类型
  const isMobileUserAgent =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  const isSmallScreen = window.innerWidth < 1024; // 提高断点到1024px，更适合桌面端

  return isMobileUserAgent || isSmallScreen;
}
