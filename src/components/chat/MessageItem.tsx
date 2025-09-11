interface MessageItemProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  index: number;
}

export function MessageItem({
  role,
  content,
  timestamp,
  index,
}: MessageItemProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } animate-in slide-in-from-bottom-4 duration-300`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className={`max-w-[75%] p-4 rounded-2xl shadow-lg backdrop-blur-sm border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative overflow-hidden ${
          isUser
            ? "bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white border-blue-400/30 shadow-blue-500/30 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:via-transparent before:to-transparent before:pointer-events-none"
            : "bg-gradient-to-br from-white via-gray-50 to-blue-50/50 dark:from-gray-700 dark:via-gray-800 dark:to-blue-900/20 text-gray-800 dark:text-gray-100 border-gray-200/50 dark:border-gray-600/50 shadow-gray-500/15 before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/5 before:via-transparent before:to-purple-500/5 before:pointer-events-none"
        }`}
      >
        <div className="whitespace-pre-wrap leading-relaxed text-sm relative z-10">
          {content}
        </div>
        <div
          className={`text-xs mt-3 flex items-center gap-1 relative z-10 ${
            isUser ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <div className="w-1 h-1 rounded-full bg-current opacity-60 animate-pulse"></div>
          {new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
