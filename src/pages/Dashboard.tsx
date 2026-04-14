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

export default function Dashboard() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      setProfile(data);
    };

    load();
  }, [user]);

  const name = profile?.name || "User";
  const avatar = profile?.avatar_url;

  const glass =
    theme === "light"
      ? "bg-white/70 border-black/10 text-black"
      : "bg-white/5 border-white/10 text-white";

  //////////////////////////////////////////////////////
  // DATA
  //////////////////////////////////////////////////////

  const stats = [
    { label: "Tests", value: "12" },
    { label: "Avg Score", value: "78%" },
    { label: "Accuracy", value: "82%" },
    { label: "Points", value: "2400" },
  ];

  const services = [
    { title: "Aptitude", icon: <FiTarget />, path: "/quiz" },
    { title: "Interview", icon: <FiActivity />, path: "/interview" },
    { title: "Resume", icon: <FiFileText />, path: "/resume" },
    { title: "Mind Ease", icon: <FiPlay />, path: "/mind-ease" },
  ];


  const steps = [
    { title: "Start Test", desc: "Choose a quiz and begin" },
    { title: "Analyze", desc: "Review your mistakes" },
    { title: "Improve", desc: "Track progress daily" },
  ];

  return (
    <div className="min-h-screen pt-28 pb-16 px-6">
      <div className="max-w-7xl mx-auto space-y-10">

        <div className="grid md:grid-cols-2 gap-6 items-center">

          <div className="space-y-4">
            <h1 className="text-4xl font-bold">
              Welcome back, {name} 👋
            </h1>

            <p className="opacity-70">
              Continue your learning journey and improve your skills daily.
            </p>

            <button
              onClick={() => navigate("/quiz")}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl"
            >
              Start Learning
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

        <div className="grid md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className={`p-5 rounded-2xl ${glass}`}>
              <p className="text-xs opacity-60">{s.label}</p>
              <h2 className="text-2xl font-bold">{s.value}</h2>
            </div>
          ))}
        </div>

        <div className={`p-6 rounded-3xl ${glass}`}>
          <h2 className="text-lg font-semibold mb-4">Features</h2>

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

        
        <div className="grid md:grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <div key={i} className={`p-5 rounded-2xl ${glass}`}>
              <h3 className="font-semibold mb-1">{s.title}</h3>
              <p className="text-sm opacity-70">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-10 rounded-3xl bg-gradient-to-r from-purple-600 to-blue-500 text-white text-center">
          <h2 className="text-2xl font-bold">
            Ready to level up your skills?
          </h2>

          <button
            onClick={() => navigate("/quiz")}
            className="mt-4 px-6 py-2 bg-white text-black rounded-xl"
          >
            Start Now
          </button>
        </div>

        

      </div>
    </div>
  );
}