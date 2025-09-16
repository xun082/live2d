import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppUpdater } from "@/components/AppUpdater";
import { useResponsive } from "@/hooks/useResponsive";
import { Settings, Download, Zap, Clock, Shield } from "lucide-react";
import { toast } from "sonner";

// 更新设置的配置项
interface UpdateSettings {
  autoCheck: boolean;
  checkInterval: number;
  autoDownload: boolean;
  autoInstall: boolean;
  checkOnStart: boolean;
}

export default function ConfigUpdaterPage() {
  const { screenType, isMobile } = useResponsive();

  const [settings, setSettings] = useState<UpdateSettings>({
    autoCheck: true,
    checkInterval: 3600000, // 1 hour
    autoDownload: false,
    autoInstall: false,
    checkOnStart: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  // 从本地存储加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = localStorage.getItem("updater-settings");
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings((prev) => ({ ...prev, ...parsed }));
        }
      } catch (error) {
        console.error("加载更新设置失败:", error);
      }
    };

    loadSettings();
  }, []);

  // 保存设置到本地存储
  const saveSettings = async (newSettings: UpdateSettings) => {
    try {
      setIsLoading(true);
      localStorage.setItem("updater-settings", JSON.stringify(newSettings));
      setSettings(newSettings);
      toast.success("设置已保存", {
        description: "更新设置已成功保存",
      });
    } catch (error) {
      toast.error("保存设置失败", {
        description: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (
    key: keyof UpdateSettings,
    value: boolean | number
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const resetToDefaults = () => {
    const defaultSettings: UpdateSettings = {
      autoCheck: true,
      checkInterval: 3600000, // 1 hour
      autoDownload: false,
      autoInstall: false,
      checkOnStart: true,
    };
    saveSettings(defaultSettings);
    toast.info("已恢复默认设置");
  };

  // 检查间隔选项
  const intervalOptions = [
    { value: 300000, label: "5 分钟" },
    { value: 900000, label: "15 分钟" },
    { value: 1800000, label: "30 分钟" },
    { value: 3600000, label: "1 小时" },
    { value: 7200000, label: "2 小时" },
    { value: 21600000, label: "6 小时" },
    { value: 43200000, label: "12 小时" },
    { value: 86400000, label: "24 小时" },
  ];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div
        className={`
        flex-1 overflow-y-auto scroll-smooth
        ${
          isMobile
            ? "px-2 py-3"
            : screenType === "tablet"
            ? "px-3 py-4"
            : "px-4 py-5"
        }
      `}
      >
        <div
          className={`
          mx-auto space-y-4
          ${screenType === "mobile" ? "max-w-full" : ""}
          ${screenType === "tablet" ? "max-w-full" : ""}
          ${screenType === "desktop-sm" ? "max-w-full" : ""}
          ${screenType === "desktop-md" ? "max-w-full" : ""}
          ${screenType === "desktop-lg" ? "max-w-full" : ""}
        `}
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <h1
              className={`
              font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent
              ${
                isMobile
                  ? "text-xl"
                  : screenType === "tablet"
                  ? "text-2xl"
                  : "text-3xl"
              }
            `}
            >
              更新设置
            </h1>
            <p
              className={`
              text-muted-foreground
              ${
                isMobile
                  ? "text-xs"
                  : screenType === "tablet"
                  ? "text-sm"
                  : "text-base"
              }
            `}
            >
              配置应用自动更新检测和下载设置
            </p>
          </div>

          {/* 更新检测面板 */}
          <AppUpdater
            variant="card"
            checkInterval={settings.checkInterval}
            checkOnStart={settings.checkOnStart}
          />

          {/* 更新设置卡片 */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
            <CardHeader
              className={`${
                isMobile
                  ? "p-3 pb-2"
                  : screenType === "tablet"
                  ? "p-4 pb-3"
                  : "p-6 pb-4"
              }`}
            >
              <CardTitle
                className={`
                flex items-center gap-2
                ${
                  isMobile
                    ? "text-base"
                    : screenType === "tablet"
                    ? "text-lg"
                    : "text-xl"
                }
              `}
              >
                <Settings
                  className={`text-blue-600 ${
                    isMobile ? "h-4 w-4" : "h-5 w-5"
                  }`}
                />
                更新设置
              </CardTitle>
              <CardDescription>自定义应用更新检测和安装行为</CardDescription>
            </CardHeader>

            <CardContent
              className={`${
                isMobile
                  ? "p-3 space-y-4"
                  : screenType === "tablet"
                  ? "p-4 space-y-5"
                  : "p-6 space-y-6"
              }`}
            >
              {/* 基本设置 */}
              <div className={`${isMobile ? "space-y-3" : "space-y-4"}`}>
                <h3
                  className={`font-semibold text-gray-800 border-b border-gray-200 pb-2 ${
                    isMobile ? "text-sm" : "text-base"
                  }`}
                >
                  基本设置
                </h3>

                {/* 启动时检查更新 */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label
                      className={`font-medium flex items-center gap-2 ${
                        isMobile ? "text-xs" : "text-sm"
                      }`}
                    >
                      <Zap className="h-4 w-4 text-green-600" />
                      启动时检查更新
                    </Label>
                    <p
                      className={`text-muted-foreground ${
                        isMobile ? "text-xs" : "text-sm"
                      }`}
                    >
                      应用启动时自动检查是否有新版本
                    </p>
                  </div>
                  <Switch
                    checked={settings.checkOnStart}
                    onCheckedChange={(checked) =>
                      handleSettingChange("checkOnStart", checked)
                    }
                    disabled={isLoading}
                  />
                </div>

                {/* 自动检查更新 */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label
                      className={`font-medium flex items-center gap-2 ${
                        isMobile ? "text-xs" : "text-sm"
                      }`}
                    >
                      <Clock className="h-4 w-4 text-blue-600" />
                      定期检查更新
                    </Label>
                    <p
                      className={`text-muted-foreground ${
                        isMobile ? "text-xs" : "text-sm"
                      }`}
                    >
                      在后台定期检查更新
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoCheck}
                    onCheckedChange={(checked) =>
                      handleSettingChange("autoCheck", checked)
                    }
                    disabled={isLoading}
                  />
                </div>

                {settings.autoCheck && (
                  <div className={`${isMobile ? "space-y-2" : "space-y-3"}`}>
                    <Label
                      className={`font-medium ${
                        isMobile ? "text-xs" : "text-sm"
                      }`}
                    >
                      检查间隔1111
                    </Label>
                    <Select
                      value={settings.checkInterval.toString()}
                      onValueChange={(value) =>
                        handleSettingChange("checkInterval", parseInt(value))
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择检查间隔" />
                      </SelectTrigger>
                      <SelectContent>
                        {intervalOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value.toString()}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* 高级设置 */}
              <div className={`${isMobile ? "space-y-3" : "space-y-4"}`}>
                <h3
                  className={`font-semibold text-gray-800 border-b border-gray-200 pb-2 ${
                    isMobile ? "text-sm" : "text-base"
                  }`}
                >
                  高级设置
                </h3>

                {/* 自动下载更新 */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label
                      className={`font-medium flex items-center gap-2 ${
                        isMobile ? "text-xs" : "text-sm"
                      }`}
                    >
                      <Download className="h-4 w-4 text-purple-600" />
                      自动下载更新
                    </Label>
                    <p
                      className={`text-muted-foreground ${
                        isMobile ? "text-xs" : "text-sm"
                      }`}
                    >
                      发现新版本时自动下载（不询问用户）
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoDownload}
                    onCheckedChange={(checked) =>
                      handleSettingChange("autoDownload", checked)
                    }
                    disabled={isLoading}
                  />
                </div>

                {/* 自动安装更新 */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label
                      className={`font-medium flex items-center gap-2 ${
                        isMobile ? "text-xs" : "text-sm"
                      }`}
                    >
                      <Shield className="h-4 w-4 text-orange-600" />
                      自动安装更新
                    </Label>
                    <p
                      className={`text-muted-foreground ${
                        isMobile ? "text-xs" : "text-sm"
                      }`}
                    >
                      下载完成后自动安装并重启应用
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoInstall}
                    onCheckedChange={(checked) =>
                      handleSettingChange("autoInstall", checked)
                    }
                    disabled={isLoading}
                  />
                </div>

                {/* 警告提示 */}
                {(settings.autoDownload || settings.autoInstall) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-amber-600 mt-0.5" />
                      <div>
                        <p
                          className={`font-medium text-amber-800 ${
                            isMobile ? "text-xs" : "text-sm"
                          }`}
                        >
                          注意事项
                        </p>
                        <p
                          className={`text-amber-700 ${
                            isMobile ? "text-xs" : "text-sm"
                          } mt-1`}
                        >
                          启用自动下载或安装可能会在无通知的情况下消耗网络流量或重启应用。建议仅在稳定的网络环境下使用。
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={resetToDefaults}
                  disabled={isLoading}
                  className="flex-1"
                >
                  恢复默认设置
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
