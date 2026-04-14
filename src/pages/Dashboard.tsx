"use client";
import { motion } from "framer-motion";
import {
  FiBarChart2,
  FiFileText,
  FiActivity,
  FiTarget,
  FiTrendingUp,
  FiAward,
  FiPlay,
} from "react-icons/fi";
import { useTheme } from "../components/ui/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useAuthStore } from "../store/authStore";

import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [stats, setStats] = useState<any>({
    tests: 0,
    avgScore: 0,
    accuracy: 0,
    points: 0,
    streak: 0,
  });

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [rank, setRank] = useState<number>(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [aiInsight, setAiInsight] = useState("Analyzing your performance...");

  const baseGlass =
    theme === "light"
      ? "border-black/10 text-black"
      : "border-white/10 text-white";

  const tint = {
    purple: "bg-purple-500/10",
    blue: "bg-blue-500/10",
    green: "bg-green-500/10",
    yellow: "bg-yellow-500/10",
    pink: "bg-pink-500/10",
  };

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      ////////////////////////////////////////////////////
      // 📊 TESTS
      ////////////////////////////////////////////////////
      const { data: tests } = await supabase
        .from("tests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      ////////////////////////////////////////////////////
      // 📈 RESULTS
      ////////////////////////////////////////////////////
      const { data: results } = await supabase
        .from("test_results")
        .select("is_correct")
        .eq("user_id", user.id);

      ////////////////////////////////////////////////////
      // 📊 PROGRESS
      ////////////////////////////////////////////////////
      const { data: progress } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .single();

      ////////////////////////////////////////////////////
      // 🧠 CALCULATIONS
      ////////////////////////////////////////////////////
      const safeTests = tests ?? [];
      const totalTests = safeTests.length;

      const avgScore =
        totalTests > 0
          ? Math.round(
              safeTests.reduce(
                (acc, t) => acc + (t.score / t.total_questions) * 100,
                0
              ) / totalTests
            )
          : 0;

      const correct = results?.filter((r) => r.is_correct).length || 0;
      const total = results?.length || 0;
      const accuracy = total ? Math.round((correct / total) * 100) : 0;

      setStats({
        tests: totalTests,
        avgScore,
        accuracy,
        points: progress?.points || 0,
        streak: progress?.streak || 0,
      });

      ////////////////////////////////////////////////////
      // 📉 CHART
      ////////////////////////////////////////////////////
      const chart = safeTests.map((t, i) => ({
        name: `T${i + 1}`,
        score: Math.round((t.score / t.total_questions) * 100),
      }));

      setChartData(chart);

      ////////////////////////////////////////////////////
      // 🏆 LEADERBOARD
      ////////////////////////////////////////////////////
      const { data: allUsers } = await supabase
        .from("user_progress")
        .select("user_id, points")
        .order("points", { ascending: false });

      setLeaderboard(allUsers?.slice(0, 5) || []);

      const userRank =
        (allUsers?.findIndex((u) => u.user_id === user.id) ?? -1) + 1;

      setRank(userRank > 0 ? userRank : 0);

      ////////////////////////////////////////////////////
      // 🧠 AI INSIGHT (SMART)
      ////////////////////////////////////////////////////
      if (accuracy < 40) {
        setAiInsight(
          "You're struggling with fundamentals. Focus on basics and consistency."
        );
      } else if (accuracy < 70) {
        setAiInsight(
          "Good progress. Work on weak areas and improve accuracy."
        );
      } else if (accuracy < 90) {
        setAiInsight(
          "Strong performance. Start solving harder problems to level up."
        );
      } else {
        setAiInsight(
          "Excellent! You're performing at a top level 🚀"
        );
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen pt-28 pb-10 px-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HERO */}
        <div className="p-10 rounded-3xl bg-linear-to-r from-purple-600 to-blue-500 text-white">
          <h1 className="text-4xl font-bold">Welcome back 👋</h1>
          <p className="opacity-80 mt-2">
            Rank #{rank} • {stats.points} pts • Streak 🔥 {stats.streak}
          </p>
        </div>

        {/* 🔥 STATS CARDS */}
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard title="Tests" value={stats.tests} />
          <StatCard title="Avg Score" value={`${stats.avgScore}%`} />
          <StatCard title="Accuracy" value={`${stats.accuracy}%`} />
          <StatCard title="Points" value={stats.points} />
        </div>

        {/* FEATURES + LEADERBOARD */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* FEATURES */}
          <div className={`lg:col-span-2 p-6 rounded-3xl ${baseGlass} ${tint.purple}`}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {[
                { title: "Aptitude", icon: <FiTarget />, path: "/quiz" },
                { title: "Interview", icon: <FiActivity />, path: "/interview" },
                { title: "Resume", icon: <FiFileText />, path: "/resume" },
                { title: "Analytics", icon: <FiBarChart2 />, path: "/analytics" },
                { title: "Challenge", icon: <FiTrendingUp />, path: "/challenge" },
                { title: "Leaderboard", icon: <FiAward />, path: "/leaderboard" },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate(f.path)}
                  className="p-5 rounded-xl bg-white/5 border border-white/10 cursor-pointer"
                >
                  <div className="text-lg mb-3">{f.icon}</div>
                  <h3 className="text-sm font-semibold">{f.title}</h3>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 🏆 LEADERBOARD */}
          <div className={`p-6 rounded-3xl ${baseGlass} ${tint.blue}`}>
            <h2 className="mb-4 font-semibold">Top 5 🏆</h2>

            {leaderboard.map((u, i) => (
              <div
                key={i}
                className={`mb-3 text-sm flex justify-between ${
                  u.user_id === user.id ? "text-yellow-400 font-bold" : ""
                }`}
              >
                <span>
                  #{i + 1} {u.user_id === user.id ? "You" : "User"}
                </span>
                <span>{u.points}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 📊 CHART */}
        <div className={`p-6 rounded-3xl ${baseGlass} ${tint.green}`}>
          <h2 className="mb-4 font-semibold">Performance 📊</h2>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" />
              <Tooltip />
              <Line type="monotone" dataKey="score" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 🧠 AI */}
        <div className={`p-5 rounded-2xl ${baseGlass} ${tint.pink}`}>
          <h3 className="font-semibold mb-2">AI Insight 🧠</h3>
          <p className="text-sm">{aiInsight}</p>
        </div>

        {/* ▶️ CONTINUE */}
        <div className={`p-5 rounded-2xl ${baseGlass} ${tint.yellow}`}>
          <h3 className="font-semibold mb-2">Continue</h3>
          <button
            onClick={() => navigate("/quiz")}
            className="mt-2 flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm"
          >
            <FiPlay /> Start / Resume Test
          </button>
        </div>
      </div>
    </div>
  );
}

////////////////////////////////////////////////////
// 🔥 STAT CARD
////////////////////////////////////////////////////
function StatCard({ title, value }: any) {
  return (
    <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
      <p className="text-xs opacity-60">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  );
}
