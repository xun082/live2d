import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BarChart3, RotateCcw, Trash2, Volume2, VolumeX } from "lucide-react";
import { useSpeakApi } from "../../stores/useSpeakApi.ts";
import { toast } from "sonner";

interface ChatActionsProps {
  disabled: boolean;
  messagesLength: number;
  usedToken?: number;
  onUpdateMemory: () => void;
  onClearChat: () => void;
}

export function ChatActions({
  disabled,
  messagesLength,
  usedToken,
  onUpdateMemory,
  onClearChat,
}: ChatActionsProps) {
  const hasMessages = messagesLength > 0;
  const isDisabled = disabled || !hasMessages;

  const speak = useSpeakApi((state) => state.speak);
  const currentSpeakApi = useSpeakApi((state) => state.currentSpeakApi);
  const speakApiList = useSpeakApi((state) => state.speakApiList);
  const setSpeakApi = useSpeakApi((state) => state.setSpeakApi);

  const isSpeechEnabled = speak && currentSpeakApi !== "关闭";

  const toggleSpeech = async () => {
    try {
      if (isSpeechEnabled) {
        // 关闭语音
        await setSpeakApi("关闭");
        toast.success("语音播放已关闭");
      } else {
        // 开启语音 - 选择第一个可用的语音服务
        const availableService = speakApiList.find((name) => name !== "关闭");
        if (availableService) {
          await setSpeakApi(availableService);
          toast.success(`语音播放已开启 (${availableService})`);
        } else {
          toast.warning("没有可用的语音服务");
        }
      }
    } catch (error) {
      console.error("切换语音服务失败:", error);
      toast.error("切换语音服务失败");
    }
  };

  return (
    <div
      className={`w-full flex items-center p-4 pb-2 ${
        hasMessages ? "justify-between" : "justify-center"
      }`}
    >
      {/* 左侧：聊天操作按钮 */}
      {hasMessages && (
        <div className="flex items-center gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isDisabled}
                className="h-9 px-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/60 dark:border-gray-600/60 hover:bg-gradient-to-r hover:from-purple-500 hover:to-purple-600 hover:text-white hover:border-purple-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Trash2 size={14} className="mr-2" />
                <span className="text-xs font-medium">更新记忆</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  确认更新记忆
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                  您确定要立即更新记忆吗？这将把当前对话保存到记忆中并清空当前对话。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3">
                <AlertDialogCancel className="rounded-xl">
                  取消
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onUpdateMemory}
                  className="rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  确定
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isDisabled}
                className="h-9 px-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/60 dark:border-gray-600/60 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white hover:border-red-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <RotateCcw size={14} className="mr-2" />
                <span className="text-xs font-medium">清除对话</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-semibold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  确认清除对话
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                  您确定要清除当前对话吗？此操作不可撤销。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3">
                <AlertDialogCancel className="rounded-xl">
                  取消
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onClearChat}
                  className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  确定
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* 语音开关和Token统计 */}
      <div className="flex items-center gap-3">
        {/* 语音开关按钮 - 始终显示 */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSpeech}
          disabled={disabled}
          className={`h-9 px-3 backdrop-blur-sm border-gray-200/60 dark:border-gray-600/60 transition-all duration-300 shadow-sm hover:shadow-md ${
            isSpeechEnabled
              ? "bg-green-100/80 dark:bg-green-900/20 hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600 hover:text-white hover:border-green-500/50 text-green-700 dark:text-green-400"
              : "bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-600 hover:text-white hover:border-gray-500/50"
          }`}
          title={
            isSpeechEnabled
              ? `语音播放已开启 (${currentSpeakApi})`
              : "语音播放已关闭"
          }
        >
          {isSpeechEnabled ? (
            <Volume2 size={14} className="mr-2" />
          ) : (
            <VolumeX size={14} className="mr-2" />
          )}
          <span className="text-xs font-medium">
            {isSpeechEnabled ? "语音开启" : "语音关闭"}
          </span>
        </Button>

        {/* Token统计 */}
        {typeof usedToken === "number" && usedToken > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={disabled}
                className="h-9 w-9 p-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/60 dark:border-gray-600/60 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:text-white hover:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <BarChart3 size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="rounded-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/60 dark:border-gray-700/60">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                <p className="text-sm font-medium">
                  上次词元用量:{" "}
                  <span className="text-blue-600 dark:text-blue-400">
                    {usedToken}
                  </span>
                </p>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
