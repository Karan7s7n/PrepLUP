"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../services/supabase";
import { useTheme } from "../components/ui/ThemeContext";

const uuidv4 = () => crypto.randomUUID();

export default function AssistantPage() {
  const { theme } = useTheme();

  //////////////////////////////////////////////////////
  // STATE
  //////////////////////////////////////////////////////
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔊 TTS
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  // 🎤 STT
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const glass =
    theme === "light"
      ? "bg-white/70 border-black/10 text-black"
      : "bg-[#0f0f0f] border-white/10 text-white";

  //////////////////////////////////////////////////////
  // 🔊 LOAD VOICES
  //////////////////////////////////////////////////////
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) setVoices(v);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  //////////////////////////////////////////////////////
  // 🎤 INIT SPEECH RECOGNITION
  //////////////////////////////////////////////////////
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
  }, []);

  //////////////////////////////////////////////////////
  // LOAD CHAT
  //////////////////////////////////////////////////////
  useEffect(() => {
    const saved = localStorage.getItem("ai_chats");

    if (saved) {
      const parsed = JSON.parse(saved);
      setChats(parsed);
      setActiveChat(parsed[0]);
    } else {
      createNewChat();
    }
  }, []);

  //////////////////////////////////////////////////////
  // SAVE CHAT
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("ai_chats", JSON.stringify(chats));
    }
  }, [chats]);

  //////////////////////////////////////////////////////
  // AUTO SCROLL
  //////////////////////////////////////////////////////
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat]);

  //////////////////////////////////////////////////////
  // CREATE CHAT
  //////////////////////////////////////////////////////
  const createNewChat = () => {
    const newChat = {
      id: uuidv4(),
      title: "New Chat",
      messages: [
        {
          role: "bot",
          text: "Hi 👋 I'm your placement assistant. Ask me anything!",
        },
      ],
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat);
  };

  //////////////////////////////////////////////////////
  // 🔊 CLEAN TEXT
  //////////////////////////////////////////////////////
  const cleanText = (text: string) => {
    return text
      .replace(/\*\*/g, "")
      .replace(/\n/g, ". ")
      .replace(/-/g, " ");
  };

  //////////////////////////////////////////////////////
  // 🔊 SPEAK
  //////////////////////////////////////////////////////
  const speak = (text: string, index: number) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText(text));

    const preferred =
      voices.find((v) => v.name.includes("Google")) ||
      voices.find((v) => v.lang === "en-US") ||
      voices[0];

    if (preferred) utterance.voice = preferred;

    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeakingIndex(null);
  };

  //////////////////////////////////////////////////////
  // 🎤 MIC CONTROL
  //////////////////////////////////////////////////////
  const startListening = () => {
    recognitionRef.current?.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  //////////////////////////////////////////////////////
  // FETCH USER STATS
  //////////////////////////////////////////////////////
  const getUserStats = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: tests } = await supabase
      .from("tests")
      .select("*")
      .eq("user_id", user.id);

    const { data: answers } = await supabase
      .from("test_results")
      .select("is_correct")
      .eq("user_id", user.id);

    const totalTests = tests?.length || 0;

    const avgPoints =
      totalTests > 0
        ? Math.round(
            tests!.reduce((sum, t) => sum + t.score, 0) / totalTests
          )
        : 0;

    const totalAnswers = answers?.length || 0;
    const correctAnswers =
      answers?.filter((a) => a.is_correct).length || 0;

    const accuracy =
      totalAnswers > 0
        ? Math.round((correctAnswers / totalAnswers) * 100)
        : 0;

    return {
      tests: totalTests,
      avgPoints,
      accuracy: `${accuracy}%`,
    };
  };

  //////////////////////////////////////////////////////
  // SEND MESSAGE
  //////////////////////////////////////////////////////
  const sendMessage = async (customMessage?: string) => {
    const userMessage = customMessage || input;
    if (!userMessage.trim() || loading || !activeChat) return;

    const updatedMessages = [
      ...activeChat.messages,
      { role: "user", text: userMessage },
    ];

    updateChat(activeChat.id, { messages: updatedMessages });

    setInput("");
    setLoading(true);

    updateChat(activeChat.id, {
      messages: [...updatedMessages, { role: "bot", text: "Typing..." }],
    });

    try {
      const stats = await getUserStats();

      const { data } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: userMessage,
          context: { ...stats },
        },
      });

      const reply = data?.reply || "No response";

      updateChat(activeChat.id, {
        messages: [...updatedMessages, { role: "bot", text: reply }],
        title:
          activeChat.title === "New Chat"
            ? userMessage.slice(0, 20)
            : activeChat.title,
      });
    } catch {
      updateChat(activeChat.id, {
        messages: [...updatedMessages, { role: "bot", text: "Error ⚠️" }],
      });
    }

    setLoading(false);
  };

  //////////////////////////////////////////////////////
  // ANALYZE PERFORMANCE
  //////////////////////////////////////////////////////
  const analyzePerformance = async () => {
    const stats = await getUserStats();
    if (!stats) return;

    sendMessage(`
Analyze my performance:
Tests: ${stats.tests}
Accuracy: ${stats.accuracy}
Avg Points: ${stats.avgPoints}
Give strengths, weaknesses, and improvement plan.
`);
  };

  //////////////////////////////////////////////////////
  // UPDATE CHAT
  //////////////////////////////////////////////////////
  const updateChat = (id: string, data: any) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );

    setActiveChat((prev: any) =>
      prev?.id === id ? { ...prev, ...data } : prev
    );
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <div className="h-screen flex">

      {/* SIDEBAR */}
      <div className="w-64 border-r border-white/10 p-3 space-y-3">
        <button
          onClick={createNewChat}
          className="w-full py-2 bg-purple-600 text-white rounded-lg"
        >
          + New Chat
        </button>

        <button
          onClick={analyzePerformance}
          className="w-full py-2 bg-green-600 text-white rounded-lg"
        >
          📊 Analyze
        </button>

        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setActiveChat(chat)}
            className={`p-2 rounded-lg cursor-pointer text-sm ${
              activeChat?.id === chat.id
                ? "bg-white/20"
                : "hover:bg-white/10"
            }`}
          >
            {chat.title}
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div className={`flex-1 flex flex-col ${glass}`}>

        {/* CHAT */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeChat?.messages.map((m: any, i: number) => (
            <div
              key={i}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex items-end gap-2 max-w-[70%]">

                <div
                  className={`px-4 py-2 rounded-2xl text-sm ${
                    m.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white/10"
                  }`}
                >
                  {m.text}
                </div>

                {m.role === "bot" && (
                  <button
                    onClick={() =>
                      speakingIndex === i
                        ? stopSpeaking()
                        : speak(m.text, i)
                    }
                    className="text-xs px-2 py-1 bg-white/10 rounded-md"
                  >
                    {speakingIndex === i ? "⏹" : "🔊"}
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="p-4 flex gap-2 border-t border-white/10">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 p-2 rounded-lg bg-white/10 outline-none"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          {/* 🎤 MIC */}
          <button
            onClick={listening ? stopListening : startListening}
            className={`px-3 rounded-lg ${
              listening ? "bg-red-600" : "bg-white/10"
            }`}
          >
            {listening ? "🎙️" : "🎤"}
          </button>

          <button
            onClick={() => sendMessage()}
            className="px-4 bg-purple-600 text-white rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}