import { Link } from "react-router-dom";
import { useTheme } from "../components/ui/ThemeContext";

export default function Footer() {
  const { theme, toggleTheme } = useTheme();

  const textBase = theme === "light" ? "text-gray-900" : "text-white";
  const textSecondary = theme === "light" ? "text-gray-700" : "text-white/70";
  const textHover = theme === "light" ? "hover:text-gray-900" : "hover:text-white";

  return (
    <footer className="relative mt-32 mb-10 flex justify-center">
      {/* Gradient Glow */}
      <div className="absolute inset-0 mx-auto max-w-6xl rounded-3xl blur-2xl opacity-50 bg-linear-to-r from-blue-500 via-violet-500 to-purple-500"></div>

      {/* Glass Container */}
      <div className="relative w-full max-w-6xl px-8 py-10 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between gap-10">
          {/* Brand */}
          <div>
            <h2 className={`text-xl font-semibold ${textBase}`}>Preplup</h2>
            <p className={`mt-2 text-sm ${textSecondary} max-w-xs`}>
              Platform to help you crack placements faster with resume builder, interview prep, and personalized quizzes.
              AI-powered platform to help you crack placements faster with resume feedback, interview prep, and skill tracking.
            </p>
          </div>

          {/* Links */}
          <div className={`flex gap-12 text-sm ${textSecondary}`}>
            <div className="flex flex-col gap-2">
              <Link to="/features" className={`${textHover} transition`}>Features</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className={`font-medium ${textBase}`}>Product</span>
              <Link to="/features" className={`${textHover} transition`}>Features</Link>
              <Link to="/pricing" className={`${textHover} transition`}>Pricing</Link>
              <Link to="/demo" className={`${textHover} transition`}>Demo</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className={`font-medium ${textBase}`}>Company</span>
              <Link to="/about" className={`${textHover} transition`}>About</Link>
              <Link to="/contact" className={`${textHover} transition`}>Contact</Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={`my-8 h-px ${theme === "light" ? "bg-gray-300/20" : "bg-white/10"}`}></div>

        {/* Bottom */}
        <div className={`flex flex-col md:flex-row justify-between items-center text-sm gap-4 ${textSecondary}`}>
          <p>© {new Date().getFullYear()} Preplup. All rights reserved.</p>

          <div className="flex gap-4 items-center">
            <Link to="/privacy" className={`${textHover} transition`}>Privacy</Link>
            <Link to="/terms" className={`${textHover} transition`}>Terms</Link>

            <button
              onClick={toggleTheme}
              className={`ml-4 px-3 py-1 rounded-md bg-white/20 ${theme === "light" ? "text-gray-900 hover:bg-gray-200/30" : "text-white hover:bg-white/30"} transition`}
            >
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
