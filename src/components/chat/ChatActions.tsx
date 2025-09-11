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
import { BarChart3, RotateCcw, Trash2 } from "lucide-react";

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

  return (
    <div className="w-full flex justify-between items-center p-4 pb-2">
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
              <AlertDialogCancel className="rounded-xl">取消</AlertDialogCancel>
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
              <AlertDialogCancel className="rounded-xl">取消</AlertDialogCancel>
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
  );
}
