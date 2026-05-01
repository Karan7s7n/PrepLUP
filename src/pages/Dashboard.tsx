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
  FiCpu,
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
  const [insight, setInsight] = useState("Analyzing your performance...");
  const [loadingAI, setLoadingAI] = useState(false);

  // 🆕 NEW STATES
  const [weakTopics, setWeakTopics] = useState<any[]>([]);
  const [studyPlan, setStudyPlan] = useState("");
  const [loadingPlan, setLoadingPlan] = useState(false);

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
        setInsight("Start practicing to unlock AI insights.");
        return;
      }

      // ANSWERS (with topic)
      const { data: answers } = await supabase
        .from("test_results")
        .select("topic, is_correct")
        .eq("user_id", user.id);

      //////////////////////////////////////////////////////
      // STATS
      //////////////////////////////////////////////////////
      const totalTests = tests.length;

      const avgPoints = Math.round(
        tests.reduce((sum, t) => sum + t.score, 0) / totalTests
      );

      const totalAnswers = answers?.length || 0;
      const correctAnswers =
        answers?.filter((a) => a.is_correct).length || 0;

      const accuracy =
        totalAnswers > 0
          ? Math.round((correctAnswers / totalAnswers) * 100)
          : 0;

      const statsData = [
        { label: "Tests", value: totalTests },
        { label: "Avg Points", value: avgPoints },
        { label: "Accuracy", value: `${accuracy}%` },
      ];

      setStats(statsData);

      //////////////////////////////////////////////////////
      // 🧠 WEAK TOPICS (NEW)
      //////////////////////////////////////////////////////
      const topicMap: any = {};

      answers?.forEach((a) => {
        if (!a.topic) return;

        if (!topicMap[a.topic]) {
          topicMap[a.topic] = { total: 0, correct: 0 };
        }

        topicMap[a.topic].total++;
        if (a.is_correct) topicMap[a.topic].correct++;
      });

      const topicAccuracy = Object.entries(topicMap).map(
        ([topic, val]: any) => ({
          topic,
          accuracy: Math.round((val.correct / val.total) * 100),
        })
      );

      const weak = topicAccuracy
        .filter((t: any) => t.accuracy < 60)
        .sort((a, b) => a.accuracy - b.accuracy);

      setWeakTopics(weak);

      //////////////////////////////////////////////////////
      // CHART
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

      setRecent(tests[tests.length - 1]);

      //////////////////////////////////////////////////////
      // 🤖 AI INSIGHT (UPDATED)
      //////////////////////////////////////////////////////
      generateAIInsight(statsData, weak);
    };

    load();
  }, [user]);

  //////////////////////////////////////////////////////
  // 🤖 AI INSIGHT
  //////////////////////////////////////////////////////
  const generateAIInsight = async (statsData: any[], weak: any[]) => {
    try {
      setLoadingAI(true);

      const { data } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: "Analyze my performance",
          context: {
            stats: statsData,
            weakTopics: weak,
          },
        },
      });

      setInsight(data?.reply || "Keep practicing consistently.");
    } catch {
      setInsight("Unable to fetch AI insight.");
    }

    setLoadingAI(false);
  };

  //////////////////////////////////////////////////////
  // 🧠 STUDY PLAN
  //////////////////////////////////////////////////////
  const generateStudyPlan = async () => {
    setLoadingPlan(true);

    const { data } = await supabase.functions.invoke("ai-chat", {
      body: {
        message: "Create a study plan",
        context: {
          stats,
          weakTopics,
        },
      },
    });

    setStudyPlan(data?.reply || "No plan generated");
    setLoadingPlan(false);
  };

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

            <button
              onClick={() => navigate("/quiz")}
              className="mt-4 px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl"
            >
              Start Test
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

        {/* 🤖 AI CTA */}
        <div className={`p-8 rounded-3xl ${glass}`}>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FiCpu /> AI Assistant
          </h2>

          <div className="flex gap-3 flex-wrap mt-3">
            <button
              onClick={() => navigate("/assistant")}
              className="px-5 py-2 bg-purple-600 text-white rounded-xl"
            >
              Open Assistant
            </button>

            <button
              onClick={generateStudyPlan}
              className="px-5 py-2 bg-blue-600 text-white rounded-xl"
            >
              {loadingPlan ? "Generating..." : "AI Study Plan"}
            </button>
          </div>

          {studyPlan && (
            <p className="mt-4 text-sm whitespace-pre-line opacity-80">
              {studyPlan}
            </p>
          )}
        </div>

        {/* 🧠 WEAK TOPICS */}
        <div className={`p-6 rounded-3xl ${glass}`}>
  <div className="flex justify-between items-center mb-4">
    <h2 className="font-semibold">Review ⚠️</h2>
    <span className="text-xs opacity-60">AI detected</span>
  </div>

  {weakTopics.length === 0 ? (
    <div className="text-sm opacity-70"> 
      <p className="text-xs mt-1">Keep practicing to maintain performance</p>
    </div>
  ) : (
    <div className="space-y-4">
      {weakTopics.map((t, i) => (
        <div
          key={i}
          className="p-3 rounded-xl bg-black/20 border border-white/10 space-y-2"
        >
          {/* Topic + Accuracy */}
          <div className="flex justify-between text-sm">
            <div>
              <p className="font-medium">{t.topic}</p>
              {t.subtopic && (
                <p className="text-xs opacity-60">{t.subtopic}</p>
              )}
            </div>

            <span className="text-red-400 font-semibold">
              {t.accuracy}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-gray-700 rounded">
            <div
              className="h-2 bg-red-500 rounded"
              style={{ width: `${t.accuracy}%` }}
            />
          </div>

          {/* Extra info */}
          <div className="flex justify-between text-xs opacity-70">
            <span>Level: {t.avgDifficulty || "—"}</span>
            <span>{t.attempts || 0} attempts</span>
          </div>

          {/* Action */}
          <button
            onClick={() => navigate(`/interview?focus=${t.topic}`)}
            className="text-xs px-3 py-1 bg-purple-600 rounded hover:bg-purple-700"
          >
            Practice this →
          </button>
        </div>
      ))}
    </div>
  )}
