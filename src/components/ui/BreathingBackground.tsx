import { useEffect, useState } from "react";

interface BreathingBackgroundProps {
  theme: "light" | "dark";
}

export default function BreathingBackground({ theme }: BreathingBackgroundProps) {
  const [currentTheme, setCurrentTheme] = useState(theme);

  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  // Tailwind gradient classes for light and dark themes
  const baseGradient =
    currentTheme === "light"
      ? "bg-[radial-gradient(circle_at_20%_30%,#a78bfa,transparent_40%),radial-gradient(circle_at_80%_70%,#06b6d4,transparent_40%),radial-gradient(circle_at_50%_50%,#f3f4f6,#e5e7eb)]"
      : "bg-[radial-gradient(circle_at_20%_30%,#7c3aed,transparent_40%),radial-gradient(circle_at_80%_70%,#06b6d4,transparent_40%),radial-gradient(circle_at_50%_50%,#0f172a,#020617)]";

  const blobPurple = currentTheme === "light" ? "bg-purple-300/30" : "bg-purple-500/30";
  const blobCyan = currentTheme === "light" ? "bg-cyan-300/30" : "bg-cyan-400/30";
  const blobPink = currentTheme === "light" ? "bg-pink-300/20" : "bg-pink-500/20";

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className={`absolute inset-0 ${baseGradient}`} />

      {/* Breathing blobs */}
      <div className="absolute inset-0 animate-breathe">
        <div className={`absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] ${blobPurple} rounded-full blur-3xl`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] ${blobCyan} rounded-full blur-3xl`} />
        <div className={`absolute top-[30%] left-[40%] w-[30vw] h-[30vw] ${blobPink} rounded-full blur-3xl`} />
      </div>

      {/* Subtle noise overlay */}
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
