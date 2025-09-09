import { Button, Form, Input, Space } from "antd";
import { useState } from "react";
import { useStates } from "../../hooks/useStates.ts";

export function MemoryMain() {
  const messageApi = useStates((state) => state.messageApi);
  const [userName, setUserName] = useState("用户");
  const [selfName, setSelfName] = useState("小助手");
  const [memoryAboutSelf, setMemoryAboutSelf] = useState("");
  const [memoryAboutUser, setMemoryAboutUser] = useState("");

  const handleSave = () => {
    // 在简化版本中，这些设置只是本地状态
    messageApi?.success("设置已保存（本地会话有效）");
  };

  return (
    <div className="w-full bg-white border border-blue-900 rounded-md px-5 pb-0 pt-4 overflow-auto max-h-full">
      <Form layout="vertical" onFinish={handleSave}>
        <Form.Item label="用户名称">
          <Input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="请输入用户名称"
          />
        </Form.Item>

        <Form.Item label="助手名称">
          <Input
            value={selfName}
            onChange={(e) => setSelfName(e.target.value)}
            placeholder="请输入助手名称"
          />
        </Form.Item>

        <Form.Item label="关于助手的记忆">
          <Input.TextArea
            value={memoryAboutSelf}
            onChange={(e) => setMemoryAboutSelf(e.target.value)}
            placeholder="描述助手的特点、性格等..."
            rows={4}
          />
        </Form.Item>

        <Form.Item label="关于用户的记忆">
          <Input.TextArea
            value={memoryAboutUser}
            onChange={(e) => setMemoryAboutUser(e.target.value)}
            placeholder="记录用户的偏好、特点等..."
            rows={4}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              保存设置
            </Button>
            <Button
              onClick={() => {
                setUserName("用户");
                setSelfName("小助手");
                setMemoryAboutSelf("");
                setMemoryAboutUser("");
                messageApi?.success("已重置为默认值");
              }}
            >
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">说明</h4>
        <p className="text-sm text-gray-600">
          在简化版本中，这些设置仅在当前会话中有效。
          如需持久化存储，可以通过记忆管理功能导出和导入数据。
        </p>
      </div>
    </div>
  );
}
