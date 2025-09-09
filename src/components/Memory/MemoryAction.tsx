import {
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Popconfirm, Space, Upload } from "antd";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useStates } from "../../lib/hooks/useStates.ts";
import { db } from "../../lib/db/index.ts";

export function MemoryAction() {
  const disabled = useStates((state) => state.disabled);
  const setDisabled = useStates((state) => state.setDisabled);
  const messageApi = useStates((state) => state.messageApi);

  const [exportForm] = Form.useForm();
  const [importForm] = Form.useForm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 重置所有记忆
  const resetAllMemory = async () => {
    try {
      flushSync(() => setDisabled(true));

      // 清空IndexedDB中的所有数据
      await db.clearAllData();

      messageApi?.success("所有记忆已重置");
    } catch (error) {
      messageApi?.error(
        error instanceof Error ? error.message : "重置记忆失败"
      );
    } finally {
      setDisabled(false);
    }
  };

  // 导出记忆
  const exportAllMemory = async () => {
    try {
      flushSync(() => setDisabled(true));

      const memories = await db.getAllMemories();
      const sessions = await db.getAllSessions();
      const messages = await db.getAllMessages();

      const exportData = {
        memories,
        sessions,
        messages,
        exportTime: new Date().toISOString(),
        version: "2.0.0",
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `digital-life-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      messageApi?.success("记忆导出成功");
    } catch (error) {
      messageApi?.error(
        error instanceof Error ? error.message : "导出记忆失败"
      );
    } finally {
      setDisabled(false);
    }
  };

  // 导入记忆
  const importAllMemory = async (file: File) => {
    try {
      flushSync(() => setDisabled(true));

      const text = await file.text();
      const data = JSON.parse(text);

      // 验证数据格式
      if (!data.memories || !Array.isArray(data.memories)) {
        throw new Error("无效的备份文件格式");
      }

      // 清空现有数据
      await db.clearAllData();

      // 导入记忆
      if (data.memories.length > 0) {
        for (const memory of data.memories) {
          await db.addMemory(memory);
        }
      }

      // 导入会话
      if (data.sessions && Array.isArray(data.sessions)) {
        for (const session of data.sessions) {
          await db.createSession(session.name);
        }
      }

      // 导入消息
      if (data.messages && Array.isArray(data.messages)) {
        for (const message of data.messages) {
          await db.addMessage(message);
        }
      }

      messageApi?.success(`成功导入 ${data.memories.length} 条记忆`);
    } catch (error) {
      messageApi?.error(
        error instanceof Error ? error.message : "导入记忆失败"
      );
    } finally {
      setDisabled(false);
    }
  };

  return (
    <div className="w-full max-h-full overflow-auto p-4 bg-white rounded-md border border-blue-900">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">记忆管理</h3>
          <Space direction="vertical" size="middle" className="w-full">
            {/* 重置记忆 */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">重置所有记忆</h4>
              <p className="text-sm text-gray-600 mb-3">
                此操作将清空所有聊天记录、记忆和缓存数据，且无法恢复。
              </p>
              <Popconfirm
                title="确定要重置所有记忆吗？"
                description="此操作不可逆，建议先导出备份。"
                onConfirm={resetAllMemory}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  disabled={disabled !== false}
                >
                  重置所有记忆
                </Button>
              </Popconfirm>
            </div>

            {/* 导出记忆 */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">导出记忆备份</h4>
              <p className="text-sm text-gray-600 mb-3">
                将所有记忆数据导出为JSON文件，可用于备份或迁移。
              </p>
              <Button
                type="primary"
                icon={<ExportOutlined />}
                onClick={exportAllMemory}
                disabled={disabled !== false}
              >
                导出记忆
              </Button>
            </div>

            {/* 导入记忆 */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">导入记忆备份</h4>
              <p className="text-sm text-gray-600 mb-3">
                从JSON备份文件恢复记忆数据。注意：这将覆盖现有的所有数据。
              </p>
              <Upload
                accept=".json"
                showUploadList={false}
                beforeUpload={(file) => {
                  importAllMemory(file);
                  return false; // 阻止自动上传
                }}
                disabled={disabled !== false}
              >
                <Button icon={<ImportOutlined />} disabled={disabled !== false}>
                  选择备份文件
                </Button>
              </Upload>
            </div>
          </Space>
        </div>
      </div>
    </div>
  );
}
