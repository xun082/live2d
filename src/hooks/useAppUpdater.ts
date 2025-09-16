import { useEffect, useState } from "react";

// 使用 any 类型来避免类型冲突，在 Tauri 环境中会使用正确的类型
type Update = any;
type DownloadEvent = any;

// Tauri 插件函数声明
declare global {
  interface Window {
    __TAURI_INTERNALS__: any;
  }
}

// 模拟 Tauri 插件函数（在开发环境中使用）
const isTauri = typeof window !== "undefined" && window.__TAURI_INTERNALS__;

const check = async (): Promise<Update | null> => {
  if (!isTauri) {
    // 开发环境模拟 - 检查GitHub API
    console.log("🔄 检查更新 (Web模式 - 使用GitHub API)");
    try {
      const response = await fetch("https://api.github.com/repos/xun082/live2d/releases/latest");
      if (!response.ok) {
        throw new Error("获取更新信息失败");
      }
      const release = await response.json();
      const latestVersion = release.tag_name.replace('v', '');
      const currentVersion = "2.0.5"; // 当前版本
      
      // 简单的版本比较
      if (latestVersion !== currentVersion) {
        return {
          version: latestVersion,
          body: release.body || "发现新版本！",
          date: release.published_at,
          currentVersion: currentVersion
        } as any;
      }
      return null;
    } catch (error) {
      console.warn("Web模式更新检查失败:", error);
      return null;
    }
  }

  try {
    const { check } = await import("@tauri-apps/plugin-updater");
    return await check();
  } catch (error) {
    console.warn("更新器插件未可用:", error);
    return null;
  }
};

const ask = async (message: string, options?: any): Promise<boolean> => {
  if (!isTauri) {
    // 开发环境使用浏览器确认对话框
    return window.confirm(message);
  }

  try {
    const { ask } = await import("@tauri-apps/plugin-dialog");
    return await ask(message, options);
  } catch (error) {
    console.warn("对话框插件未可用:", error);
    return window.confirm(message);
  }
};

const relaunch = async (): Promise<void> => {
  if (!isTauri) {
    console.log("🔄 重启应用 (开发模式)");
    window.location.reload();
    return;
  }

  try {
    // 在 Tauri 环境中，更新后会自动重启，这里只是页面重新加载作为后备
    window.location.reload();
  } catch (error) {
    console.warn("进程插件未可用:", error);
    window.location.reload();
  }
};

interface UpdateState {
  isChecking: boolean;
  isDownloading: boolean;
  isUpdateAvailable: boolean;
  updateInfo: Update | null;
  error: string | null;
  progress: number;
}

interface UseAppUpdaterOptions {
  /**
   * 自动检查更新的间隔时间（毫秒）
   * 默认为 1 小时（3600000ms）
   */
  checkInterval?: number;
  /**
   * 是否在应用启动时自动检查更新
   * 默认为 true
   */
  checkOnStart?: boolean;
  /**
   * 是否自动下载更新（不询问用户）
   * 默认为 false
   */
  autoDownload?: boolean;
  /**
   * 是否在下载完成后自动安装并重启
   * 默认为 false
   */
  autoInstall?: boolean;
}

