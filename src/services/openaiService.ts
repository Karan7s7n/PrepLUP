import { supabase } from "./supabase";

interface AIResult {
  score: number;
  strengths: string;
  improvements: string;
}

export async function getAIResponse(prompt: string): Promise<AIResult> {
  try {
    const { data, error } = await supabase.functions.invoke("ai-interview", {
      body: { prompt },
    });

    if (error) {
      console.error("AI FUNCTION ERROR:", error);
      throw error;
    }

    console.log("AI RAW RESPONSE:", data);

    ////////////////////////////////////////////////////
    // 🔥 EXTRACT TEXT SAFELY
    ////////////////////////////////////////////////////
    let raw = data?.response || data?.content || data;

    if (typeof raw === "object") {
      // Already parsed
      return raw;
    }

    ////////////////////////////////////////////////////
    // 🔥 CLEAN BAD JSON (fix quotes issue)
    ////////////////////////////////////////////////////
    let cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Fix unquoted keys (score: → "score":)
    cleaned = cleaned.replace(/(\w+):/g, '"$1":');

    // Fix single quotes → double quotes
    cleaned = cleaned.replace(/'/g, '"');

    ////////////////////////////////////////////////////
    // 🔥 PARSE JSON
    ////////////////////////////////////////////////////
    const parsed = JSON.parse(cleaned);

    return {
      score: parsed.score ?? 5,
      strengths: parsed.strengths ?? "Decent answer",
      improvements: parsed.improvements ?? "Improve clarity",
    };

  } catch (err) {
    console.error("AI PARSE ERROR:", err);

    ////////////////////////////////////////////////////
    // 🚑 FALLBACK (never crash UI)
    ////////////////////////////////////////////////////
    return {
      score: 5,
      strengths: "Could not analyze properly",
      improvements: "Try giving more structured answer",
    };
  }
}
