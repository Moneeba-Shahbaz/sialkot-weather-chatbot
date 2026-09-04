type ChatInputProps = {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
};

export default function ChatInput({ input, setInput, onSend }: ChatInputProps) {
  return (
    <div className="flex gap-2 p-3 border-t border-slate-700 bg-slate-800/50">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
        className="flex-1 bg-slate-700 text-white placeholder-slate-400 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
        placeholder="Type a message..."
      />
      <button
        onClick={onSend}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-full text-sm font-medium transition"
      >
        Send
      </button>
    </div>
  );
}