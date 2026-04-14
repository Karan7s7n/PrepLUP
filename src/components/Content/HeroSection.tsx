import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "../ui/ThemeContext";

export const HeroSection = () => {
  const { theme } = useTheme();
  const textColor = theme === "light" ? "text-gray-900" : "text-white";

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="relative overflow-hidden py-32"
    >
    

      <div className="container mx-auto">
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <div className="z-10 flex flex-col items-center gap-6 text-center">

            

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeInOut" }}
              className={`mt-5 text-5xl md:text-6xl font-bold leading-tight ${textColor}`}
            >
              Crack Placements Faster with{" "}
              <span className="bg-linear-to-r from-blue-400 via-violet-400 to-purple-400 text-transparent bg-clip-text">
                Preplup
              </span>
            </motion.h1>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: "easeInOut" }}
              className="flex justify-center gap-4 mt-4"
            >
              <Link
                to="/auth"
                className="px-6 py-3 rounded-xl bg-black text-white font-medium hover:opacity-90 transition"
              >
                Get Started
              </Link>

              
            </motion.div>

            

          </div>
        </div>
      </div>
    </motion.section>
  );
};