</div>

        {/* EXISTING UI BELOW (UNCHANGED) */}
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
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" />
              <Tooltip />
              <Line type="monotone" dataKey="score" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* RECENT + AI */}

  {/* 📊 LAST PERFORMANCE */}
  <div className={`p-5 rounded-2xl ${glass} space-y-3`}>
    <p className="text-xs opacity-60">Recent Performance</p>

    {recent ? (
      <>
        <h3 className="text-2xl font-bold">
          {recent.score}
        </h3>

        <div className="flex justify-between text-sm opacity-70">
          <span>Questions: {recent.total_questions}</span>
          <span>{recent.difficulty}</span>
        </div>

        <div className="w-full bg-white/10 rounded-full h-2 mt-2">
          <div
            className="h-2 rounded-full bg-green-500"
            style={{
              width: `${Math.min(
                100,
                Math.round(
                  (recent.score / (recent.total_questions * 20)) * 100
                )
              )}%`,
            }}
          />
        </div>
      </>
    ) : (
      <p className="text-sm opacity-60">
        No tests yet. Start one 🚀
      </p>
    )}
  </div>

  {/* 🤖 AI INSIGHTS */}
  <div className={`p-5 rounded-2xl ${glass} space-y-3`}>
    <p className="text-xs opacity-60">AI Insight</p>

    <p className="text-sm leading-relaxed">
      {loadingAI ? (
        <span className="animate-pulse">Thinking...</span>
      ) : insight ? (
        insight
      ) : (
        "Take a test to get personalized feedback."
      )}
    </p>
  </div>

</div>

      </div>
    
  );
}