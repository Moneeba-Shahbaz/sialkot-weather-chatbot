type MessageBubbleProps = {
  sender: "user" | "bot";
  text: string;
};

export default function MessageBubble({ sender, text }: MessageBubbleProps) {
  const isUser = sender === "user";

  return (
    <div className={`flex items-end gap-2 mb-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
          isUser ? "bg-blue-500" : "bg-purple-500"
        }`}
      >
        {isUser ? "🧑" : "🤖"}
      </div>
      <div
        className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm leading-relaxed shadow-md whitespace-pre-line ${
          isUser
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-slate-700 text-slate-100 rounded-bl-sm"
        }`}
      >
        {text}
      </div>
    </div>
  );
}