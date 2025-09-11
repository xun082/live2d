import emojiReg from "emoji-regex";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useAIMotionProcessor } from "../../hooks/useAIMotionProcessor.ts";
import {
  db,
  initializeDatabase,
  isDatabaseReady,
  handleDatabaseError,
} from "../../lib/db/index.ts";
import {
  buildSystemPrompt,
  MEMORY_SYSTEM_PROMPT,
  MOTION_COMMAND_REGEX,
  SUMMARY_PROMPT_TEMPLATE,
  TEXT_SPLIT_REGEX,
} from "../../lib/prompts.ts";
import { sleep, uuid } from "../../lib/utils.ts";
import { useChatApi } from "../../stores/useChatApi.ts";
import { useListenApi } from "../../stores/useListenApi.ts";
import { useLive2dApi } from "../../stores/useLive2dApi.ts";
import { useSpeakApi } from "../../stores/useSpeakApi.ts";
import { useStates } from "../../stores/useStates.ts";
import "../../styles/chat.css";

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
import { PromptBox } from "../../components/chatgpt-prompt-input/";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BarChart3, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface SimpleMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  uuid: string;
}

export default function ChatPage() {
  const disabled = useStates((state) => state.disabled);
  const setDisabled = useStates((state) => state.setDisabled);

  const chat = useChatApi((state) => state.chat);
  const usedToken = useChatApi((state) => state.usedToken);
  const setUsedToken = useChatApi((state) => state.setUsedToken);
  const openaiModelName = useChatApi((state) => state.openaiModelName);
  const processAIResponse = useChatApi((state) => state.processAIResponse);

  // Initialize AI motion processor
  useAIMotionProcessor();

  const speak = useSpeakApi((state) => state.speak);
  const listen = useListenApi((state) => state.listen);

  const showTips = useLive2dApi((state) => state.showTips);
  const hideTips = useLive2dApi((state) => state.hideTips);
  const setTips = useLive2dApi((state) => state.setTips);

  const [messages, setMessages] = useState<SimpleMessage[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [recognition, setRecognition] = useState<any | null>(null);
  const [inputValue, setInputValue] = useState<string>("");

  const senderRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  // 初始化数据库和会话
  useEffect(() => {
    const initDatabaseAndSession = async () => {
      try {
        await initializeDatabase();

        if (!isDatabaseReady()) {
          throw new Error("数据库未能正确初始化");
        }

        let session = await db.getActiveSession();
        if (!session) {
          const sessionId = await db.createSession("默认对话");
          session = {
            id: sessionId,
            name: "默认对话",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isActive: 1, // 使用数字而不是布尔值
          };
        }

        if (session?.id) {
          setCurrentSessionId(session.id);

          const dbMessages = await db.getSessionMessages(session.id);
          const simpleMessages: SimpleMessage[] = dbMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            uuid: msg.uuid,
          }));

          setMessages(simpleMessages);
        }
      } catch (error) {
        console.error("初始化失败:", error);
        const errorMessage = handleDatabaseError(error);
        toast.error(`数据库初始化失败: ${errorMessage}`);
      }
    };

    initDatabaseAndSession();
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // 聊天功能
  const onChat = async (text: string) => {
    if (!currentSessionId) {
      toast.error("会话未初始化");
      return;
    }

    if (!isDatabaseReady()) {
      toast.error("数据库未准备就绪，请重新初始化");
      return;
    }

    const time = Date.now();
    const userMessage: SimpleMessage = {
      role: "user",
      content: text,
      timestamp: time,
      uuid: uuid(),
    };

    try {
      // 添加用户消息
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      // 保存到数据库
      if (currentSessionId && isDatabaseReady()) {
        try {
          await db.addMessage({
            role: userMessage.role,
            content: userMessage.content,
            timestamp: userMessage.timestamp,
            uuid: userMessage.uuid,
            sessionId: currentSessionId,
          });
        } catch (dbError) {
          console.error("保存用户消息失败:", dbError);
          const errorMessage = handleDatabaseError(dbError);
          toast.warning(`消息保存失败: ${errorMessage}`);
        }
      }

      setTips("......");
      showTips();

      // 获取相关记忆
      const relevantMemories = await db.searchMemories(text, 3);

      // 构建系统提示
      const systemPrompt = buildSystemPrompt(relevantMemories);

      // 构建消息数组
      const chatMessages = [
        { role: "system" as const, content: systemPrompt },
        ...newMessages.slice(-10).map((msg) => ({
          // 只取最近10条消息
          role: msg.role,
          content: msg.content,
        })),
      ];

      // 调用聊天API
      const response = await chat.chat.completions.create({
        model: openaiModelName,
        messages: chatMessages,
      });

      const assistantContent =
        response.choices[0]?.message?.content || "抱歉，我无法回应。";
      const tokens = response.usage?.total_tokens || 0;

      await setUsedToken(tokens);

      // Process motion commands first (before cleaning for display)
      processAIResponse(assistantContent);

      // Remove motion commands from content for display and speech
      const cleanContent = assistantContent
        .replace(MOTION_COMMAND_REGEX, "")
        .trim();

      // 语音合成
      const emoji = emojiReg();
      const tts =
        typeof speak === "function"
          ? speak(cleanContent.replace(emoji, "")).then(({ audio }) =>
              db.addAudioCache({
                timestamp: time,
                audio: audio.buffer
                  ? (audio.buffer as unknown as ArrayBuffer)
                  : (audio as unknown as ArrayBuffer),
              })
            )
          : Promise.resolve();

      flushSync(() =>
        setDisabled(
          <div className="flex justify-center items-center gap-3">
            <div className="typing-indicator">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            <span className="text-blue-600 font-medium">AI正在思考中...</span>
          </div>
        )
      );

      // 逐字显示效果
      let current = "";
      let steps = "";

      for (const w of cleanContent) {
        current += w;

        const assistantMessage: SimpleMessage = {
          role: "assistant",
          content: current,
          timestamp: time,
          uuid: uuid(),
        };

        setMessages([...newMessages, assistantMessage]);
        await sleep(30);

        if (w.match(TEXT_SPLIT_REGEX)) {
          setTips(steps + w);
          steps = "";
          await sleep(1000);
        } else {
          steps += w;
          setTips(steps);
        }
      }

      hideTips(10);

      // 保存最终的助手消息
      const finalAssistantMessage: SimpleMessage = {
        role: "assistant",
        content: cleanContent,
        timestamp: time,
        uuid: uuid(),
      };

      if (currentSessionId && isDatabaseReady()) {
        try {
          await db.addMessage({
            role: finalAssistantMessage.role,
            content: finalAssistantMessage.content,
            timestamp: finalAssistantMessage.timestamp,
            uuid: finalAssistantMessage.uuid,
            sessionId: currentSessionId,
          });
        } catch (dbError) {
          console.error("保存AI回复失败:", dbError);
          const errorMessage = handleDatabaseError(dbError);
          toast.warning(`AI回复保存失败: ${errorMessage}`);
        }
      }

      setMessages([...newMessages, finalAssistantMessage]);

      flushSync(() =>
        setDisabled(
          <div className="flex justify-center items-center gap-3">
            <div className="relative">
              <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
              <div className="absolute top-0 left-0 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-ping opacity-30"></div>
            </div>
            <span className="text-green-600 font-medium">正在生成语音...</span>
          </div>
        )
      );

      await tts;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "未知错误");
      console.error("聊天失败:", error);
    }
  };

  // 更新记忆
  const updateMemory = async () => {
    if (messages.length === 0) return;

    try {
      flushSync(() =>
        setDisabled(
          <div className="flex justify-center items-center gap-3">
            <div className="relative">
              <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-spin"></div>
              <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
            <span className="text-purple-600 font-medium">正在更新记忆...</span>
          </div>
        )
      );

      // 生成对话摘要
      const conversation = messages
        .map((msg: SimpleMessage) => `${msg.role}: ${msg.content}`)
        .join("\n");

      const summaryPrompt = SUMMARY_PROMPT_TEMPLATE(conversation);

      const summaryResponse = await chat.chat.completions.create({
        model: openaiModelName,
        messages: [
          {
            role: "system",
            content: MEMORY_SYSTEM_PROMPT,
          },
          { role: "user", content: summaryPrompt },
        ],
      });

      const summary =
        summaryResponse.choices[0]?.message?.content || conversation;

      // 保存记忆到IndexedDB
      await db.addMemory({
        content: conversation,
        summary: summary,
        timestamp: Date.now(),
        importance: Math.min(messages.length, 10),
        tags: [],
      });

      // 清空当前对话
      setMessages([]);
      if (currentSessionId) {
        await db.clearSessionMessages(currentSessionId);
      }

      toast.success("记忆更新成功");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新记忆失败");
      console.error("更新记忆失败:", error);
    }
  };

  // 清除对话
  const clearChat = async () => {
    try {
      flushSync(() =>
        setDisabled(
          <div className="flex justify-center items-center gap-3">
            <div className="relative">
              <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-orange-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-4 h-4 bg-gradient-to-r from-red-400 to-orange-500 rounded-full animate-ping opacity-25"></div>
            </div>
            <span className="text-red-600 font-medium">正在清除对话...</span>
          </div>
        )
      );

      setMessages([]);
      await setUsedToken(undefined);

      if (currentSessionId && isDatabaseReady()) {
        try {
          await db.clearSessionMessages(currentSessionId);
        } catch (dbError) {
          console.error("清除数据库消息失败:", dbError);
          const errorMessage = handleDatabaseError(dbError);
          toast.warning(`清除数据库失败: ${errorMessage}`);
        }
      }

      toast.success("对话已清除");
      setInputValue("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "清除对话失败");
    }
  };

  const [memoMaxHeight, setMemoMaxHeight] = useState<string>("0px");
  useEffect(() => {
    const initSenderHeight = senderRef.current?.clientHeight;
    setMemoMaxHeight(`calc(100dvh - ${initSenderHeight}px - 11rem)`);
  }, []);

  return (
    <div className="w-full max-h-full relative overflow-hidden p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 gap-6 flex flex-col backdrop-blur-lg before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/5 before:via-transparent before:to-purple-500/5 before:rounded-2xl before:pointer-events-none">
      <div
        className="w-full overflow-auto rounded-2xl p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/30 dark:border-gray-700/40 shadow-inner custom-scrollbar relative before:absolute before:inset-0 before:bg-gradient-to-t before:from-transparent before:via-transparent before:to-white/10 dark:before:to-gray-800/10 before:rounded-2xl before:pointer-events-none"
        style={{ maxHeight: memoMaxHeight }}
        ref={messagesRef}
      >
        {messages.length ? (
          <div className="space-y-6">
            {messages.map((msg: SimpleMessage, index: number) => (
              <div
                key={`${msg.uuid}-${index}`}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                } animate-in slide-in-from-bottom-4 duration-300`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`max-w-[75%] p-4 rounded-2xl shadow-lg backdrop-blur-sm border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative overflow-hidden ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white border-blue-400/30 shadow-blue-500/30 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:via-transparent before:to-transparent before:pointer-events-none"
                      : "bg-gradient-to-br from-white via-gray-50 to-blue-50/50 dark:from-gray-700 dark:via-gray-800 dark:to-blue-900/20 text-gray-800 dark:text-gray-100 border-gray-200/50 dark:border-gray-600/50 shadow-gray-500/15 before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/5 before:via-transparent before:to-purple-500/5 before:pointer-events-none"
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed text-sm relative z-10">
                    {msg.content}
                  </div>
                  <div
                    className={`text-xs mt-3 flex items-center gap-1 relative z-10 ${
                      msg.role === "user"
                        ? "text-blue-100"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <div className="w-1 h-1 rounded-full bg-current opacity-60 animate-pulse"></div>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center animate-in fade-in-0 duration-500">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/25 animate-bounce">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-full animate-ping opacity-20"></div>
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-full animate-pulse opacity-10"></div>
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              开始新的对话
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-xs">
              发送消息开始与AI助手进行智能对话，享受流畅的交流体验
            </span>
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <PromptBox
        ref={senderRef}
        header={
          <div className="w-full flex justify-between items-center p-4 pb-2">
            <div className="flex items-center gap-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled !== false || messages.length === 0}
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
                      onClick={updateMemory}
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
                    disabled={disabled !== false || messages.length === 0}
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
                      onClick={clearChat}
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
                    disabled={disabled !== false}
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
        }
        onSubmit={async () => {
          const text = inputValue.trim();
          if (!text) {
            toast.warning("请输入内容");
            return;
          }

          flushSync(() =>
            setDisabled(
              <div className="flex justify-center items-center gap-3">
                <div className="relative">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-bounce"></div>
                  <div className="absolute -top-1 -left-1 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-ping opacity-20"></div>
                </div>
                <span className="text-blue-600 font-medium">
                  正在发送消息...
                </span>
              </div>
            )
          );

          setInputValue("");
          await onChat(text).catch(() => setInputValue(text));
          flushSync(() => setDisabled(false));
        }}
        disabled={disabled !== false}
        loading={disabled !== false}
        value={inputValue}
        onChange={(value: string) => {
          setInputValue(value);
          setTimeout(() => {
            setMemoMaxHeight(
              `calc(100dvh - ${senderRef.current?.clientHeight}px - 11.5rem)`
            );
          }, 10);
        }}
        placeholder="按 Shift + Enter 发送消息"
        allowSpeech={
          listen
            ? {
                recording: recognition !== null,
                onRecordingChange: async (recording: boolean) => {
                  if (recording) {
                    toast.info("再次点击按钮结束说话");
                    const api = listen();
                    setRecognition(api);
                    api.start();
                    return;
                  }
                  try {
                    if (!recognition) {
                      throw new Error("语音识别未初始化");
                    }
                    recognition.stop();
                    const text = await recognition.result;
                    if (!text) {
                      throw new Error("未识别到任何文字");
                    }
                    setInputValue(text);
                  } catch (e) {
                    toast.warning(
                      e instanceof Error
                        ? e.message
                        : typeof e === "string"
                        ? e
                        : "未知错误"
                    );
                  } finally {
                    setRecognition(null);
                  }
                },
              }
            : undefined
        }
      />
    </div>
  );
}
