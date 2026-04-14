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

  // 📊 ANALYTICS
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalTests: 0,
    avgAccuracy: 0,
    bestScore: 0,
  });

  ////////////////////////////////////////////////////
  // 📊 FETCH ANALYTICS (FIXED)
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

      // LAST 10 for chart
      const last10 = tests.slice(-10);

      const chart = last10.map((t, i) => ({
        name: `T${i + 1}`,
        score:
          t.total_questions > 0
            ? Math.round((t.score / t.total_questions) * 100)
            : 0,
      }));

      // SAFE CALCULATIONS
      let totalAcc = 0;

      tests.forEach((t) => {
        if (t.total_questions > 0) {
          totalAcc += (t.score / t.total_questions) * 100;
        }
      });

      const avg = Math.round(totalAcc / tests.length);

      const best = Math.max(
        ...tests.map((t) =>
          t.total_questions > 0
            ? Math.round((t.score / t.total_questions) * 100)
            : 0
        )
      );

      setChartData(chart);
      setStats({
        totalTests: tests.length,
        avgAccuracy: avg || 0,
        bestScore: best || 0,
      });
    };

    fetch();
  }, [user]);

  ////////////////////////////////////////////////////
  // 🚀 START QUIZ
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

    setQuestions(data);
    setAnswers({});
    setCurrentIndex(0);
    setStarted(true);

    setTimeLeft(timeLimit);
    submittedRef.current = false;

    setLoading(false);
  };

  ////////////////////////////////////////////////////
  // ⏱ TIMER FIXED
  ////////////////////////////////////////////////////
  useEffect(() => {
    if (!started) return;

    if (timeLeft === 0 && !submittedRef.current) {
      handleFinish();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
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
    (q) => answers[q.id] === q.correct_answer
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
      if (!user) {
        navigate("/login");
        return;
      }

      let score = 0;

      questions.forEach((q) => {
        const selected = answers[q.id];
        if (selected === q.correct_answer) {
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
        is_correct: answers[q.id] === q.correct_answer,
      }));

      await supabase.from("test_results").insert(results);

      await supabase.rpc("increment_points", {
        uid: user.id,
        pts: score,
      });

      navigate("/result");
    } catch (err) {
      console.error(err);
      navigate("/result");
    }
  };

  ////////////////////////////////////////////////////
  // PRE START UI
  ////////////////////////////////////////////////////
  if (!started) {
    return (
      <div className="min-h-screen px-6 pt-28">
        <div className="max-w-6xl mx-auto space-y-8">

          <motion.div className="p-12 rounded-3xl bg-gradient-to-r from-purple-600 to-blue-500 text-white">
            <h1 className="text-5xl font-bold">Quiz Arena 🚀</h1>

            <button
              onClick={startQuiz}
              disabled={loading}
              className="mt-6 px-8 py-4 bg-white text-black rounded-xl flex gap-2"
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


          {/* STATS */}
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard title="Total Tests" value={stats.totalTests} />
            <StatCard title="Avg Accuracy" value={`${stats.avgAccuracy}%`} />
            <StatCard title="Best Score" value={`${stats.bestScore}%`} />
          </div>

          {/* CHART */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="mb-4">Last 10 Tests</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="name" />
                <Tooltip />
                <Line type="monotone" dataKey="score" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* SELECTORS */}
         
        </div>
      </div>
    );
  }

  ////////////////////////////////////////////////////
  // QUIZ UI (RESTORED)
  ////////////////////////////////////////////////////
  const q = questions[currentIndex];

  return (
    <div className="min-h-screen px-6 pt-28">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <h2>{currentIndex + 1}/{questions.length}</h2>
          <span>⏱ {timeLeft}s</span>
        </div>

        {/* ANALYTICS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard title="Attempted" value={`${attempted}/${questions.length}`} />
          <StatCard title="Accuracy" value={`${accuracy}%`} />
          <StatCard title="Correct" value={correctCount} />
        </div>

        {/* QUESTION */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="mb-6">{q.question}</h3>

          {q.options.map((opt: string) => (
            <button
              key={opt}
              onClick={() => handleAnswer(q.id, opt)}
              className={`w-full p-3 mb-3 rounded-xl ${
                answers[q.id] === opt
                  ? "bg-purple-600 text-white"
                  : "bg-white/5"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* NAV */}
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
      <div className="flex gap-2 mb-4">{icon} {title}</div>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt: any) => (
          <button
            key={opt.label}
            onClick={() => setSelected(opt.value)}
            className={`px-3 py-1 rounded-full ${
              selected === opt.value
                ? "bg-white text-black"
                : "bg-white/10"
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
