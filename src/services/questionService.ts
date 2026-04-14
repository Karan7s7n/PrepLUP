import { supabase } from "./supabase";

type Params = {
  difficulty: string;
  limit: number;
};

export async function getQuestions({ difficulty, limit }: Params) {
  try {
    let query = supabase
      .from("questions")
      .select("*"); // 🔥 NO CATEGORY FILTER

    ////////////////////////////////////////////////////
    // 🎯 DIFFICULTY FILTER (optional)
    ////////////////////////////////////////////////////
    if (difficulty !== "mixed") {
      query = query.eq("difficulty", difficulty);
    }

    ////////////////////////////////////////////////////
    // 📊 FETCH EXTRA FOR RANDOMNESS
    ////////////////////////////////////////////////////
    const { data, error } = await query.limit(limit * 3);

    if (error) {
      console.error("Fetch error:", error.message);
      return [];
    }

    if (!data || data.length === 0) return [];

    ////////////////////////////////////////////////////
    // 🔀 FISHER-YATES SHUFFLE
    ////////////////////////////////////////////////////
    const shuffled = [...data];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    ////////////////////////////////////////////////////
    // 🎯 TAKE REQUIRED COUNT
    ////////////////////////////////////////////////////
    const selected = shuffled.slice(0, Math.min(limit, shuffled.length));

    ////////////////////////////////////////////////////
    // ✅ NORMALIZE OPTIONS
    ////////////////////////////////////////////////////
    return selected.map((q) => {
      let parsedOptions = q.options;

      try {
        if (typeof q.options === "string") {
          parsedOptions = JSON.parse(q.options);
        }
      } catch {
        parsedOptions = [];
      }

      return {
        ...q,
        options: parsedOptions || [],
      };
    });

  } catch (err) {
    console.error("Service error:", err);
    return [];
  }
}
