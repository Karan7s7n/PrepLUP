"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../components/ui/ThemeContext";
import { supabase } from "../services/supabase";
import { useAuthStore } from "../store/authStore";
import {
  FiTarget,
  FiActivity,
  FiFileText,
  FiPlay,
} from "react-icons/fi";

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

  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [recent, setRecent] = useState<any>(null);
  const [insight, setInsight] = useState("Loading insights...");

  //////////////////////////////////////////////////////
  // LOAD DATA
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      // PROFILE
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      setProfile(profileData);

      // TESTS
      const { data: tests } = await supabase
        .from("tests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (!tests || tests.length === 0) {
        setStats([
          { label: "Tests", value: 0 },
          { label: "Avg Points", value: 0 },
          { label: "Accuracy", value: "0%" },
        ]);
        return;
      }

      //////////////////////////////////////////////////////
      // ✅ FETCH ALL ANSWERS (IMPORTANT FIX)
      //////////////////////////////////////////////////////
      const { data: answers } = await supabase
        .from("test_results")
        .select("test_id, is_correct")
        .eq("user_id", user.id);

      //////////////////////////////////////////////////////
      // 🎯 CALCULATIONS
      //////////////////////////////////////////////////////
      const totalTests = tests.length;

      // Avg Points (raw score)
      const avgPoints = Math.round(
        tests.reduce((sum, t) => sum + t.score, 0) / totalTests
      );

      // Accuracy (based on correctness)
      const totalAnswers = answers?.length || 0;
      const correctAnswers =
        answers?.filter((a) => a.is_correct).length || 0;

      const accuracy =
        totalAnswers > 0
          ? Math.round((correctAnswers / totalAnswers) * 100)
          : 0;

      //////////////////////////////////////////////////////
      // SET STATS
      //////////////////////////////////////////////////////
      setStats([
        { label: "Tests", value: totalTests },
        { label: "Avg Points", value: avgPoints },
        { label: "Accuracy", value: `${accuracy}%` },
      ]);

      //////////////////////////////////////////////////////
      // 📊 CHART (last 5 tests normalized)
      //////////////////////////////////////////////////////
      const last5 = tests.slice(-5);
      const chart = last5.map((t, i) => ({
        name: `T${i + 1}`,
        score:
          t.total_questions > 0
            ? Math.round((t.score / (t.total_questions * 20)) * 100)
            : 0,
      }));

      setChartData(chart);

      //////////////////////////////////////////////////////
      // RECENT
      //////////////////////////////////////////////////////
      const latest = tests[tests.length - 1];
      setRecent(latest);

      //////////////////////////////////////////////////////
      // 🧠 INSIGHT
      //////////////////////////////////////////////////////
      if (accuracy < 50) {
        setInsight("Focus on fundamentals. Accuracy is low.");
      } else if (accuracy < 75) {
        setInsight("You're improving. Practice consistently.");
      } else {
        setInsight("Great performance 🚀 Try harder challenges.");
      }
    };

    load();
  }, [user]);

  //////////////////////////////////////////////////////
  // UI CONFIG
  //////////////////////////////////////////////////////
  const name = profile?.name || "User";
  const avatar = profile?.avatar_url;

  const glass =
    theme === "light"
      ? "bg-white/70 border-black/10 text-black"
      : "bg-white/5 border-white/10 text-white";

  const services = [
    { title: "Aptitude", icon: <FiTarget />, path: "/quiz" },
    { title: "Interview", icon: <FiActivity />, path: "/interview" },
    { title: "Resume", icon: <FiFileText />, path: "/resume" },
    { title: "Mind Ease", icon: <FiPlay />, path: "/mind-ease" },
  ];

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <div className="min-h-screen pt-28 pb-16 px-6">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* HERO */}
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h1 className="text-4xl font-bold">
              Welcome back, {name} 👋
            </h1>
            <p className="opacity-70 mt-2">
              Track your growth and improve daily.
            </p>

            <button
              onClick={() => navigate("/quiz")}
              className="mt-4 px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl"
            >
              Start Test
            </button>
          </div>

          {/* 🤖 AI CHATBOT CTA */}
