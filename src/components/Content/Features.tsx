"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, type JSX } from "react";
import { useTheme } from "../ui/ThemeContext";
import {
  FaPenFancy,
  FaBrain,
  FaUsers,
  FaPlay,
  FaClock,
  FaTrophy,
  FaCalendarDay,
} from "react-icons/fa";

interface Feature {
  title: string;
  icon: JSX.Element;
}

export const Features = () => {
  const { theme } = useTheme();
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef);

  useEffect(() => {
    if (isInView && !hasAnimated) setHasAnimated(true);
  }, [isInView, hasAnimated]);

  const features: Feature[] = [
    { title: "Aptitude Test System (CBT Style)", icon: <FaBrain /> },
    { title: "Interview Preparation Module", icon: <FaUsers /> },
    { title: "Resume Builder", icon: <FaPenFancy /> },
    { title: "Mindfulness Exercises", icon: <FaPlay /> },
    { title: "Personalized Roadmap Generator", icon: <FaClock /> },
    { title: "Leaderboard & Gamification", icon: <FaTrophy /> },
    { title: "Daily Challenge", icon: <FaCalendarDay /> },
  ];

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 50 }}
      animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className={`py-20 font-poppins relative ${
        theme === "light" ? " text-gray-900" : " text-white"
      }`}
    >
      <div className="px-4 mx-auto max-w-6xl sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className={`text-4xl sm:text-5xl font-bold ${
              theme === "light" ? "text-gray-900" : "text-white"
            }`}
          >
            Explore Preplup Features
          </motion.h2>
        </div>

        {/* Zig-Zag Feature Layout */}
        <div className="relative max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16 relative">
            {/* Connecting line */}
            <div className="absolute top-12 left-1/2 w-px h-[calc(100%-6rem)] bg-gradient-to-b from-cyan-400 via-cyan-500 to-transparent hidden md:block" />

            {features.map((feature, idx) => {
              const isRightSide = idx % 2 === 0;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-6 group ${
                    isRightSide
                      ? "md:flex-row md:justify-end"
                      : "md:flex-row-reverse md:justify-start"
                  }`}
                >
                  {/* Card */}
                  <motion.div
                    initial={{ opacity: 0, x: isRightSide ? 50 : -50 }}
                    animate={hasAnimated ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.1 * idx, duration: 0.6 }}
                    className={`w-full max-w-md rounded-3xl px-8 py-7 backdrop-blur-lg border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${
                      theme === "light"
                        ? "bg-white/20 border-white/20 text-gray-900"
                        : "bg-gray-900/30 border-white/10 text-white"
                    } ${isRightSide ? "md:text-right" : "md:text-left"}`}
                  >
                    
                    <h3 className="text-2xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={hasAnimated ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.15 * idx, duration: 0.5 }}
                    className="relative flex-shrink-0 z-10"
                  >
                    <div
                      className={`w-24 h-24 bg-cyan-500 rounded-2xl flex items-center justify-center text-5xl shadow-lg border-4 border-white hover:scale-110 transition-transform duration-300 ${
                        theme === "light"
                          ? "bg-cyan-500"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {feature.icon}
                    </div>

                    
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
};
