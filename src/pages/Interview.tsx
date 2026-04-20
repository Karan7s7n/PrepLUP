"use client";

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuthStore } from "../store/authStore";
import { FiMic } from "react-icons/fi";
import { motion } from "framer-motion";

interface Question {
  id: string;
  question: string;
  example_answer?: string;
  role?: string;
}

interface Feedback {
  score: number;
  strengths: string;
  improvements: string;
}

export default function Interview() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const roles = [
    "frontend","backend","React Engineer","DevOps Engineer",
    "AI & ML","SAP Engineer","Numerical Ability",
    "Logical Reasoning","Verbal Ability","general","mixed"
  ];

  const [selectedRole, setSelectedRole] = useState("frontend");
  const [started, setStarted] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const [timeLeft, setTimeLeft] = useState(300);
  const timerRef = useRef<any>(null);
  const hasFinishedRef = useRef(false);

  //////////////////////////////////////////////////////
  // 🚨 TAB SWITCH TERMINATE
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (!started) return;

    const handler = async () => {
      if (document.hidden) {
        alert("🚫 Tab switch detected. Interview terminated.");
        await handleFinish();
      }
    };

    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [started]);

  //////////////////////////////////////////////////////
  // 🔒 LOCK
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (!started) return;

    const blockClipboard = (e: any) => e.preventDefault();

    const blockKeys = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (e.ctrlKey && ["c","v","x"].includes(key)) e.preventDefault();
      if (e.key === "F12") e.preventDefault();
      if (e.ctrlKey && e.shiftKey && ["i","j","c"].includes(key)) {
        e.preventDefault();
      }
    };

    const enterFullscreen = () => {
      document.documentElement.requestFullscreen?.().catch(() => {});
    };

    const exitFs = async () => {
      if (!document.fullscreenElement) {
        alert("🚫 Fullscreen exited. Interview terminated.");
        await handleFinish();
      }
    };

    enterFullscreen();

    document.addEventListener("copy", blockClipboard);
    document.addEventListener("paste", blockClipboard);
    document.addEventListener("cut", blockClipboard);
    document.addEventListener("keydown", blockKeys);
    document.addEventListener("fullscreenchange", exitFs);

    return () => {
      document.removeEventListener("copy", blockClipboard);
      document.removeEventListener("paste", blockClipboard);
      document.removeEventListener("cut", blockClipboard);
      document.removeEventListener("keydown", blockKeys);
      document.removeEventListener("fullscreenchange", exitFs);
    };
  }, [started]);

  //////////////////////////////////////////////////////
  // TIMER
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (started && timeLeft <= 0) handleFinish();
  }, [timeLeft]);

  //////////////////////////////////////////////////////
  // START
  //////////////////////////////////////////////////////
  const startInterview = async () => {
    const { data } = await supabase
      .from("interview_questions")
      .select("*")
      .eq("role", selectedRole);

    if (!data) return;

    const selected = [...data].sort(() => 0.5 - Math.random()).slice(0, 5);

    setQuestions(selected);
    setStarted(true);
    setTimeLeft(300);

    timerRef.current = setInterval(() => {
      setTimeLeft((t: number) => t - 1);
    }, 1000);
  };

  //////////////////////////////////////////////////////
  // 🔥 REAL AI EVALUATION
  //////////////////////////////////////////////////////
  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoadingFeedback(true);

    try {
      const { data } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: `
Evaluate this interview answer strictly.

Question: ${questions[currentIndex].question}
Answer: ${input}

Return ONLY in JSON format:
{
  "score": number (0-10),
  "strengths": "short text",
  "improvements": "short text"
}
          `,
        },
      });

      let parsed: Feedback = {
        score: 5,
        strengths: "Could not analyze properly",
        improvements: "Try again",
      };

      try {
        parsed = JSON.parse(data.reply);
      } catch {
        // fallback if AI returns text
        parsed = {
          score: 6,
          strengths: data.reply,
          improvements: "Try structuring your answer better",
        };
      }

      setFeedback(parsed);

      setAnswers((prev) => ({
        ...prev,
        [questions[currentIndex].id]: {
          answer: input,
          feedback: parsed,
        },
      }));

    } catch (err) {
      console.error(err);
      setFeedback({
        score: 0,
        strengths: "Error analyzing answer",
        improvements: "Check AI connection",
      });
    }

    setLoadingFeedback(false);
  };

  //////////////////////////////////////////////////////
  // NEXT
  //////////////////////////////////////////////////////
  const handleNext = () => {
    setInput("");
    setFeedback(null);

    if (currentIndex === questions.length - 1) handleFinish();
    else setCurrentIndex((i) => i + 1);
  };

  //////////////////////////////////////////////////////
  // FINISH
  //////////////////////////////////////////////////////
  const handleFinish = async () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    if (timerRef.current) clearInterval(timerRef.current);
    if (!user?.id) return;

    try {
      const { data: session } = await supabase
        .from("interview_sessions")
        .insert({ user_id: user.id, role: selectedRole })
        .select()
        .single();

      if (session) {
        const responses = Object.entries(answers).map(([qid, val]: any) => ({
          session_id: session.id,
          question_id: qid,
          answer: val.answer,
          feedback: JSON.stringify(val.feedback),
          score: val.feedback.score,
          user_id: user.id,
        }));

        if (responses.length > 0) {
          await supabase.from("interview_responses").insert(responses);
        }
      }
    } catch (err) {
      console.error(err);
    }

    navigate("/dashboard");
  };

  //////////////////////////////////////////////////////
  // VOICE INPUT
  //////////////////////////////////////////////////////
  const startListening = () => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SR) return;

    const r = new SR();
    r.lang = "en-IN"; // 🔥 better for Indian accent
    r.interimResults = false;

    r.onresult = (e: any) =>
      setInput((p) => p + " " + e.results[0][0].transcript);

    r.start();
  };

  //////////////////////////////////////////////////////
  // SCORE
  //////////////////////////////////////////////////////
  const totalScore = Object.values(answers).reduce(
    (s: number, a: any) => s + (a.feedback?.score || 0),
    0
  );

  const avgScore =
    Object.keys(answers).length > 0
      ? Math.round(totalScore / Object.keys(answers).length)
      : 0;

  //////////////////////////////////////////////////////
  // START SCREEN
  //////////////////////////////////////////////////////
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 text-white">

        <h1 className="text-5xl font-bold">AI Interview</h1>

        <div className="flex flex-wrap gap-2 justify-center">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-4 py-2 rounded-full border ${
                selectedRole === r
                  ? "bg-blue-600 border-blue-600"
                  : "border-gray-500"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <button
          onClick={startInterview}
          className="px-8 py-3 bg-blue-600 rounded-xl flex items-center gap-2"
        >
          <FiMic /> Start Interview
        </button>
      </div>
    );
  }

  const q = questions[currentIndex];

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <div className="min-h-screen text-white flex justify-center p-6">

      <div className="w-full max-w-3xl space-y-6">

        <div className="h-2 bg-gray-700 rounded">
          <div
            className="h-2 bg-blue-500 rounded"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        <div className="flex justify-between text-sm text-blue-400">
          <span>{selectedRole} • Q {currentIndex+1}/{questions.length}</span>
          <span>{timeLeft}s</span>
        </div>

        <div className="text-sm text-blue-400">
          Avg Score: {avgScore}/10 • Answered: {Object.keys(answers).length}
        </div>

        <motion.div key={currentIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-xl font-semibold">{q.question}</h2>
        </motion.div>

        <textarea
          className="w-full p-4 rounded-xl border border-gray-700"
          rows={6}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="flex justify-between items-center">

          <button
            onClick={handleNext}
            disabled={!feedback}
            className="px-4 py-2 border border-gray-600 rounded"
          >
            Next
          </button>

          <div className="flex gap-3">
            <button onClick={startListening} className="p-2 border rounded">
              <FiMic />
            </button>

            {!feedback ? (
              <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 rounded">
                Submit
              </button>
            ) : (
              <button onClick={handleFinish} className="px-6 py-2 bg-green-600 rounded">
                Finish
              </button>
            )}
          </div>
        </div>

        {loadingFeedback && (
          <p className="text-gray-400 animate-pulse">
            AI is analyzing your answer...
          </p>
        )}

        {feedback && (
          <div className="p-4 bg-gray-800 rounded-xl space-y-3 border border-gray-700">
            <p className="text-blue-400 font-semibold">
              Score: {feedback.score}/10
            </p>

            <p>{feedback.strengths}</p>

            <div>
              <p className="font-semibold">Improvements</p>
              <p className="text-gray-400">{feedback.improvements}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}