<div className={`p-8 rounded-3xl ${glass} flex flex-col md:flex-row items-center justify-between gap-6`}>
  
  <div>
    <h2 className="text-2xl font-bold mb-2">
      Your Personal Placement Assistant 🤖
    </h2>
    <p className="text-sm opacity-70 max-w-md">
      Get personalized roadmaps, improve your weak areas, and prepare smarter
      with AI-powered guidance tailored to your performance.
    </p>
  </div>

  <button
    onClick={() => navigate("/assistant")}
    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition"
  >
    Open Assistant
  </button>

</div>

          <div className="flex justify-center">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-white/10 flex items-center justify-center text-2xl font-bold">
              {avatar ? (
                <img src={avatar} className="w-full h-full object-cover" />
              ) : (
                name?.[0]
              )}
            </div>
          </div>
        </div>

        {/* FEATURES */}
        <div className={`p-6 rounded-3xl ${glass}`}>
          <h2 className="mb-4 font-semibold">Features</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {services.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate(s.path)}
                className="p-5 rounded-xl bg-white/5 border border-white/10 cursor-pointer"
              >
                <div className="text-lg mb-2">{s.icon}</div>
                <p className="text-sm font-semibold">{s.title}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <div key={i} className={`p-5 rounded-2xl ${glass}`}>
              <p className="text-sm opacity-70">{s.label}</p>
              <h3 className="text-2xl font-bold">{s.value}</h3>
            </div>
          ))}
        </div>

        {/* CHART */}
        <div className={`p-6 rounded-3xl ${glass}`}>
          <h2 className="mb-4 font-semibold">Performance Trend</h2>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" />
              <Tooltip />
              <Line type="monotone" dataKey="score" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        

        {/* RECENT + INSIGHT */}
        <div className="grid md:grid-cols-2 gap-6">

          <div className={`p-5 rounded-2xl ${glass}`}>
            <h3 className="font-semibold mb-2">Recent Activity</h3>
            {recent ? (
              <p className="text-sm opacity-70">
                Last Test Score: {recent.score} pts <br />
                Questions: {recent.total_questions}
              </p>
            ) : (
              <p className="opacity-60 text-sm">
                No recent activity
              </p>
            )}
          </div>

          <div className={`p-5 rounded-2xl ${glass}`}>
            <h3 className="font-semibold mb-2">Insight</h3>
            <p className="text-sm opacity-70">{insight}</p>
          </div>

        </div>

        {/* CTA */}
        {/* FEATURE EXPLANATION + CTA */}
<div className="space-y-6">

  <h2 className="text-2xl font-bold">Explore Features 🚀</h2>

  <div className="grid md:grid-cols-2 gap-6">

    {/* APTITUDE */}
    <div className={`p-6 rounded-2xl ${glass}`}>
      <h3 className="text-lg font-semibold mb-2">Aptitude Tests</h3>
      <p className="text-sm opacity-70 mb-4">
        Practice timed quizzes across multiple difficulty levels.
        Improve speed, accuracy, and problem-solving skills.
      </p>

      <button
        onClick={() => navigate("/quiz")}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg"
      >
        Start Quiz
      </button>
    </div>

    {/* INTERVIEW */}
    <div className={`p-6 rounded-2xl ${glass}`}>
      <h3 className="text-lg font-semibold mb-2">Interview Prep</h3>
      <p className="text-sm opacity-70 mb-4">
        Simulate real interview scenarios and improve your communication,
        confidence, and response quality.
      </p>

      <button
        onClick={() => navigate("/interview")}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Practice Interview
      </button>
    </div>

    {/* RESUME */}
    <div className={`p-6 rounded-2xl ${glass}`}>
      <h3 className="text-lg font-semibold mb-2">Resume Builder</h3>
      <p className="text-sm opacity-70 mb-4">
        Create a professional resume with structured templates and
        enhaced editing tools to showcase your skills and experience effectively.
      </p>

      <button
        onClick={() => navigate("/resume")}
        className="px-4 py-2 bg-green-600 text-white rounded-lg"
      >
        Build Resume
      </button>
    </div>

    {/* MIND EASE */}
    <div className={`p-6 rounded-2xl ${glass}`}>
      <h3 className="text-lg font-semibold mb-2">Mind Ease</h3>
      <p className="text-sm opacity-70 mb-4">
        Relax your mind with guided exercises, stress relief techniques,
        and focus-enhancing activities.
      </p>

      <button
        onClick={() => navigate("/mind-ease")}
        className="px-4 py-2 bg-pink-600 text-white rounded-lg"
      >
        Relax Now
      </button>
    </div>

  </div>
</div>

      </div>
    </div>
  );
}