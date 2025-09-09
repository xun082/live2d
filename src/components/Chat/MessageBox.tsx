import {
  CopyOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  SoundOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Bubble } from "@ant-design/x";
import { Button, Typography } from "antd";
// @ts-expect-error markdown-it is not type-safe
import markdownit from "markdown-it";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChatApi } from "../../lib/hooks/useChatApi.ts";
import { useSpeakApi } from "../../lib/hooks/useSpeakApi.ts";
import { useStates } from "../../lib/hooks/useStates.ts";
import { getDate } from "../../lib/utils.ts";

const md = markdownit({ html: true, breaks: true });

// 简化的消息框组件，用于显示基本的聊天消息
export function MessageBox() {
  const messageApi = useStates((state) => state.messageApi);

  return (
    <div className="w-full h-full flex justify-center items-center text-gray-400">
      <span>消息显示功能已简化，请使用新的聊天界面</span>
    </div>
  );
}

// 保持原有的导出接口兼容性
export function MessageBoxItem({
  message,
  isLast,
}: {
  message: any;
  isLast: boolean;
}) {
  const messageApi = useStates((state) => state.messageApi);
  const audiosCache = useSpeakApi((state) => state.audiosCache);

  const userName = "用户";
  const selfName = "小助手";

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audio = useMemo(() => {
    return audiosCache.find((a) => a.timestamp === message.timestamp)?.audio;
  }, [audiosCache, message.timestamp]);

  const playAudio = () => {
    if (!audio) {
      messageApi?.warning("音频文件不存在");
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
    const audioElement = new Audio(
      URL.createObjectURL(new Blob([audio], { type: "audio/wav" }))
    );
    audioElement.onended = () => setIsPlaying(false);
    audioElement.onerror = () => {
      setIsPlaying(false);
      messageApi?.error("音频播放失败");
    };
    audioElement.play().catch(() => {
      setIsPlaying(false);
      messageApi?.error("音频播放失败");
    });
    audioRef.current = audioElement;
    setIsPlaying(true);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(message.content)
      .then(() => messageApi?.success("已复制到剪贴板"))
      .catch(() => messageApi?.error("复制失败"));
  };

  return (
    <Bubble
      placement={message.role === "user" ? "end" : "start"}
      avatar={{
        icon: message.role === "user" ? <UserOutlined /> : undefined,
        src: message.role === "assistant" ? "/favicon.ico" : undefined,
      }}
      variant={message.role === "user" ? "filled" : "outlined"}
      header={
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            {message.role === "user" ? userName : selfName}
          </span>
          <span className="text-xs text-gray-500">
            {getDate(message.timestamp)}
          </span>
        </div>
      }
      content={
        <div className="space-y-2">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: md.render(message.content),
            }}
          />
        </div>
      }
      footer={
        <div className="flex justify-start items-center gap-2 mt-2">
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={copyToClipboard}
          />
          {audio && (
            <Button
              type="text"
              size="small"
              icon={isPlaying ? <LoadingOutlined /> : <SoundOutlined />}
              onClick={playAudio}
              disabled={isPlaying}
            />
          )}
        </div>
      }
    />
  );
}