export function useAppUpdater(options: UseAppUpdaterOptions = {}) {
  const {
    checkInterval = 3600000, // 1 hour
    checkOnStart = true,
    autoDownload = false,
    autoInstall = false,
  } = options;

  const [updateState, setUpdateState] = useState<UpdateState>({
    isChecking: false,
    isDownloading: false,
    isUpdateAvailable: false,
    updateInfo: null,
    error: null,
    progress: 0,
  });

  /**
   * 检查更新
   */
  const checkForUpdate = async (silent = false): Promise<boolean> => {
    try {
      setUpdateState((prev) => ({ ...prev, isChecking: true, error: null }));

      const update = await check();

      if (update) {
        setUpdateState((prev) => ({
          ...prev,
          isUpdateAvailable: true,
          updateInfo: update,
          isChecking: false,
        }));

        if (!silent) {
          console.log("🔄 发现新版本:", update.version);
          console.log("📝 更新说明:", update.body);
        }

        // 如果设置了自动下载，立即开始下载
        if (autoDownload) {
          await downloadUpdate();
        }

        return true;
      } else {
        setUpdateState((prev) => ({
          ...prev,
          isUpdateAvailable: false,
          updateInfo: null,
          isChecking: false,
        }));

        if (!silent) {
          console.log("✅ 当前已是最新版本");
        }

        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "检查更新失败";
      setUpdateState((prev) => ({
        ...prev,
        isChecking: false,
        error: errorMessage,
      }));

      if (!silent) {
        console.error("❌ 检查更新失败:", errorMessage);
      }

      return false;
    }
  };

  /**
   * 下载更新
   */
  const downloadUpdate = async (): Promise<boolean> => {
    if (!updateState.updateInfo) return false;

    try {
      setUpdateState((prev) => ({
        ...prev,
        isDownloading: true,
        progress: 0,
        error: null,
      }));

      if (!isTauri) {
        // Web模式 - 模拟下载过程并引导用户手动下载
        console.log("📥 Web模式：模拟下载更新...");
        
        // 模拟下载进度
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setUpdateState((prev) => ({ ...prev, progress: i }));
        }
        
        setUpdateState((prev) => ({
          ...prev,
          progress: 100,
          isDownloading: false,
        }));
        
        // 引导用户手动下载
        const shouldOpen = await ask(
          `发现新版本 v${updateState.updateInfo.version}！\n\n在Web模式下，请手动访问GitHub下载最新版本。\n\n是否现在打开下载页面？`,
          {
            title: "手动更新",
            kind: "info",
          }
        );
        
        if (shouldOpen) {
          window.open("https://github.com/xun082/live2d/releases/latest", "_blank");
        }
        
        return true;
      }

      let downloaded = 0;
      let contentLength = 0;

      // Tauri模式 - 真实下载更新
      await updateState.updateInfo.downloadAndInstall(
        (event: DownloadEvent) => {
          switch (event.event) {
            case "Started":
              contentLength = event.data.contentLength || 0;
              console.log("📥 开始下载更新...");
              break;
            case "Progress":
              downloaded += event.data.chunkLength || 0;
              const progress =
                contentLength > 0 ? (downloaded / contentLength) * 100 : 0;
              setUpdateState((prev) => ({ ...prev, progress }));
              console.log(`📥 下载进度: ${progress.toFixed(1)}%`);
              break;
            case "Finished":
              setUpdateState((prev) => ({
                ...prev,
                progress: 100,
                isDownloading: false,
              }));
              console.log("✅ 更新下载完成");
              break;
          }
        }
      );

      // 如果设置了自动安装，询问用户是否重启
      if (autoInstall) {
        const shouldRestart = await ask(
          "更新已下载完成，是否立即重启应用以完成更新？",
          {
            title: "更新完成",
            kind: "info",
          }
        );

        if (shouldRestart) {
          await relaunch();
        }
      }

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "下载更新失败";
      setUpdateState((prev) => ({
        ...prev,
        isDownloading: false,
        error: errorMessage,
        progress: 0,
      }));

      console.error("❌ 下载更新失败:", errorMessage);
      return false;
    }
  };

  /**
   * 手动触发更新检查并询问用户
   */
  const checkAndPromptUpdate = async (): Promise<void> => {
    const hasUpdate = await checkForUpdate();

    if (hasUpdate && updateState.updateInfo) {
      const shouldUpdate = await ask(
        `发现新版本 ${updateState.updateInfo.version}，是否立即更新？\n\n更新内容：\n${updateState.updateInfo.body}`,
        {
          title: "发现新版本",
          kind: "info",
        }
      );

      if (shouldUpdate) {
        await downloadUpdate();
      }
    }
  };

  /**
   * 重启应用（通常在更新完成后调用）
   */
  const restartApp = async (): Promise<void> => {
    try {
      await relaunch();
    } catch (error) {
      console.error("❌ 重启应用失败:", error);
    }
  };

  // 应用启动时检查更新
  useEffect(() => {
    if (checkOnStart) {
      // 延迟 3 秒后检查，避免影响应用启动速度
      const timer = setTimeout(() => {
        checkForUpdate(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [checkOnStart]);

  // 定期检查更新
  useEffect(() => {
    if (checkInterval > 0) {
      const interval = setInterval(() => {
        checkForUpdate(true);
      }, checkInterval);

      return () => clearInterval(interval);
    }
  }, [checkInterval]);

  return {
    ...updateState,
    checkForUpdate,
    downloadUpdate,
    checkAndPromptUpdate,
    restartApp,
  };
}
