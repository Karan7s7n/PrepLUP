"use client";
<<<<<<< HEAD

=======
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuthStore } from "../store/authStore";
<<<<<<< HEAD
import { FiMic } from "react-icons/fi";
import { motion } from "framer-motion";

interface Question {
  id: string;
  question: string;
  example_answer?: string;
  role?: string;
=======
import { evaluateAnswer } from "../services/aiService";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

import { FiMic } from "react-icons/fi";

//////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////
interface Question {
  id: string;
  question: string;
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
}

interface Feedback {
  score: number;
  strengths: string;
  improvements: string;
}

<<<<<<< HEAD
=======
//////////////////////////////////////////////////////
// MAIN
//////////////////////////////////////////////////////
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
export default function Interview() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

<<<<<<< HEAD
=======
  //////////////////////////////////////////////////////
  // CONFIG
  //////////////////////////////////////////////////////
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
  const roles = [
    "frontend","backend","React Engineer","DevOps Engineer",
    "AI & ML","SAP Engineer","Numerical Ability",
    "Logical Reasoning","Verbal Ability","general","mixed"
  ];

  const [selectedRole, setSelectedRole] = useState("frontend");
<<<<<<< HEAD
  const [started, setStarted] = useState(false);

=======
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedTime, setSelectedTime] = useState(300);

  //////////////////////////////////////////////////////
  // STATES
  //////////////////////////////////////////////////////
  const [started, setStarted] = useState(false);
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
<<<<<<< HEAD
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
=======
  const [answers, setAnswers] = useState<any>({});

  const [timeLeft, setTimeLeft] = useState(300);
  const timerRef = useRef<any>(null);

  //////////////////////////////////////////////////////
  // 📊 ANALYTICS
  //////////////////////////////////////////////////////
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [avgScore, setAvgScore] = useState(0);
  const [aiInsight, setAiInsight] = useState("");

  //////////////////////////////////////////////////////
  // LOAD ANALYTICS (NO AI CALL NOW)
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      const { data } = await supabase
        .from("interview_responses")
        .select("*")
        .eq("user_id", user.id);

      if (!data) return;

      setAnalytics(data);

      const avg =
        data.reduce((acc, d) => acc + d.score, 0) / data.length || 0;

      setAvgScore(Math.round(avg));

      //////////////////////////////////////////////////////
      // 🧠 SIMPLE LOCAL INSIGHT (REPLACES AI)
      //////////////////////////////////////////////////////
      if (avg >= 8) {
        setAiInsight("Excellent performance. Focus on consistency.");
      } else if (avg >= 6) {
        setAiInsight("Good progress. Improve structure & depth.");
      } else {
        setAiInsight("Work on fundamentals and clarity.");
      }
    };

    load();
  }, [user]);

  //////////////////////////////////////////////////////
  // START INTERVIEW
  //////////////////////////////////////////////////////
  const startInterview = async () => {
    let query = supabase.from("interview_questions").select("*");

    if (selectedRole !== "mixed") {
      query = query.eq("role", selectedRole);
    }

    const { data } = await query;

    if (!data?.length) return;

    const selected = data
      .sort(() => 0.5 - Math.random())
      .slice(0, questionCount);

    setQuestions(selected);
    setStarted(true);
    setTimeLeft(selectedTime);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
  };
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9

  //////////////////////////////////////////////////////
  // TIMER
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (started && timeLeft <= 0) handleFinish();
  }, [timeLeft]);

  //////////////////////////////////////////////////////
