"use client";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../components/ui/ThemeContext";

import {
  FaUserCircle,
  FaBars,
  FaHome,
  FaClipboardList,
  FaComments,
  FaSignOutAlt,
} from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!user;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const glass =
    theme === "light"
      ? "bg-white/20 border-white/20 text-gray-900"
      : "bg-white/10 border-white/20 text-white";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: FaHome },
    { name: "Quiz", path: "/quiz", icon: FaClipboardList },
    { name: "Interview", path: "/interview", icon: FaComments },
  ];

  return (
    <>
      {/* NAVBAR */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full px-6 z-50">
        <div className="absolute inset-0 mx-auto max-w-7xl rounded-full blur-2xl opacity-50 bg-linear-to-r from-blue-500 via-violet-500 to-purple-500"></div>

        <nav
          className={`relative mx-auto max-w-7xl flex items-center justify-between px-6 py-3 rounded-full backdrop-blur-xl border shadow-lg ${glass}`}
        >
          {/* LEFT */}
          <div className="flex items-center gap-3">
            {isLoggedIn && (
              <motion.div
                whileTap={{ scale: 0.85 }}
                onClick={() => setSidebarOpen(true)}
                className="cursor-pointer p-2 rounded-full hover:bg-white/10"
              >
                <FaBars />
              </motion.div>
            )}
          </div>

          {/* CENTER LOGO */}
          <div
            onClick={() => navigate(isLoggedIn ? "/dashboard" : "/")}
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer font-semibold"
          >
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-8 h-8 rounded-full bg-linear-to-r from-purple-500 to-blue-500"
            />
            <span>Preplup</span>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4 ml-auto">
            {!isLoggedIn && (
              <>
                <div className="hidden md:flex gap-8 text-sm">
                  <Link to="/">Home</Link>
                  <Link to="/features">Features</Link>
                  <Link to="/contact">Contact</Link>
                </div>

                <Link
                  to="/auth"
                  className="px-5 py-2 rounded-full bg-white text-black text-sm font-medium hover:scale-105 transition"
                >
                  Get Started
                </Link>
              </>
            )}

            {isLoggedIn && (
              <div ref={dropdownRef} className="relative">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-full hover:bg-white/10"
                >
                  <FaUserCircle />
                  <span>{user?.name || "User"}</span>
                </motion.div>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      className={`absolute right-0 mt-3 w-48 rounded-xl backdrop-blur-xl border shadow-lg ${
                        theme === "light"
                          ? "bg-white/90 text-gray-900"
                          : "bg-gray-900/90 text-white"
                      }`}
                    >
                      <button
                        onClick={() => navigate("/dashboard")}
                        className="block w-full text-left px-4 py-2 hover:bg-white/10"
                      >
                        Profile
                      </button>

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-500/20"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* SIDEBAR */}
      {/* SIDEBAR */}
<AnimatePresence>
  {sidebarOpen && isLoggedIn && (
    <>
      {/* BACKDROP */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setSidebarOpen(false)}
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
      />

      {/* PANEL */}
      <motion.div
        initial={{ x: -320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -320, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="fixed top-6 left-6 h-[calc(100%-3rem)] w-80 z-50"
      >
        {/* Glow (same as navbar) */}
        <div className="absolute inset-0 rounded-3xl blur-2xl opacity-40 bg-linear-to-r from-blue-500 via-violet-500 to-purple-500"></div>

        {/* Glass Panel */}
        <div
          className={`relative h-full rounded-3xl backdrop-blur-xl border shadow-2xl p-6 flex flex-col ${glass}`}
        >
          {/* TOP BAR (like navbar) */}
          <div className="flex items-center justify-between mb-6">
            {/* Logo */}
            <div className="flex items-center gap-2 font-semibold">
              <div className="w-8 h-8 rounded-full bg-linear-to-r from-purple-500 to-blue-500"></div>
              <span>Preplup</span>
            </div>

            {/* CLOSE BUTTON */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-full hover:bg-white/10"
            >
              ✕
            </motion.button>
          </div>

          {/* NAV ITEMS */}
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;

              return (
                <motion.button
                  key={item.name}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    active
                      ? "bg-white/10 border border-white/20"
                      : "hover:bg-white/5"
                  }`}
                >
                  <Icon />
                  {item.name}
                </motion.button>
              );
            })}

            {/* LOGOUT */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 mt-6 text-red-400 hover:bg-red-500/10 rounded-xl"
            >
              <FaSignOutAlt />
              Logout
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
    </>
  );
}
