// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();

    // @ts-ignore
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

    const prompt = `
You are a placement assistant.

User stats:
- Tests: ${context?.tests}
- Accuracy: ${context?.accuracy}
- Avg Points: ${context?.avgPoints}

User question: ${message}

Give short actionable advice.
`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // fast + free
        messages: [
          { role: "system", content: "You are a helpful placement assistant." },
          { role: "user", content: prompt },
        ],
        max_tokens: 300,
      }),
    });

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      data?.error?.message ||
      "No response from AI";

    return new Response(JSON.stringify({ reply }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ reply: "Server error" }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});