<<<<<<< HEAD
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
=======
  // SUBMIT (🔥 FIXED: NO AI)
  //////////////////////////////////////////////////////
  const handleSubmit = () => {
    if (!input) return;

    const result = evaluateAnswer(input);

    setFeedback(result);

    setAnswers((prev: any) => ({
      ...prev,
      [questions[currentIndex].id]: {
        answer: input,
        feedback: result,
      },
    }));
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
  };

  //////////////////////////////////////////////////////
  // NEXT
  //////////////////////////////////////////////////////
  const handleNext = () => {
    setInput("");
    setFeedback(null);

<<<<<<< HEAD
    if (currentIndex === questions.length - 1) handleFinish();
    else setCurrentIndex((i) => i + 1);
=======
    if (currentIndex === questions.length - 1) {
      handleFinish();
    } else {
      setCurrentIndex((i) => i + 1);
    }
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
  };

  //////////////////////////////////////////////////////
  // FINISH
  //////////////////////////////////////////////////////
  const handleFinish = async () => {
<<<<<<< HEAD
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
=======
    clearInterval(timerRef.current);

    if (!user?.id) return;

    const { data: session } = await supabase
      .from("interview_sessions")
      .insert({ user_id: user.id, role: selectedRole })
      .select()
      .single();

    const responses = Object.entries(answers).map(([qid, val]: any) => ({
      session_id: session.id,
      question_id: qid,
      answer: val.answer,
      feedback: JSON.stringify(val.feedback),
      score: val.feedback.score,
      user_id: user.id,
    }));

    await supabase.from("interview_responses").insert(responses);

    navigate(`/interview/report/${session.id}`);
  };

  //////////////////////////////////////////////////////
  // 🟣 DASHBOARD
  //////////////////////////////////////////////////////
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-10">

        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold">AI Interview</h1>

          {/* ROLE */}
          <div className="flex flex-wrap gap-2 justify-center">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1 rounded-full border transition ${
                  selectedRole === role
                    ? "bg-blue-600 text-white"
                    : "opacity-70"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* CONFIG */}
          <div className="flex gap-6 justify-center">

            {/* QUESTIONS */}
            <div className="flex gap-2">
              {[3,5,10].map(q => (
                <button
                  key={q}
                  onClick={() => setQuestionCount(q)}
                  className={`px-4 py-1 rounded-full border ${
                    questionCount === q ? "bg-purple-600 text-white" : ""
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* TIME */}
            <div className="flex gap-2">
              {[180,300,600].map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`px-4 py-1 rounded-full border ${
                    selectedTime === t ? "bg-blue-600 text-white" : ""
                  }`}
                >
                  {t === 180 ? "3m" : t === 300 ? "5m" : "10m"}
                </button>
              ))}
            </div>

          </div>

          <button
            onClick={startInterview}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl flex gap-2 mx-auto"
          >
            <FiMic /> Start Interview
          </button>
        </div>

        {/* ANALYTICS */}
        <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl">

          <div className="p-6 border rounded-xl">
            <h3>Avg Score</h3>
            <p className="text-3xl font-bold">{avgScore}/10</p>
          </div>

          <div className="p-6 border rounded-xl col-span-2">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analytics.slice(-10)}>
                <XAxis dataKey="created_at" hide />
                <YAxis />
                <Tooltip />
                <Line dataKey="score" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-6 border rounded-xl col-span-3">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics}>
                <XAxis dataKey="score" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-6 border rounded-xl col-span-3">
            <h3>Insight</h3>
            <p>{aiInsight}</p>
          </div>
        </div>
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
      </div>
    );
  }

<<<<<<< HEAD
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
=======
  //////////////////////////////////////////////////////
  // INTERVIEW UI
  //////////////////////////////////////////////////////
  const q = questions[currentIndex];

  return (
    <div className="min-h-screen flex justify-center p-6">
      <div className="w-full max-w-3xl space-y-4">

        <div className="w-full h-2 bg-gray-300 rounded">
          <div
            className="h-2 bg-blue-500"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
            }}
          />
        </div>

<<<<<<< HEAD
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
=======
        <div className="flex justify-between text-sm opacity-70">
          <span>{selectedRole} • Q {currentIndex + 1}/{questions.length}</span>
          <span>{timeLeft}s</span>
        </div>

        <h2 className="text-xl font-semibold">{q.question}</h2>

        <textarea
          className="w-full p-4 border rounded-xl"
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
          rows={6}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

<<<<<<< HEAD
        <div className="flex justify-between items-center">

          <button
            onClick={handleNext}
            disabled={!feedback}
            className="px-4 py-2 border border-gray-600 rounded"
=======
        <div className="flex justify-between">
          <button
            onClick={handleNext}
            disabled={!feedback}
            className="px-5 py-2 border rounded disabled:opacity-40"
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
          >
            Next
          </button>

<<<<<<< HEAD
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
=======
          {!feedback ? (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded"
            >
              Submit
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2 bg-green-600 text-white rounded"
            >
              Finish
            </button>
          )}
        </div>

        {feedback && (
          <div className="p-4 border rounded-xl">
            <p className="text-green-500">Score: {feedback.score}/10</p>
            <p><b>Strengths:</b> {feedback.strengths}</p>
            <p><b>Improvements:</b> {feedback.improvements}</p>
          </div>
        )}
      </div>
    </div>
  );
}
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
