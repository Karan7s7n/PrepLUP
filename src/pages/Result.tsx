"use client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../services/supabase";
import { useAuthStore } from "../store/authStore";

import { motion } from "framer-motion";
import { FiTrendingUp } from "react-icons/fi";

export default function Result() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [result, setResult] = useState<any>(null);
  const [, setRank] = useState<number | null>(null);
  const [aiInsight, setAiInsight] = useState("Analyzing...");
  const [accuracy, setAccuracy] = useState(0);

  ////////////////////////////////////////////////////
  // 🎯 FETCH LAST TEST RESULT
  ////////////////////////////////////////////////////
  useEffect(() => {
    if (!user) return;

    const fetchResult = async () => {
      try {
        // ✅ latest test
        const { data: test, error: testError } = await supabase
          .from("tests")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (testError || !test) return;

        setResult(test);

        ////////////////////////////////////////////////////
        // ✅ FIXED: fetch answers by test_id (IMPORTANT)
        ////////////////////////////////////////////////////
        const { data: answers, error: ansError } = await supabase
          .from("test_results")
          .select("*")
          .eq("test_id", test.id);

        if (ansError) return;

        ////////////////////////////////////////////////////
        // 🧠 ACCURACY
        ////////////////////////////////////////////////////
        const correct =
          answers?.filter((a) => a.is_correct).length || 0;

        const total = answers?.length || 1;

        const acc = Math.round((correct / total) * 100);
        setAccuracy(acc);

        ////////////////////////////////////////////////////
        // 🏆 GLOBAL RANK
        ////////////////////////////////////////////////////
        const { data: allUsers } = await supabase
          .from("user_progress")
          .select("user_id, points")
          .order("points", { ascending: false });

        const index =
          allUsers?.findIndex((u) => u.user_id === user.id) ?? -1;

        setRank(index !== -1 ? index + 1 : null);

        ////////////////////////////////////////////////////
        // 🧠 AI INSIGHT
        ////////////////////////////////////////////////////
        if (acc < 40) {
          setAiInsight(
            "You need strong fundamentals. Focus on basics and accuracy."
          );
        } else if (acc < 70) {
          setAiInsight(
            "You're improving. Focus on consistency and reducing mistakes."
          );
        } else if (acc < 90) {
          setAiInsight(
            "Great performance! Try harder questions to level up."
          );
        } else {
          setAiInsight(
            "Excellent performance 🚀 You're among top performers."
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchResult();
  }, [user]);

  ////////////////////////////////////////////////////
  // ⛔ LOADING
  ////////////////////////////////////////////////////
  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading results...
      </div>
    );
  }

  ////////////////////////////////////////////////////
  // 🎯 CALCULATED SCORE %
  ////////////////////////////////////////////////////
  const maxPossibleScore = result.total_questions * 20; // max if all hard
  const scorePercent = Math.round(
    (result.score / maxPossibleScore) * 100
  );

  ////////////////////////////////////////////////////
  // 🎯 UI
  ////////////////////////////////////////////////////
  return (
    <div className="min-h-screen px-6 pt-28 pb-10">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 rounded-3xl bg-linear-to-r from-purple-600 to-blue-500 text-white"
        >
          <h1 className="text-4xl font-bold mb-2">
            Your Results 🎯
          </h1>
          <p className="opacity-80">
            Here's your real performance breakdown
          </p>
        </motion.div>

        {/* 🔥 SCORE CARDS */}
        <div className="grid md:grid-cols-3 gap-3">

          {/* ✅ FIXED: show points properly */}
          <Card
            title="Score"
            value={`${result.score} pts`}
            color="from-purple-500 to-indigo-500"
          />

          {/* ✅ NEW: percentage score */}
          <Card
            title="Score %"
            value={`${scorePercent}%`}
            color="from-pink-500 to-rose-500"
          />

          <Card
            title="Accuracy"
            value={`${accuracy}%`}
            color="from-blue-500 to-cyan-500"
          />

          

        </div>

        {/* 📊 PERFORMANCE BAR */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
          <h3 className="mb-4 font-semibold">Performance Overview</h3>

          <div className="w-full h-4 bg-white/10 rounded-full">
            <div
              className="h-4 rounded-full bg-linear-to-r from-purple-500 to-blue-500"
              style={{ width: `${accuracy}%` }}
            />
          </div>

          <p className="text-sm mt-2 opacity-70">
            Accuracy based on your latest test
          </p>
        </div>

        {/* 🧠 AI INSIGHT */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FiTrendingUp /> AI Analysis
          </h3>

          <p className="text-sm opacity-80 leading-relaxed">
            {aiInsight}
          </p>
        </div>

        {/* 🏆 ACTIONS */}
        <div className="flex gap-4">

          <button
            onClick={() => navigate("/quiz")}
            className="px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold"
          >
            Retry Quiz
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 rounded-xl bg-white/10"
          >
            Go Dashboard
          </button>

        </div>
      </div>
    </div>
  );
}

////////////////////////////////////////////////////
// 🎯 CARD COMPONENT
////////////////////////////////////////////////////
function Card({ title, value, color }: any) {
  return (
    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
      
      <div className={`absolute inset-0 opacity-20 bg-linear-to-br ${color}`} />

      <div className="relative">
        <p className="text-xs opacity-60">{title}</p>
        <h3 className="text-xl font-bold">{value}</h3>
      </div>
    </div>
  );
}