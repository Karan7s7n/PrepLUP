"use client";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabase";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

export default function InterviewReport() {
  const { id } = useParams();

  const [data, setData] = useState<any[]>([]);
  const [avg, setAvg] = useState(0);
  const [best, setBest] = useState(0);
  const [worst, setWorst] = useState(0);
  const [aiInsight, setAiInsight] = useState("");

  //////////////////////////////////////////////////////
  // ✅ SAFE JSON PARSER (ULTRA FIXED)
  //////////////////////////////////////////////////////
  const safeParse = (input: any) => {
    try {
      if (!input) return null;

      if (typeof input === "object") return input;

      if (typeof input === "string") {
        let cleaned = input
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        const match = cleaned.match(/\{[\s\S]*\}/);
        if (!match) return null;

        cleaned = match[0];

        // Fix bad JSON (VERY IMPORTANT)
        cleaned = cleaned.replace(/(\w+):/g, '"$1":');
        cleaned = cleaned.replace(/'/g, '"');

        return JSON.parse(cleaned);
      }

      return null;
    } catch {
      return null;
    }
  };

  //////////////////////////////////////////////////////
  // ✅ AI CALL (NO openaiService.ts)
  //////////////////////////////////////////////////////
  const getAIInsight = async (prompt: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("ai-interview", {
        body: { prompt },
      });

      if (error) throw error;

      let raw = data?.response || data?.content || data;

      if (typeof raw === "object") {
        return JSON.stringify(raw);
      }

      return String(raw);
    } catch (err) {
      console.error("AI ERROR:", err);
      return "Keep improving consistency and clarity.";
    }
  };

  //////////////////////////////////////////////////////
  // FETCH DATA
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (!id) return;

    const fetchReport = async () => {
      const { data, error } = await supabase
        .from("interview_responses")
        .select("*")
        .eq("session_id", id);

      if (error || !data) {
        console.error("REPORT ERROR:", error);
        return;
      }

      //////////////////////////////////////////////////////
      // ✅ FIXED PARSING
      //////////////////////////////////////////////////////
      const parsed = data.map((d) => {
        const feedbackParsed = safeParse(d.feedback) || {
          score: d.score || 0,
          strengths: "Unable to parse",
          improvements: "Try clearer answers",
        };

        return {
          ...d,
          feedback: feedbackParsed,
          score: d.score || feedbackParsed.score || 0,
        };
      });

      setData(parsed);

      //////////////////////////////////////////////////////
      // ✅ ANALYTICS
      //////////////////////////////////////////////////////
      const scores = parsed.map((r) => r.score || 0);

      const avgScore =
        scores.reduce((a, b) => a + b, 0) / (scores.length || 1);

      setAvg(Math.round(avgScore));
      setBest(scores.length ? Math.max(...scores) : 0);
      setWorst(scores.length ? Math.min(...scores) : 0);

      //////////////////////////////////////////////////////
      // 🤖 AI INSIGHT (DIRECT CALL)
      //////////////////////////////////////////////////////
      const insight = await getAIInsight(`
Analyze this interview session:

${JSON.stringify(parsed)}

Give:
- 1 line summary
- 2 improvements

Plain text only.
      `);

      setAiInsight(insight);
    };

    fetchReport();
  }, [id]);

  //////////////////////////////////////////////////////
  // CHART DATA
  //////////////////////////////////////////////////////
  const chartData = data.map((d, i) => ({
    name: `Q${i + 1}`,
    score: d.score,
  }));

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-bold">Interview Report</h1>
          <p className="opacity-70">Session ID: {id}</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="p-6 rounded-xl border">
            <p className="text-sm opacity-70">Average</p>
            <p className="text-3xl font-bold">{avg}/10</p>
          </div>

          <div className="p-6 rounded-xl border">
            <p className="text-sm opacity-70">Best</p>
            <p className="text-3xl font-bold text-green-500">
              {best}/10
            </p>
          </div>

          <div className="p-6 rounded-xl border">
            <p className="text-sm opacity-70">Lowest</p>
            <p className="text-3xl font-bold text-red-500">
              {worst}/10
            </p>
          </div>

        </div>

        {/* LINE CHART */}
        <div className="p-6 rounded-xl border">
          <h3 className="mb-4 font-semibold">Score Trend</h3>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* BAR CHART */}
        <div className="p-6 rounded-xl border">
          <h3 className="mb-4 font-semibold">Distribution</h3>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI INSIGHT */}
        <div className="p-6 rounded-xl border">
          <h3 className="mb-2 font-semibold">AI Insight</h3>

          <p className="opacity-80 whitespace-pre-line">
            {aiInsight}
          </p>
        </div>

        {/* QUESTIONS */}
        <div className="space-y-4">
          {data.map((r, i) => (
            <div key={i} className="p-5 rounded-xl border">
              <p className="text-sm opacity-60">
                Question {i + 1}
              </p>

              <p className="font-semibold mt-1">
                Score: {r.score}/10
              </p>

              <p className="mt-2">
                <b>Strengths:</b>{" "}
                {r.feedback?.strengths || "N/A"}
              </p>

              <p>
                <b>Improvements:</b>{" "}
                {r.feedback?.improvements || "N/A"}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
