import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type ChatMessage, type Memory, db } from "../lib/db/index.ts";
import { uuid } from "../lib/utils.ts";

interface MemoryState {
  // 基本状态
  selfName: string;
  shortTermMemory: ShortTermMemory[];
  currentSessionId: number | null;

  // 设置方法
  setSelfName: (name: string) => void;
  setShortTermMemory: (memory: ShortTermMemory[]) => Promise<void>;

  // 聊天相关方法
  chatWithMemory: (
    chat: ChatApi,
    modelName: string,
    messages: ShortTermMemory[],
    vectorFn?: (input: string) => Promise<number[] | undefined>,
    plugins?: Record<string, any>
  ) => Promise<{
    result: string;
    tokens: number;
    output: ShortTermMemory[];
    think?: string;
  }>;

  // 记忆管理方法
  updateMemory: (
    chat: ChatApi,
    modelName: string,
    vectorFn?: (input: string) => Promise<number[] | undefined>
  ) => Promise<void>;

  // 会话管理
  initializeSession: () => Promise<void>;
  createNewSession: (name?: string) => Promise<void>;
  loadSession: (sessionId: number) => Promise<void>;
}

export const useMemoryDB = create<MemoryState>()(
  persist(
    (set, get) => ({
      // 初始状态
      selfName: "小助手",
      shortTermMemory: [],
      currentSessionId: null,

      // 设置方法
      setSelfName: (name: string) => {
        set({ selfName: name });
      },

      setShortTermMemory: async (memory: ShortTermMemory[]) => {
        set({ shortTermMemory: memory });

        // 保存到IndexedDB
        const { currentSessionId } = get();
        if (currentSessionId && memory.length > 0) {
          const messages: Omit<ChatMessage, "id">[] = memory.map((msg) => ({
            role: msg.role as "user" | "assistant" | "system",
            content: msg.content,
            timestamp: msg.timestamp,
            uuid: msg.uuid,
            sessionId: currentSessionId,
          }));

          // 清除当前会话的旧消息，然后添加新消息
          await db.clearSessionMessages(currentSessionId);
          await db.addMessages(messages);
        }
      },

      // 简化的聊天方法，移除向量化功能
      chatWithMemory: async (
        chat: ChatApi,
        modelName: string,
        messages: ShortTermMemory[],
        vectorFn?: (input: string) => Promise<number[] | undefined>,
        plugins?: Record<string, any>
      ) => {
        // 获取相关记忆（使用简单的文本搜索替代向量搜索）
        const userMessage = messages[messages.length - 1]?.content || "";
        const relevantMemories = await db.searchMemories(userMessage, 5);

        // 构建系统提示
        let systemPrompt = `你是${get().selfName}，一个友善的AI助手。`;

        if (relevantMemories.length > 0) {
          systemPrompt +=
            "\n\n相关记忆：\n" +
            relevantMemories.map((m) => `- ${m.summary}`).join("\n");
        }

        // 构建消息数组
        const chatMessages = [
          { role: "system" as const, content: systemPrompt },
          ...messages.map((msg) => ({
            role: msg.role as "user" | "assistant" | "system",
            content: msg.content,
          })),
        ];

        // 调用聊天API
        const response = await chat.chat.completions.create({
          model: modelName,
          messages: chatMessages,
        });

        const content = response.choices[0]?.message?.content || "";

        return {
          result: content,
          tokens: response.usage?.total_tokens || 0,
          output: messages,
          think: undefined, // 简化版本不包含思考过程
        };
      },

      // 简化的记忆更新方法
      updateMemory: async (
        chat: ChatApi,
        modelName: string,
        vectorFn?: (input: string) => Promise<number[] | undefined>
      ) => {
        const { shortTermMemory, selfName } = get();

        if (shortTermMemory.length === 0) return;

        // 生成对话摘要
        const conversation = shortTermMemory
          .map((msg) => `${msg.role}: ${msg.content}`)
          .join("\n");

        const summaryPrompt = `请为以下对话生成一个简洁的摘要，突出重要信息：\n\n${conversation}`;

        try {
          const summaryResponse = await chat.chat.completions.create({
            model: modelName,
            messages: [
              {
                role: "system",
                content: `你是${selfName}的记忆助手，负责整理和总结对话内容。`,
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
            importance: Math.min(shortTermMemory.length, 10), // 简单的重要性评分
            tags: [], // 可以后续扩展标签功能
          });

          // 清空短期记忆
          await get().setShortTermMemory([]);
        } catch (error) {
          console.error("更新记忆失败:", error);
          throw error;
        }
      },

      // 初始化会话
      initializeSession: async () => {
        let session = await db.getActiveSession();

        if (!session) {
          // 创建默认会话
          const sessionId = await db.createSession("默认对话");
          session = await db.getActiveSession();
        }

        if (session) {
          set({ currentSessionId: session.id! });

          // 加载会话消息
          const messages = await db.getSessionMessages(session.id!);
          const shortTermMemory: ShortTermMemory[] = messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            uuid: msg.uuid,
          }));

          set({ shortTermMemory });
        }
      },

      // 创建新会话
      createNewSession: async (name?: string) => {
        const sessionName = name || `对话 ${new Date().toLocaleString()}`;
        const sessionId = await db.createSession(sessionName);

        set({
          currentSessionId: sessionId,
          shortTermMemory: [],
        });
      },

      // 加载指定会话
      loadSession: async (sessionId: number) => {
        await db.switchSession(sessionId);
        const messages = await db.getSessionMessages(sessionId);

        const shortTermMemory: ShortTermMemory[] = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          uuid: msg.uuid,
        }));

        set({
          currentSessionId: sessionId,
          shortTermMemory,
        });
      },
    }),
    {
      name: "memory-storage",
      partialize: (state) => ({
        selfName: state.selfName,
        currentSessionId: state.currentSessionId,
      }),
    }
  )
);
