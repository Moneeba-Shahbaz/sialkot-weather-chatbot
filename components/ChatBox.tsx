"use client";
import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

type Message = {
  sender: "user" | "bot";
  text: string;
};

type DayForecast = {
  date: string;
  maxTemp: number;
  minTemp: number;
  code: number;
  description: string;
};

type WeatherData = {
  city: string;
  current: { temp: number; windSpeed: number };
  days: DayForecast[];
};

const weekdayMap: Record<string, number> = {
  sunday: 0, itwar: 0,
  monday: 1, peer: 1, pir: 1,
  tuesday: 2, mangal: 2,
  wednesday: 3, budh: 3,
  thursday: 4, jumeraat: 4,
  friday: 5, jumma: 5, jumaa: 5,
  saturday: 6, hafta: 6,
};

const monthMap: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, sep: 8, october: 9, oct: 9,
  november: 10, december: 11,
};

function findDayByOffset(days: DayForecast[], offset: number): DayForecast | null {
  return days[offset] || null;
}

function findDayByWeekday(days: DayForecast[], weekdayIndex: number): DayForecast | null {
  for (const d of days) {
    if (new Date(d.date).getDay() === weekdayIndex) return d;
  }
  return null;
}

function findDayByExplicitDate(days: DayForecast[], day: number, month: number): DayForecast | null {
  for (const d of days) {
    const jsDate = new Date(d.date);
    if (jsDate.getDate() === day && jsDate.getMonth() === month) return d;
  }
  return null;
}

function resolveRequestedDay(
  text: string,
  days: DayForecast[]
): { day: DayForecast | null; label: string; outOfRange: boolean } {
  const lower = text.toLowerCase();

  if (lower.includes("aaj") || lower.includes("today")) {
    return { day: findDayByOffset(days, 0), label: "aaj", outOfRange: false };
  }
  if (lower.includes("yesterday") || lower.includes("guzashta")) {
    return { day: null, label: "guzra hua din", outOfRange: true };
  }
  if (lower.includes("parso")) {
    return { day: findDayByOffset(days, 2), label: "parso", outOfRange: false };
  }
  if (lower.includes("kal")) {
    return { day: findDayByOffset(days, 1), label: "kal", outOfRange: false };
  }

  for (const key of Object.keys(weekdayMap)) {
    if (lower.includes(key)) {
      const found = findDayByWeekday(days, weekdayMap[key]);
      return { day: found, label: key, outOfRange: !found };
    }
  }

  const dateMatch = lower.match(
    /(\d{1,2})\s*(january|february|march|april|may|june|july|august|september|sep|october|oct|november|december)/
  );
  if (dateMatch) {
    const dayNum = parseInt(dateMatch[1]);
    const month = monthMap[dateMatch[2]];
    const found = findDayByExplicitDate(days, dayNum, month);
    return { day: found, label: `${dateMatch[1]} ${dateMatch[2]}`, outOfRange: !found };
  }

  return { day: null, label: "", outOfRange: false };
}

function formatDayReply(day: DayForecast, label: string): string {
  const niceDate = new Date(day.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });
  return `Sialkot mein ${label} (${niceDate}) ka mausam ${day.description} rahega. Temperature ${day.minTemp}°C se ${day.maxTemp}°C ke darmiyan rahega.`;
}

function isWeatherQuery(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("weather") ||
    lower.includes("mausam") ||
    lower.includes("temperature") ||
    lower.includes("garmi") ||
    lower.includes("sardi") ||
    lower.includes("baarish")
  );
}

function isForecastQuery(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes("forecast") || lower.includes("mahine") || lower.includes("month") || lower.includes("15 din") || lower.includes("16 din");
}

function getBotReply(userText: string): string {
  const text = userText.toLowerCase().trim();

  if (/(^|\s)(hi|hello|hey|hlo)(\s|$)/.test(text)) {
    return "Hello! Main Sialkot ka mausam bata sakta hoon. Pooch sakte hain: 'aaj ka weather kaisa hai', 'kal ka mausam', ya 'Monday ka weather'.";
  }
  if (text.includes("how are you") || text.includes("kaise ho")) {
    return "Main theek hoon! Sialkot ka mausam poochiye 🙂";
  }
  if (text.includes("thank") || text.includes("shukriya")) {
    return "You're welcome! 🙂";
  }
  if (text.includes("bye")) {
    return "Allah Hafiz! 👋";
  }
  return `Aap mujhse Sialkot ka mausam pooch sakte hain — jaise "aaj ka weather kaisa hai", "kal ka mausam", "Friday ka weather", ya "15 September ka mausam". (Aapne kaha: "${userText}")`;
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hi! Main Sialkot ka mausam bata sakta hoon — agle 16 din tak ka. Poochiye jaise 'aaj ka weather kaisa hai' ya 'kal ka mausam'.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/weather")
      .then((res) => res.json())
      .then((data) => setWeatherData(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    let data = weatherData;

    if (isWeatherQuery(currentInput) && !data) {
      try {
        const res = await fetch("/api/weather");
        data = await res.json();
        setWeatherData(data);
      } catch {
        data = null;
      }
    }

    setTimeout(() => {
      let reply = "";

      if (isWeatherQuery(currentInput)) {
        if (!data) {
          reply = "Mausam ka data abhi fetch nahi ho saka, dobara try karein.";
        } else {
          const { day, label, outOfRange } = resolveRequestedDay(currentInput, data.days);

          if (outOfRange && label) {
            reply = `Maazrat, "${label}" ka data available nahi hai — main sirf agle 16 din ka forecast bata sakta hoon.`;
          } else if (day) {
            reply = formatDayReply(day, label || "us din");
          } else if (isForecastQuery(currentInput)) {
            const lines = data.days
              .map(
                (d) =>
                  `📅 ${d.date}: ${d.description}, 🔺${d.maxTemp}°C 🔻${d.minTemp}°C`
              )
              .join("\n");
            reply = `Sialkot ka agle 16 din ka forecast:\n\n${lines}`;
          } else {
            reply = `Sialkot ka abhi ka mausam: 🌡️ ${data.current.temp}°C, 💨 hawa ki raftar ${data.current.windSpeed} km/h.`;
          }
        }
      } else {
        reply = getBotReply(currentInput);
      }

      setIsTyping(false);
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    }, 600);
  };

  return (
    <div className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
      <div className="h-96 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} sender={msg.sender} text={msg.text} />
        ))}

        {isTyping && (
          <div className="flex items-end gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-sm shrink-0">
              🤖
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-slate-700 flex gap-1">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
      <ChatInput input={input} setInput={setInput} onSend={sendMessage} />
    </div>
  );
}