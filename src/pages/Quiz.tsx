"use client";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore";
import { getQuestions } from "../services/questionService";
import { supabase } from "../services/supabase";

import { motion } from "framer-motion";
import { FiPlay, FiClock, FiBarChart2 } from "react-icons/fi";

import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Quiz() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [timeLimit, setTimeLimit] = useState(600);
  const [difficulty, setDifficulty] = useState("mixed");
  const [questionCount, setQuestionCount] = useState(10);

  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const [timeLeft, setTimeLeft] = useState(0);
  const submittedRef = useRef(false);

  // 🔒 Anti-cheat
  const [, setViolations] = useState(0);
  const MAX_VIOLATIONS = 2;

  // ✅ ANALYTICS (RESTORED)
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalTests: 0,
    avgAccuracy: 0,
    bestScore: 0,
  });

  ////////////////////////////////////////////////////
  // 📊 ANALYTICS FETCH (RESTORED)
  ////////////////////////////////////////////////////
  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      const { data: tests } = await supabase
        .from("tests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (!tests || tests.length === 0) return;

      const { data: answers } = await supabase
        .from("test_results")
        .select("test_id, is_correct")
        .eq("user_id", user.id);

      const map: any = {};

      answers?.forEach((a) => {
        if (!map[a.test_id]) map[a.test_id] = { t: 0, c: 0 };
        map[a.test_id].t++;
        if (a.is_correct) map[a.test_id].c++;
      });

      const last10 = tests.slice(-10).map((t, i) => {
        const a = map[t.id];
        return {
          name: `T${i + 1}`,
          score: a ? Math.round((a.c / a.t) * 100) : 0,
        };
      });

      const avg =
        tests.length > 0
          ? Math.round(
              tests.reduce((acc, t) => {
                const a = map[t.id];
                return acc + (a ? (a.c / a.t) * 100 : 0);
              }, 0) / tests.length
            )
          : 0;

      const best = Math.max(...last10.map((c) => c.score), 0);

      setChartData(last10);
      setStats({
        totalTests: tests.length,
        avgAccuracy: avg,
        bestScore: best,
      });
    };

    fetch();
  }, [user]);

  ////////////////////////////////////////////////////
  // 🚀 START QUIZ (FIXED NORMALIZATION)
  ////////////////////////////////////////////////////
  const startQuiz = async () => {
    setLoading(true);

    const data = await getQuestions({
      difficulty,
      limit: questionCount,
    });

    if (!data.length) {
      alert("No questions found");
      setLoading(false);
      return;
    }

    const normalized = data.map((q: any) => {
      let options = q.options;

      try {
        if (typeof options === "string") {
          options = JSON.parse(options);
        }
      } catch {
        options = [];
      }

      let correct = String(q.correct_answer).trim();

      if (["A", "B", "C", "D"].includes(correct)) {
        const idx = ["A", "B", "C", "D"].indexOf(correct);
        correct = options[idx];
      }

      return {
        ...q,
        options,
        correct_answer: String(correct).trim(),
      };
    });

    setQuestions(normalized);
    setAnswers({});
    setCurrentIndex(0);
    setStarted(true);
    setTimeLeft(timeLimit);
    submittedRef.current = false;

    setLoading(false);
  };

  ////////////////////////////////////////////////////
  // 🔒 STRONG SCREEN LOCK SYSTEM
  ////////////////////////////////////////////////////
  useEffect(() => {
    if (!started) return;

    const violationHandler = () => {
      setViolations((v) => {
        const nv = v + 1;

        if (nv >= MAX_VIOLATIONS) {
          alert("Auto-submitted due to cheating!");
          handleFinish();
        } else {
          alert(`Warning ${nv}/${MAX_VIOLATIONS}`);
        }

        return nv;
      });
    };

    const onBlur = () => violationHandler();
    const onVisibility = () => {
      if (document.hidden) violationHandler();
    };

    const block = (e: any) => e.preventDefault();

    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("contextmenu", block);
    window.addEventListener("copy", block);
    window.addEventListener("paste", block);

    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("contextmenu", block);
      window.removeEventListener("copy", block);
      window.removeEventListener("paste", block);
    };
  }, [started]);

  ////////////////////////////////////////////////////
  // ⏱ TIMER
  ////////////////////////////////////////////////////
  useEffect(() => {
    if (!started) return;

    if (timeLeft === 0 && !submittedRef.current) {
      handleFinish();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((p) => (p > 0 ? p - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, started]);

  ////////////////////////////////////////////////////
  // ANSWER
  ////////////////////////////////////////////////////
  const handleAnswer = (qid: string, selected: string) => {
    setAnswers((prev: any) => ({
      ...prev,
      [qid]: selected,
    }));
  };

  ////////////////////////////////////////////////////
  // LIVE ANALYTICS
  ////////////////////////////////////////////////////
  const attempted = Object.keys(answers).length;

  const correctCount = questions.filter(
    (q) =>
      String(answers[q.id]).trim() ===
      String(q.correct_answer).trim()
  ).length;

  const accuracy =
    attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;

  ////////////////////////////////////////////////////
  // FINISH
  ////////////////////////////////////////////////////
  const handleFinish = async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    try {
      if (!user) return navigate("/login");

      let score = 0;

      questions.forEach((q) => {
        if (
          String(answers[q.id]).trim() ===
          String(q.correct_answer).trim()
        ) {
          if (q.difficulty === "easy") score += 5;
          if (q.difficulty === "medium") score += 10;
          if (q.difficulty === "hard") score += 20;
        }
      });

      const { data: testData } = await supabase
        .from("tests")
        .insert({
          user_id: user.id,
          score,
          total_questions: questions.length,
          category: "mixed",
          difficulty,
        })
        .select()
        .single();

      const results = questions.map((q) => ({
        test_id: testData.id,
        user_id: user.id,
        question_id: q.id,
        selected_answer: answers[q.id],
        is_correct:
          String(answers[q.id]).trim() ===
          String(q.correct_answer).trim(),
      }));

      await supabase.from("test_results").insert(results);

      await supabase.rpc("increment_points", {
        uid: user.id,
        pts: score,
      });

      navigate("/result");
    } catch {
      navigate("/result");
    }
  };

  ////////////////////////////////////////////////////
  // UI (UNCHANGED)
  ////////////////////////////////////////////////////

  if (!started) {
    return (
      <div className="min-h-screen px-6 pt-28">
        <div className="max-w-6xl mx-auto space-y-8">

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-12 rounded-3xl bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-xl"
          >
            <h1 className="text-5xl font-bold">Quiz Arena 🚀</h1>

            <button
              onClick={startQuiz}
              disabled={loading}
              className="mt-6 px-8 py-4 bg-white text-black rounded-xl flex gap-2 items-center"
            >
              <FiPlay />
              {loading ? "Loading..." : "Start Test"}
            </button>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <SelectorCard title="Time" icon={<FiClock />} options={[
              { label: "5m", value: 300 },
              { label: "10m", value: 600 },
              { label: "20m", value: 1200 },
            ]} selected={timeLimit} setSelected={setTimeLimit} />

            <SelectorCard title="Difficulty" icon={<FiBarChart2 />} options={[
              { label: "Easy", value: "easy" },
              { label: "Medium", value: "medium" },
              { label: "Hard", value: "hard" },
              { label: "Mixed 🔀", value: "mixed" },
            ]} selected={difficulty} setSelected={setDifficulty} />

            <SelectorCard title="Questions" icon={<FiPlay />} options={[
              { label: "10", value: 10 },
              { label: "20", value: 20 },
              { label: "30", value: 30 },
            ]} selected={questionCount} setSelected={setQuestionCount} />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <StatCard title="Total Tests" value={stats.totalTests} />
            <StatCard title="Avg Accuracy" value={`${stats.avgAccuracy}%`} />
            <StatCard title="Best Score" value={`${stats.bestScore}%`} />
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="mb-4">Last 10 Tests</h3>

            {chartData.length === 0 ? (
              <p>No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <XAxis dataKey="name" />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];

  return (
    <div className="min-h-screen px-6 pt-28">
      <div className="max-w-4xl mx-auto">

        <div className="flex justify-between mb-4">
          <h2>{currentIndex + 1}/{questions.length}</h2>
          <span>⏱ {timeLeft}s</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard title="Attempted" value={`${attempted}/${questions.length}`} />
          <StatCard title="Accuracy" value={`${accuracy}%`} />
          <StatCard title="Correct" value={correctCount} />
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="mb-6">{q.question}</h3>

          {q.options.map((opt: string) => {
            const selected = answers[q.id];
            const isCorrect = opt === q.correct_answer;
            const isSelected = selected === opt;

            let style = "bg-white/5";

            if (selected) {
              if (isCorrect) style = "bg-green-500 text-black";
              else if (isSelected) style = "bg-red-500 text-white";
              else style = "bg-white/5 opacity-50";
            }

            return (
              <button
                key={opt}
                onClick={() => handleAnswer(q.id, opt)}
                className={`w-full p-3 mb-3 rounded-xl ${style}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
            className="px-5 py-2 bg-white/10 rounded"
          >
            Prev
          </button>

          {attempted >= questions.length ? (
            <button
              onClick={handleFinish}
              className="px-6 py-2 bg-green-500 rounded text-black font-semibold"
            >
              Submit
            </button>
          ) : (
            <button
              onClick={() =>
                setCurrentIndex((i) =>
                  Math.min(i + 1, questions.length - 1)
                )
              }
              className="px-6 py-2 bg-blue-500 rounded text-black font-semibold"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
function SelectorCard({ title, icon, options, selected, setSelected }: any) {
  return (
    <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
      <div className="flex gap-2 mb-4 items-center">
        {icon} {title}
      </div>

      <div className="flex gap-2 flex-wrap">
        {options.map((opt: any) => (
          <button
            key={opt.label}
            onClick={() => setSelected(opt.value)}
            className={`px-3 py-1 rounded-full transition ${
              selected === opt.value
                ? "bg-white text-black"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatCard({ title, value }: any) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <p className="text-xs opacity-60">{title}</p>
      <h3 className="text-lg font-bold">{value}</h3>
    </div>
  );
}