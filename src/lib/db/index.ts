import Dexie, { type EntityTable } from "dexie";

// 定义数据库表结构
export interface ChatMessage {
  id?: number;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  uuid: string;
  sessionId?: number;
}

export interface ChatSession {
  id?: number;
  name: string;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}

export interface Memory {
  id?: number;
  content: string;
  summary: string;
  timestamp: number;
  importance: number;
  tags: string[];
}

export interface AudioCache {
  id?: number;
  timestamp: number;
  audio: ArrayBuffer;
}

// 数据库类
export class DigitalLifeDB extends Dexie {
  chatMessages!: EntityTable<ChatMessage, "id">;
  chatSessions!: EntityTable<ChatSession, "id">;
  memories!: EntityTable<Memory, "id">;
  audioCache!: EntityTable<AudioCache, "id">;

  constructor() {
    super("DigitalLifeDB");

    this.version(1).stores({
      chatMessages: "++id, role, timestamp, uuid, sessionId",
      chatSessions: "++id, name, createdAt, updatedAt, isActive",
      memories: "++id, timestamp, importance, tags",
      audioCache: "++id, timestamp",
    });
  }

  // 获取当前活跃会话
  async getActiveSession(): Promise<ChatSession | undefined> {
    return await this.chatSessions.where("isActive").equals(1).first();
  }

  // 创建新会话
  async createSession(name: string): Promise<number> {
    // 先将所有会话设为非活跃
    await this.chatSessions.toCollection().modify({ isActive: false });

    // 创建新的活跃会话
    const now = Date.now();
    const id = await this.chatSessions.add({
      name,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    });
    return id as number;
  }

  // 切换活跃会话
  async switchSession(sessionId: number): Promise<void> {
    await this.transaction("rw", this.chatSessions, async () => {
      await this.chatSessions.toCollection().modify({ isActive: false });
      await this.chatSessions.update(sessionId, {
        isActive: true,
        updatedAt: Date.now(),
      });
    });
  }

  // 获取会话的聊天记录
  async getSessionMessages(sessionId: number): Promise<ChatMessage[]> {
    return await this.chatMessages
      .where("sessionId")
      .equals(sessionId)
      .toArray();
  }

  // 添加聊天消息
  async addMessage(message: Omit<ChatMessage, "id">): Promise<number> {
    const id = await this.chatMessages.add(message);
    return id as number;
  }

  // 批量添加消息
  async addMessages(messages: Omit<ChatMessage, "id">[]): Promise<void> {
    await this.chatMessages.bulkAdd(messages);
  }

  // 清除会话消息
  async clearSessionMessages(sessionId: number): Promise<void> {
    await this.chatMessages.where("sessionId").equals(sessionId).delete();
  }

  // 添加记忆
  async addMemory(memory: Omit<Memory, "id">): Promise<number> {
    const id = await this.memories.add(memory);
    return id as number;
  }

  // 搜索记忆（简单的文本搜索，替代向量搜索）
  async searchMemories(query: string, limit = 10): Promise<Memory[]> {
    const keywords = query
      .toLowerCase()
      .split(" ")
      .filter((k) => k.length > 1);

    return await this.memories
      .orderBy("importance")
      .reverse()
      .filter((memory) => {
        const content = memory.content.toLowerCase();
        const summary = memory.summary.toLowerCase();
        return keywords.some(
          (keyword) =>
            content.includes(keyword) ||
            summary.includes(keyword) ||
            memory.tags.some((tag) => tag.toLowerCase().includes(keyword))
        );
      })
      .limit(limit)
      .toArray();
  }

  // 获取最近的记忆
  async getRecentMemories(limit = 20): Promise<Memory[]> {
    return await this.memories
      .orderBy("timestamp")
      .reverse()
      .limit(limit)
      .toArray();
  }

  // 添加音频缓存
  async addAudioCache(cache: Omit<AudioCache, "id">): Promise<number> {
    const id = await this.audioCache.add(cache);
    return id as number;
  }

  // 获取音频缓存
  async getAudioCache(timestamp: number): Promise<AudioCache | undefined> {
    return await this.audioCache.where("timestamp").equals(timestamp).first();
  }

  // 清理旧数据
  async cleanupOldData(daysToKeep = 30): Promise<void> {
    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;

    await this.transaction("rw", [this.audioCache], async () => {
      await this.audioCache.where("timestamp").below(cutoffTime).delete();
    });
  }

  // 清空所有数据
  async clearAllData(): Promise<void> {
    await this.chatMessages.clear();
    await this.chatSessions.clear();
    await this.memories.clear();
    await this.audioCache.clear();
  }

  // 获取所有记忆
  async getAllMemories(): Promise<Memory[]> {
    return await this.memories.toArray();
  }

  // 获取所有会话
  async getAllSessions(): Promise<ChatSession[]> {
    return await this.chatSessions.toArray();
  }

  // 获取所有消息
  async getAllMessages(): Promise<ChatMessage[]> {
    return await this.chatMessages.toArray();
  }
}

// 创建数据库实例
export const db = new DigitalLifeDB();
