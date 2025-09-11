import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useAIMotionProcessor } from "../../hooks/useAIMotionProcessor.ts";
import { useChatSession } from "../../hooks/useChatSession.ts";
import { useChatOperations } from "../../hooks/useChatOperations.ts";
import { useListenApi } from "../../stores/useListenApi.ts";
import { useStates } from "../../stores/useStates.ts";
import "../../styles/chat.css";

import { PromptBox } from "../../components/chatgpt-prompt-input/";
import {
  ChatActions,
  EmptyState,
  MessageItem,
  LoadingStates,
} from "../../components/chat";
import { toast } from "sonner";

export default function ChatPage() {
  const disabled = useStates((state) => state.disabled);
  const setDisabled = useStates((state) => state.setDisabled);

  // Initialize AI motion processor
  useAIMotionProcessor();

  const listen = useListenApi((state) => state.listen);

  // 使用自定义Hooks
  const {
    messages,
    currentSessionId,
    addMessage,
    updateLastMessage,
    saveMessage,
    clearMessages,
    setMessages,
  } = useChatSession();

  const { onChat, updateMemory, clearChat, usedToken } = useChatOperations({
    currentSessionId,
    messages,
    addMessage,
    updateLastMessage,
    saveMessage,
    clearMessages,
    setMessages,
    onClearInput: () => setInputValue(""),
  });

  const [recognition, setRecognition] = useState<any | null>(null);
  const [inputValue, setInputValue] = useState<string>("");

  const senderRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

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
            {messages.map((msg, index: number) => (
              <MessageItem
                key={`${msg.uuid}-${index}`}
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
                index={index}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      <PromptBox
        ref={senderRef}
        header={
          <ChatActions
            disabled={disabled !== false}
            messagesLength={messages.length}
            usedToken={usedToken}
            onUpdateMemory={updateMemory}
            onClearChat={clearChat}
          />
        }
        onSubmit={async () => {
          const text = inputValue.trim();
          if (!text) {
            toast.warning("请输入内容");
            return;
          }

          flushSync(() => setDisabled(LoadingStates.sending));

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
