import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useChatApi } from "../../lib/hooks/useChatApi.ts";
import { useListenApi } from "../../lib/hooks/useListenApi.ts";
import { useLive2dApi } from "../../lib/hooks/useLive2dApi.ts";
import { useSpeakApi } from "../../lib/hooks/useSpeakApi.ts";
import { useStates } from "../../lib/hooks/useStates.ts";
import { db } from "../../lib/db/index.ts";
import { uuid, sleep } from "../../lib/utils.ts";
import emojiReg from "emoji-regex";

import {
  ClearOutlined,
  DashboardOutlined,
  LoadingOutlined,
  RestOutlined,
} from "@ant-design/icons";
import { Sender } from "@ant-design/x";
import { Button, type GetRef, Popconfirm, Popover } from "antd";
import { MessageBox } from "./MessageBox.tsx";

interface SimpleMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  uuid: string;
}

export function ChatSimple() {
  const disabled = useStates((state) => state.disabled);
  const setDisabled = useStates((state) => state.setDisabled);
  const messageApi = useStates((state) => state.messageApi);

  const chat = useChatApi((state) => state.chat);
  const usedToken = useChatApi((state) => state.usedToken);
  const setUsedToken = useChatApi((state) => state.setUsedToken);
  const openaiModelName = useChatApi((state) => state.openaiModelName);
  const addThinkCache = useChatApi((state) => state.addThinkCache);

  const speak = useSpeakApi((state) => state.speak);
  const listen = useListenApi((state) => state.listen);

  const showTips = useLive2dApi((state) => state.showTips);
  const hideTips = useLive2dApi((state) => state.hideTips);
  const setTips = useLive2dApi((state) => state.setTips);

  const [messages, setMessages] = useState<SimpleMessage[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [recognition, setRecognition] = useState<any | null>(null);
  const [inputValue, setInputValue] = useState<string>("");

  const senderRef = useRef<GetRef<typeof Sender>>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  // 初始化会话
  useEffect(() => {
    const initSession = async () => {
      try {
        let session = await db.getActiveSession();

        if (!session) {
          const sessionId = await db.createSession("默认对话");
          session = {
            id: sessionId,
            name: "默认对话",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isActive: true,
          };
        }

        if (session?.id) {
          setCurrentSessionId(session.id);

          // 加载会话消息
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
        console.error("初始化会话失败:", error);
        messageApi?.error("初始化会话失败");
      }
    };

    initSession();
  }, [messageApi]);

  // 自动滚动到底部
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // 聊天功能
  const onChat = async (text: string) => {
    if (!currentSessionId) {
      messageApi?.error("会话未初始化");
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
      await db.addMessage({
        role: userMessage.role,
        content: userMessage.content,
        timestamp: userMessage.timestamp,
        uuid: userMessage.uuid,
        sessionId: currentSessionId,
      });

      setTips("......");
      showTips();

      // 获取相关记忆
      const relevantMemories = await db.searchMemories(text, 3);

      // 构建系统提示
      let systemPrompt = "你是一个友善的AI助手。";
      if (relevantMemories.length > 0) {
        systemPrompt +=
          "\n\n相关记忆：\n" +
          relevantMemories.map((m) => `- ${m.summary}`).join("\n");
      }

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

      // 语音合成
      const emoji = emojiReg();
      const tts =
        typeof speak === "function"
          ? speak(assistantContent.replace(emoji, "")).then(({ audio }) =>
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
          <p className="flex justify-center items-center gap-[0.3rem]">
            回应中 <LoadingOutlined />
          </p>
        )
      );

      // 逐字显示效果
      const reg = /。|？|！|,|，|;|；|~|～|!|\?|\. |…|\n|\r|\r\n|:|：|……/;
      let current = "";
      let steps = "";

      for (const w of assistantContent) {
        current += w;

        const assistantMessage: SimpleMessage = {
          role: "assistant",
          content: current,
          timestamp: time,
          uuid: uuid(),
        };

        setMessages([...newMessages, assistantMessage]);
        await sleep(30);

        if (w.match(reg)) {
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
        content: assistantContent,
        timestamp: time,
        uuid: uuid(),
      };

      await db.addMessage({
        role: finalAssistantMessage.role,
        content: finalAssistantMessage.content,
        timestamp: finalAssistantMessage.timestamp,
        uuid: finalAssistantMessage.uuid,
        sessionId: currentSessionId,
      });

      setMessages([...newMessages, finalAssistantMessage]);

      flushSync(() =>
        setDisabled(
          <p className="flex justify-center items-center gap-[0.3rem]">
            等待语音生成结束 <LoadingOutlined />
          </p>
        )
      );

      await tts;
    } catch (error) {
      messageApi?.error(error instanceof Error ? error.message : "未知错误");
      console.error("聊天失败:", error);
    }
  };

  // 更新记忆
  const updateMemory = async () => {
    if (messages.length === 0) return;

    try {
      flushSync(() =>
        setDisabled(
          <p className="flex justify-center items-center gap-[0.3rem]">
            更新记忆中 <LoadingOutlined />
          </p>
        )
      );

      // 生成对话摘要
      const conversation = messages
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");

      const summaryPrompt = `请为以下对话生成一个简洁的摘要，突出重要信息：\n\n${conversation}`;

      const summaryResponse = await chat.chat.completions.create({
        model: openaiModelName,
        messages: [
          {
            role: "system",
            content: "你是记忆助手，负责整理和总结对话内容。",
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

      messageApi?.success("记忆更新成功");
    } catch (error) {
      messageApi?.error(
        error instanceof Error ? error.message : "更新记忆失败"
      );
      console.error("更新记忆失败:", error);
    }
  };

  // 清除对话
  const clearChat = async () => {
    try {
      flushSync(() =>
        setDisabled(
          <p className="flex justify-center items-center gap-[0.3rem]">
            清除对话中 <LoadingOutlined />
          </p>
        )
      );

      setMessages([]);
      await setUsedToken(undefined);

      if (currentSessionId) {
        await db.clearSessionMessages(currentSessionId);
      }

      messageApi?.success("对话已清除");
      setInputValue("");
    } catch (error) {
      messageApi?.error(
        error instanceof Error ? error.message : "清除对话失败"
      );
    }
  };

  const [memoMaxHeight, setMemoMaxHeight] = useState<string>("0px");
  useEffect(() => {
    const initSenderHeight = senderRef.current?.nativeElement.clientHeight;
    setMemoMaxHeight(`calc(100dvh - ${initSenderHeight}px - 11rem)`);
  }, []);

  return (
    <div className="w-full max-h-full relative overflow-hidden p-4 bg-white rounded-md border border-blue-900 gap-4 flex flex-col">
      <div
        className="w-full overflow-auto border rounded-lg p-3 border-[#d9d9d9] hover:border-[#5794f7] transition-none"
        style={{ maxHeight: memoMaxHeight }}
        ref={messagesRef}
      >
        {messages.length ? (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={`${msg.uuid}-${index}`}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">无对话内容</span>
        )}
      </div>

      <Sender
        ref={senderRef}
        header={
          <div className="w-full flex justify-start items-center gap-2 p-2 pb-0">
            <Popconfirm
              title="您确定要立即更新记忆吗？"
              onConfirm={updateMemory}
              okText="确定"
              cancelText="取消"
            >
              <Button
                size="small"
                icon={<ClearOutlined />}
                disabled={disabled !== false || messages.length === 0}
              >
                <span className="text-xs">更新记忆</span>
              </Button>
            </Popconfirm>

            <Popconfirm
              title="您确定要清除当前对话吗？"
              onConfirm={clearChat}
              okText="确定"
              cancelText="取消"
            >
              <Button
                size="small"
                icon={<RestOutlined />}
                disabled={disabled !== false || messages.length === 0}
              >
                <span className="text-xs">清除当前对话</span>
              </Button>
            </Popconfirm>

            {typeof usedToken === "number" && usedToken > 0 && (
              <Popover content={`上次词元用量: ${usedToken}`}>
                <Button
                  size="small"
                  icon={<DashboardOutlined />}
                  disabled={disabled !== false}
                />
              </Popover>
            )}
          </div>
        }
        onSubmit={async () => {
          const text = inputValue.trim();
          if (!text) {
            messageApi?.warning("请输入内容");
            return;
          }

          flushSync(() =>
            setDisabled(
              <p className="flex justify-center items-center gap-[0.3rem]">
                对话中 <LoadingOutlined />
              </p>
            )
          );

          setInputValue("");
          await onChat(text).catch(() => setInputValue(text));
          flushSync(() => setDisabled(false));
        }}
        disabled={disabled !== false}
        loading={disabled !== false}
        value={inputValue}
        onChange={(value) => {
          setInputValue(value);
          setTimeout(() => {
            setMemoMaxHeight(
              `calc(100dvh - ${senderRef.current?.nativeElement.clientHeight}px - 11.5rem)`
            );
          }, 10);
        }}
        submitType="shiftEnter"
        placeholder="按 Shift + Enter 发送消息"
        allowSpeech={
          listen
            ? {
                recording: recognition !== null,
                onRecordingChange: async (recording) => {
                  if (recording) {
                    messageApi?.info("再次点击按钮结束说话");
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
                    messageApi?.warning(
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
