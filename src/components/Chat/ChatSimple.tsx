import emojiReg from "emoji-regex";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { db } from "../../lib/db/index.ts";
import { useAIMotionProcessor } from "../../lib/hooks/useAIMotionProcessor.ts";
import { useChatApi } from "../../lib/hooks/useChatApi.ts";
import { useListenApi } from "../../lib/hooks/useListenApi.ts";
import { useLive2dApi } from "../../lib/hooks/useLive2dApi.ts";
import { useSpeakApi } from "../../lib/hooks/useSpeakApi.ts";
import { useStates } from "../../lib/hooks/useStates.ts";
import { sleep, uuid } from "../../lib/utils.ts";

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
      let systemPrompt = `你是一个友善的AI助手。你可以通过在回复中包含特殊的动作指令来控制Live2D模型的动作。

可用的动作指令：
- [MOTION:Idle] - 空闲/休息动作
- [MOTION:Tap] - 开心/互动动作（有变体：0,1,2）
- [MOTION:Flick] - 思考/一般动作
- [MOTION:FlickUp] - 惊讶/兴奋动作
- [MOTION:FlickDown] - 失望/难过动作

动作指令使用策略：
1. **开头动作** - 根据整体情绪设置开场动作
2. **中间动作** - 在关键转折点、重点内容、情绪变化时插入动作
3. **结尾动作** - 以合适的动作结束，强化最终情感

使用指南和示例：
• 回答问题时："[MOTION:Flick] 让我想想...这是一个很好的问题。[MOTION:Tap] 我认为答案是...[MOTION:Idle]"
• 表示开心时："[MOTION:Tap] 哈哈，太好了！[MOTION:Tap:1] 我很高兴能帮助你[MOTION:Tap:2]"
• 解释复杂概念："[MOTION:Flick] 这个概念比较复杂...首先...[MOTION:FlickUp] 哇，关键在于...[MOTION:Tap] 这样就清楚了！"
• 表示惊讶："[MOTION:FlickUp] 哇，这真是太令人惊讶了！[MOTION:Flick] 让我仔细想想...[MOTION:Tap] 确实很有趣！"
• 表示抱歉："[MOTION:FlickDown] 很抱歉...[MOTION:Flick] 让我换个方式...[MOTION:Tap] 希望这样更好！"
• 打招呼："[MOTION:Tap:1] 你好！[MOTION:Flick] 我是你的AI助手，[MOTION:Tap] 很高兴为你服务！"
• 告别："[MOTION:Tap] 很高兴和你聊天！[MOTION:Flick] 如果还有问题随时找我，[MOTION:Tap:2] 再见！"

动作节奏建议：
- 短回复（1-2句）：开头+结尾各一个动作
- 中等回复（3-5句）：开头+中间+结尾各一个动作  
- 长回复（6句以上）：开头+多个中间转折点+结尾，保持动作丰富

请在回复中自然地使用这些动作指令，让对话更加生动有趣。动作要与内容情感匹配，在关键时刻增强表达效果。`;
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

      // Process motion commands first (before cleaning for display)
      processAIResponse(assistantContent);

      // Remove motion commands from content for display and speech
      const cleanContent = assistantContent
        .replace(/\[MOTION:\w+(?::\d+)?\]/g, "")
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
          <p className="flex justify-center items-center gap-[0.3rem]">
            回应中 <LoadingOutlined />
          </p>
        )
      );

      // 逐字显示效果
      const reg = /。|？|！|,|，|;|；|~|～|!|\?|\. |…|\n|\r|\r\n|:|：|……/;
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
        content: cleanContent,
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
