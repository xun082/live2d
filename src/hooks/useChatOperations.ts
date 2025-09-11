import emojiReg from "emoji-regex";
import { flushSync } from "react-dom";
import {
  buildSystemPrompt,
  MEMORY_SYSTEM_PROMPT,
  MOTION_COMMAND_REGEX,
  SUMMARY_PROMPT_TEMPLATE,
  TEXT_SPLIT_REGEX,
} from "../lib/prompts.ts";
import { sleep, uuid } from "../lib/utils.ts";
import { useChatApi } from "../stores/useChatApi.ts";
import { useLive2dApi } from "../stores/useLive2dApi.ts";
import { useSpeakApi } from "../stores/useSpeakApi.ts";
import { useStates } from "../stores/useStates.ts";
import { db, isDatabaseReady } from "../lib/db/index.ts";
import { toast } from "sonner";
import { LoadingStates } from "../components/chat/LoadingIndicator.tsx";

interface SimpleMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  uuid: string;
}

interface UseChatOperationsParams {
  currentSessionId: number | null;
  messages: SimpleMessage[];
  addMessage: (message: SimpleMessage) => void;
  updateLastMessage: (content: string) => void;
  saveMessage: (message: SimpleMessage) => void;
  clearMessages: () => void;
  setMessages: (messages: SimpleMessage[]) => void;
  onClearInput?: () => void;
}

export function useChatOperations({
  currentSessionId,
  messages,
  addMessage,
  updateLastMessage,
  saveMessage,
  clearMessages,
  setMessages,
  onClearInput,
}: UseChatOperationsParams) {
  const setDisabled = useStates((state) => state.setDisabled);
  const chat = useChatApi((state) => state.chat);
  const usedToken = useChatApi((state) => state.usedToken);
  const setUsedToken = useChatApi((state) => state.setUsedToken);
  const openaiModelName = useChatApi((state) => state.openaiModelName);
  const processAIResponse = useChatApi((state) => state.processAIResponse);
  const speak = useSpeakApi((state) => state.speak);
  const showTips = useLive2dApi((state) => state.showTips);
  const hideTips = useLive2dApi((state) => state.hideTips);
  const setTips = useLive2dApi((state) => state.setTips);

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
      addMessage(userMessage);
      await saveMessage(userMessage);

      setTips("......");
      showTips();

      // 获取相关记忆
      const relevantMemories = await db.searchMemories(text, 3);

      // 构建系统提示
      const systemPrompt = buildSystemPrompt(relevantMemories);

      // 构建消息数组
      const allMessages = [...messages, userMessage];
      const chatMessages = [
        { role: "system" as const, content: systemPrompt },
        ...allMessages.slice(-10).map((msg) => ({
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

      // Process motion commands first
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

      flushSync(() => setDisabled(LoadingStates.thinking));

      // 创建初始的助手消息
      const assistantMessage: SimpleMessage = {
        role: "assistant",
        content: "",
        timestamp: time,
        uuid: uuid(),
      };

      addMessage(assistantMessage);

      // 逐字显示效果
      let current = "";
      let steps = "";

      for (const w of cleanContent) {
        current += w;
        updateLastMessage(current);
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
        uuid: assistantMessage.uuid,
      };

      await saveMessage(finalAssistantMessage);
      flushSync(() => setDisabled(LoadingStates.generating));
      await tts;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "未知错误");
      console.error("聊天失败:", error);
    }
  };

  const updateMemory = async () => {
    if (messages.length === 0) return;

    try {
      flushSync(() => setDisabled(LoadingStates.updating));

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
      await clearMessages();
      toast.success("记忆更新成功");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新记忆失败");
      console.error("更新记忆失败:", error);
    }
  };

  const clearChat = async () => {
    try {
      flushSync(() => setDisabled(LoadingStates.clearing));
      await clearMessages();
      await setUsedToken(undefined);
      onClearInput?.();
      toast.success("对话已清除");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "清除对话失败");
    }
  };

  return {
    onChat,
    updateMemory,
    clearChat,
    usedToken,
  };
}
