import ChatBox from "@/components/ChatBox";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <h1 className="text-center text-3xl font-bold text-white mb-1">
          🌦️ Sialkot Weather Bot
        </h1>
        <p className="text-center text-slate-400 text-sm mb-6">
          Ask me about Sialkot's weather
        </p>
        <ChatBox />
      </div>
    </main>
  );
}