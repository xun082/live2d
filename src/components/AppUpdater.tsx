import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAppUpdater } from "@/hooks/useAppUpdater";
import { useResponsive } from "@/hooks/useResponsive";
import {
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Rocket,
  Wifi,
  WifiOff,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface AppUpdaterProps {
  /**
   * 是否显示在导航栏中的更新徽章
   */
  showBadge?: boolean;
  /**
   * 自定义检查间隔（毫秒）
   */
  checkInterval?: number;
  /**
   * 应用启动时是否自动检查
   */
  checkOnStart?: boolean;
  /**
   * 样式变体
   */
  variant?: "card" | "compact" | "minimal";
}

export function AppUpdater({
  showBadge = true,
  checkInterval = 3600000, // 1 hour
  checkOnStart = true,
  variant = "card",
}: AppUpdaterProps) {
  const { isMobile } = useResponsive();
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const {
    isChecking,
    isDownloading,
    isUpdateAvailable,
    updateInfo,
    error,
    progress,
    checkForUpdate,
    downloadUpdate,
    restartApp,
  } = useAppUpdater({
    checkInterval,
    checkOnStart: checkOnStart && isOnline,
    autoDownload: false,
    autoInstall: false,
  });

  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 当发现更新时显示对话框
  useEffect(() => {
    if (isUpdateAvailable && updateInfo && !isDownloading) {
      setShowUpdateDialog(true);
      toast.info(`发现新版本 ${updateInfo.version}`, {
        description: "点击查看更新详情",
        action: {
          label: "查看",
          onClick: () => setShowUpdateDialog(true),
        },
      });
    }
  }, [isUpdateAvailable, updateInfo, isDownloading]);

  const handleCheckUpdate = async () => {
    if (!isOnline) {
      toast.error("网络连接不可用", {
        description: "请检查网络连接后重试",
      });
      return;
    }

    try {
      const hasUpdate = await checkForUpdate(false);
      if (!hasUpdate) {
        toast.success("当前已是最新版本", {
          description: "暂无可用更新",
        });
      }
    } catch (error) {
      toast.error("检查更新失败", {
        description: error instanceof Error ? error.message : "未知错误",
      });
    }
  };

  const handleDownloadUpdate = async () => {
    try {
      setShowUpdateDialog(false);
      const success = await downloadUpdate();
      if (success) {
        toast.success("更新下载完成", {
          description: "点击重启应用以完成更新",
          action: {
            label: "重启",
            onClick: restartApp,
          },
        });
      }
    } catch (error) {
      toast.error("下载更新失败", {
        description: error instanceof Error ? error.message : "未知错误",
      });
    }
  };

  // 紧凑模式 - 用于导航栏
  if (variant === "compact") {
    return (
      <>
        <div className="flex items-center gap-2">
          {/* 网络状态指示 */}
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}

          {/* 更新徽章 */}
          {showBadge && isUpdateAvailable && (
            <Badge
              variant="destructive"
              className="animate-pulse cursor-pointer"
              onClick={() => setShowUpdateDialog(true)}
            >
              <Download className="h-3 w-3 mr-1" />
              可更新
            </Badge>
          )}

          {/* 检查更新按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCheckUpdate}
            disabled={isChecking || !isOnline}
            className="h-8 w-8 p-0"
          >
            <RefreshCw
              className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* 更新对话框 */}
        <UpdateDialog
          show={showUpdateDialog}
          onClose={() => setShowUpdateDialog(false)}
          updateInfo={updateInfo}
          isDownloading={isDownloading}
          progress={progress}
          onDownload={handleDownloadUpdate}
          onRestart={restartApp}
          isMobile={isMobile}
        />
      </>
    );
  }

  // 最小模式 - 只显示状态
  if (variant === "minimal") {
    return (
      <div className="flex items-center gap-2">
        {isUpdateAvailable && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUpdateDialog(true)}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <Download className="h-4 w-4 mr-2" />
            更新可用
          </Button>
        )}

        <UpdateDialog
          show={showUpdateDialog}
          onClose={() => setShowUpdateDialog(false)}
          updateInfo={updateInfo}
          isDownloading={isDownloading}
          progress={progress}
          onDownload={handleDownloadUpdate}
          onRestart={restartApp}
          isMobile={isMobile}
        />
      </div>
    );
  }

  // 卡片模式 - 完整的更新面板
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader className={`${isMobile ? "p-4 pb-2" : "p-6 pb-4"}`}>
        <CardTitle
          className={`flex items-center gap-2 ${
            isMobile ? "text-lg" : "text-xl"
          }`}
        >
          <Rocket className="h-5 w-5 text-blue-600" />
          应用更新
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              网络连接正常
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-500" />
              网络连接不可用
            </>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent
        className={`${isMobile ? "p-4 py-2" : "p-6 py-4"} space-y-4`}
      >
        {/* 当前版本信息 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">当前版本</span>
          <Badge variant="outline">v2.0.2</Badge>
        </div>

        {/* 更新状态 */}
        {isUpdateAvailable ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-700">
                发现新版本 {updateInfo?.version}
              </span>
            </div>

            {isDownloading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>下载进度</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-700">当前已是最新版本</span>
          </div>
        )}

        {/* 错误信息 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* 最后检查时间 */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          最后检查: {new Date().toLocaleTimeString()}
        </div>
      </CardContent>

      <CardFooter
        className={`${isMobile ? "p-4 pt-2" : "p-6 pt-4"} flex gap-2`}
      >
        <Button
          variant="outline"
          onClick={handleCheckUpdate}
          disabled={isChecking || !isOnline}
          className="flex-1"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`}
          />
          {isChecking ? "检查中..." : "检查更新"}
        </Button>

        {isUpdateAvailable && (
          <Button
            onClick={() => setShowUpdateDialog(true)}
            disabled={isDownloading}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "下载中..." : "立即更新"}
          </Button>
        )}
      </CardFooter>

      {/* 更新对话框 */}
      <UpdateDialog
        show={showUpdateDialog}
        onClose={() => setShowUpdateDialog(false)}
        updateInfo={updateInfo}
        isDownloading={isDownloading}
        progress={progress}
        onDownload={handleDownloadUpdate}
        onRestart={restartApp}
        isMobile={isMobile}
      />
    </Card>
  );
}

// 更新对话框组件
interface UpdateDialogProps {
  show: boolean;
  onClose: () => void;
  updateInfo: any;
  isDownloading: boolean;
  progress: number;
  onDownload: () => void;
  onRestart: () => void;
  isMobile: boolean;
}

function UpdateDialog({
  show,
  onClose,
  updateInfo,
  isDownloading,
  progress,
  onDownload,
  onRestart,
  isMobile,
}: UpdateDialogProps) {
  if (!updateInfo) return null;

  return (
    <AlertDialog open={show} onOpenChange={onClose}>
      <AlertDialogContent className={`${isMobile ? "max-w-sm" : "max-w-md"}`}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-blue-600" />
            发现新版本 {updateInfo.version}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            <div className="space-y-3">
              <p>有新的版本可供下载，是否立即更新？</p>

              {/* 更新内容 */}
              {updateInfo.body && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    更新内容：
                  </h4>
                  <div className="text-xs text-gray-600 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {updateInfo.body}
                  </div>
                </div>
              )}

              {/* 下载进度 */}
              {isDownloading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>下载进度</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-gray-500">
                    正在下载更新包，请稍候...
                  </p>
                </div>
              )}

              {/* 已完成下载 */}
              {progress === 100 && !isDownloading && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">更新下载完成</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    点击"重启应用"完成更新
                  </p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel disabled={isDownloading}>
            稍后提醒
          </AlertDialogCancel>

          {progress === 100 ? (
            <AlertDialogAction onClick={onRestart}>
              <Rocket className="h-4 w-4 mr-2" />
              重启应用
            </AlertDialogAction>
          ) : (
            <AlertDialogAction onClick={onDownload} disabled={isDownloading}>
              <Download
                className={`h-4 w-4 mr-2 ${
                  isDownloading ? "animate-pulse" : ""
                }`}
              />
              {isDownloading ? "下载中..." : "立即下载"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
