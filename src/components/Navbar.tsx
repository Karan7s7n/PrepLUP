"use client";

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../services/supabase";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../components/ui/ThemeContext";

import {
  FaBars,
  FaHome,
  FaClipboardList,
  FaComments,
  FaSignOutAlt,
  FaFileAlt,
  FaUser,
  FaBrain,
  FaCog,
} from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const authUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [profile, setProfile] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!authUser;

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data.user;
      if (!currentUser) return;

      let { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      setProfile(profileData);
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    await supabase.auth.signOut();
    navigate("/");
  };

  const glass =
    theme === "light"
      ? "bg-white/20 border-white/20 text-gray-900"
      : "bg-white/10 border-white/20 text-white";

  const gradient =
    "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500";

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: FaHome },
    { name: "Quiz", path: "/quiz", icon: FaClipboardList },
    { name: "Interview", path: "/interview", icon: FaComments },
  ];

  const sideItems = [
    { name: "Resume", path: "/resume", icon: FaFileAlt },
    { name: "MindEase", path: "/mindease", icon: FaBrain },
    { name: "Profile", path: "/profile", icon: FaUser },
    { name: "Settings", path: "/settings", icon: FaCog },
  ];

  const avatar = profile?.avatar_url;
  const name = profile?.name || authUser?.email?.split("@")[0] || "User";

  return (
    <>
      <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full px-6 z-50">
        <div className={`absolute inset-0 mx-auto max-w-7xl blur-3xl opacity-40 ${gradient}`} />

        <nav
          className={`relative mx-auto max-w-7xl flex items-center justify-between px-6 py-3 rounded-full backdrop-blur-xl border shadow-lg ${glass}`}
        >
          <div className="flex items-center gap-3">
            {isLoggedIn && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-full hover:bg-white/10"
              >
                <FaBars />
              </motion.button>
            )}
          </div>

          <div
            onClick={() => navigate(isLoggedIn ? "/dashboard" : "/")}
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer font-semibold"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
            <span>Preplup</span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {!isLoggedIn ? (
              <Link
                to="/auth"
                className={`px-5 py-2 rounded-full text-sm font-medium text-white ${gradient}`}
              >
                Get Started
              </Link>
            ) : (
              <div ref={dropdownRef} className="relative">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-full hover:bg-white/10"
                >
                  {avatar ? (
                    <img src={avatar} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
                      {name[0]?.toUpperCase()}
                    </div>
                  )}

                  <span>{name}</span>
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
                        onClick={() => navigate("/profile")}
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

      <AnimatePresence>
        {sidebarOpen && isLoggedIn && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              className="fixed top-6 left-6 h-[calc(100%-3rem)] w-80 z-50"
            >
              <div className={`absolute inset-0 rounded-3xl blur-2xl opacity-40 ${gradient}`} />

              <div className={`relative h-full rounded-3xl backdrop-blur-xl border shadow-2xl p-6 flex flex-col ${glass}`}>
                <div className="flex items-center gap-3 mb-6">
                  {avatar ? (
                    <img src={avatar} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      {name[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>{name}</div>
                </div>

                {[...navItems, ...sideItems].map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;

                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        navigate(item.path);
                        setSidebarOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                        active ? "bg-white/10 border border-white/20" : "hover:bg-white/5"
                      }`}
                    >
                      <Icon />
                      {item.name}
                    </button>
                  );
                })}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 mt-auto text-red-400 hover:bg-red-500/10 rounded-xl"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}