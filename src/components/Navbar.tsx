"use client";
<<<<<<< HEAD

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../services/supabase";
import { useTheme } from "../components/ui/ThemeContext";

import {
=======
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../components/ui/ThemeContext";

import {
  FaUserCircle,
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
  FaBars,
  FaHome,
  FaClipboardList,
  FaComments,
  FaSignOutAlt,
<<<<<<< HEAD
  FaFileAlt,
  FaUser,
  FaBrain,
  FaCog,
=======
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
} from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

<<<<<<< HEAD
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

=======
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!user;

<<<<<<< HEAD
  //////////////////////////////////////////////////////
  // LOAD SUPABASE USER + PROFILE
  //////////////////////////////////////////////////////
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data.user;

      setUser(currentUser);

      if (!currentUser) return;

      let { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      setProfile(profileData);
    };

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  //////////////////////////////////////////////////////
  // CLOSE DROPDOWN
  //////////////////////////////////////////////////////
=======
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

<<<<<<< HEAD
  //////////////////////////////////////////////////////
  // LOGOUT
  //////////////////////////////////////////////////////
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  //////////////////////////////////////////////////////
  // THEME
  //////////////////////////////////////////////////////
  const glass =
    theme === "light"
      ? "bg-white/30 border-white/30 text-gray-900"
      : "bg-white/10 border-white/15 text-white";

  const gradient =
    "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500";

  //////////////////////////////////////////////////////
  // NAV ITEMS
  //////////////////////////////////////////////////////
=======
  const glass =
    theme === "light"
      ? "bg-white/20 border-white/20 text-gray-900"
      : "bg-white/10 border-white/20 text-white";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: FaHome },
    { name: "Quiz", path: "/quiz", icon: FaClipboardList },
    { name: "Interview", path: "/interview", icon: FaComments },
  ];

<<<<<<< HEAD
  const sideItems = [
    { name: "Resume", path: "/resume", icon: FaFileAlt },
    { name: "MindEase", path: "/mindease", icon: FaBrain },
    { name: "Profile", path: "/profile", icon: FaUser },
    { name: "Settings", path: "/settings", icon: FaCog },
  ];

  const avatar = profile?.avatar_url;
  const name = profile?.name || user?.email?.split("@")[0] || "User";

=======
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
  return (
    <>
      {/* NAVBAR */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full px-6 z-50">
<<<<<<< HEAD
        <div className={`absolute inset-0 mx-auto max-w-7xl blur-3xl opacity-40 ${gradient}`} />

        <nav
          className={`relative mx-auto max-w-7xl flex items-center justify-between px-6 py-3 rounded-full backdrop-blur-2xl border shadow-xl ${glass}`}
=======
        <div className="absolute inset-0 mx-auto max-w-7xl rounded-full blur-2xl opacity-50 bg-linear-to-r from-blue-500 via-violet-500 to-purple-500"></div>

        <nav
          className={`relative mx-auto max-w-7xl flex items-center justify-between px-6 py-3 rounded-full backdrop-blur-xl border shadow-lg ${glass}`}
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
        >
          {/* LEFT */}
          <div className="flex items-center gap-3">
            {isLoggedIn && (
<<<<<<< HEAD
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-full hover:bg-white/10"
              >
                <FaBars />
              </motion.button>
            )}
          </div>

          {/* LOGO */}
=======
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
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
          <div
            onClick={() => navigate(isLoggedIn ? "/dashboard" : "/")}
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer font-semibold"
          >
<<<<<<< HEAD
            <motion.img
              src="/public/logo.png"
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-8 h-8 rounded-full object-cover"
=======
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-8 h-8 rounded-full bg-linear-to-r from-purple-500 to-blue-500"
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
            />
            <span>Preplup</span>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4 ml-auto">
<<<<<<< HEAD
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
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-full hover:bg-white/10"
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
                      {name?.[0]?.toUpperCase()}
                    </div>
                  )}

                  <span className="text-sm">{name}</span>
=======
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
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
                </motion.div>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
<<<<<<< HEAD
                      className={`absolute right-0 mt-3 w-48 rounded-xl backdrop-blur-xl border shadow-xl overflow-hidden ${
=======
                      className={`absolute right-0 mt-3 w-48 rounded-xl backdrop-blur-xl border shadow-lg ${
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
                        theme === "light"
                          ? "bg-white/90 text-gray-900"
                          : "bg-gray-900/90 text-white"
                      }`}
                    >
                      <button
<<<<<<< HEAD
                        onClick={() => navigate("/profile")}
=======
                        onClick={() => navigate("/dashboard")}
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
                        className="block w-full text-left px-4 py-2 hover:bg-white/10"
                      >
                        Profile
                      </button>

                      <button
                        onClick={handleLogout}
<<<<<<< HEAD
                        className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10"
=======
                        className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-500/20"
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
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
<<<<<<< HEAD
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
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              className="fixed top-6 left-6 h-[calc(100%-3rem)] w-80 z-50"
            >
              <div className={`absolute inset-0 rounded-3xl blur-2xl opacity-40 ${gradient}`} />

              <div className={`relative h-full rounded-3xl backdrop-blur-2xl border shadow-2xl p-6 flex flex-col ${glass}`}>
                
                {/* USER */}
                <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-white/5 border border-white/10">
                  {avatar ? (
                    <img src={avatar} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      {name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{name}</div>
                  </div>
                </div>

                {/* NAV */}
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
                        active
                          ? "bg-white/10 border border-white/20"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <Icon />
                      {item.name}
                    </button>
                  );
                })}

                {/* LOGOUT */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 mt-auto border border-red-500/20 bg-red-500/10 dark:bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl"
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
=======
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
>>>>>>> 4cc666b16c3c5ec0fd122fdc19566e586add59e9
