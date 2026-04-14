
"use client";

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuthStore } from "../store/authStore";
import { evaluateAnswer } from "../services/aiService";
import { FiMic } from "react-icons/fi";

//////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////
interface Question {
  id: string;
  question: string;
  example_answer?: string;
  role?: string;
}

interface Feedback {
  score: number;
  strengths: string;
  improvements: string;
}

//////////////////////////////////////////////////////
// MAIN
//////////////////////////////////////////////////////
export default function Interview() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  //////////////////////////////////////////////////////
  // CONFIG
  //////////////////////////////////////////////////////
  const roles = [
    "frontend","backend","React Engineer","DevOps Engineer",
    "AI & ML","SAP Engineer","Numerical Ability",
    "Logical Reasoning","Verbal Ability","general","mixed"
  ];

  const [selectedRole, setSelectedRole] = useState("frontend");
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedTime, setSelectedTime] = useState(300);

  //////////////////////////////////////////////////////
  // STATES
  //////////////////////////////////////////////////////
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const [timeLeft, setTimeLeft] = useState(300);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  //////////////////////////////////////////////////////
  // START INTERVIEW
  //////////////////////////////////////////////////////
  const startInterview = async () => {
    let query = supabase
      .from("interview_questions")
      .select("id, question, example_answer, role");

    if (selectedRole !== "mixed") {
      query = query.eq("role", selectedRole);
    }

    const { data } = await query;

    if (!data || data.length === 0) return;

    const selected = [...data]
      .sort(() => 0.5 - Math.random())
      .slice(0, questionCount);

    setQuestions(selected);
    setStarted(true);
    setTimeLeft(selectedTime);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
  };

  //////////////////////////////////////////////////////
  // TIMER
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (started && timeLeft <= 0) handleFinish();
  }, [timeLeft]);

  //////////////////////////////////////////////////////
  // SUBMIT
  //////////////////////////////////////////////////////
  const handleSubmit = () => {
    if (!input.trim()) return;

    const result = evaluateAnswer(input);

    setFeedback(result);

    setAnswers((prev) => ({
      ...prev,
      [questions[currentIndex].id]: {
        answer: input,
        feedback: result,
      },
    }));
  };

  //////////////////////////////////////////////////////
  // NEXT
  //////////////////////////////////////////////////////
  const handleNext = () => {
    setInput("");
    setFeedback(null);

    if (currentIndex === questions.length - 1) {
      handleFinish();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  //////////////////////////////////////////////////////
  // FINISH
  //////////////////////////////////////////////////////
  const handleFinish = async () => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (!user?.id) return;

    const { data: session } = await supabase
      .from("interview_sessions")
      .insert({ user_id: user.id, role: selectedRole })
      .select()
      .single();

    if (!session) return;

    const responses = Object.entries(answers).map(([qid, val]: any) => ({
      session_id: session.id,
      question_id: qid,
      answer: val.answer,
      feedback: JSON.stringify(val.feedback),
      score: val.feedback.score,
      user_id: user.id,
    }));

    await supabase.from("interview_responses").insert(responses);

    // Reset
    setStarted(false);
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setInput("");
    setFeedback(null);

    navigate("/interview");
  };

  //////////////////////////////////////////////////////
  // SELECTION SCREEN
  //////////////////////////////////////////////////////
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-10">

        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold">AI Interview</h1>

          <div className="flex flex-wrap gap-2 justify-center">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1 rounded-full border ${
                  selectedRole === role ? "bg-blue-600 text-white" : "opacity-70"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <div className="flex gap-6 justify-center">
            <div className="flex gap-2">
              {[3,5,10].map(q => (
                <button
                  key={q}
                  onClick={() => setQuestionCount(q)}
                  className={`px-4 py-1 rounded-full border ${
                    questionCount === q ? "bg-purple-600 text-white" : ""
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              {[180,300,600].map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`px-4 py-1 rounded-full border ${
                    selectedTime === t ? "bg-blue-600 text-white" : ""
                  }`}
                >
                  {t === 180 ? "3m" : t === 300 ? "5m" : "10m"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startInterview}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl flex gap-2 mx-auto"
          >
            <FiMic /> Start Interview
          </button>
        </div>
      </div>
    );
  }

  //////////////////////////////////////////////////////
  // INTERVIEW UI
  //////////////////////////////////////////////////////
  const q = questions[currentIndex];

  return (
    <div className="min-h-screen flex justify-center p-6">
      <div className="w-full max-w-3xl space-y-4">

        <div className="w-full h-2 bg-gray-300 rounded">
          <div
            className="h-2 bg-blue-500"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`
            }}
          />
        </div>

        <div className="flex justify-between text-sm opacity-70">
          <span>{selectedRole} • Q {currentIndex + 1}/{questions.length}</span>
          <span>{timeLeft}s</span>
        </div>

        <h2 className="text-xl font-semibold">{q.question}</h2>

        <textarea
          className="w-full p-4 border rounded-xl"
          rows={6}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="flex justify-between">
          <button
            onClick={handleNext}
            disabled={!feedback}
            className="px-5 py-2 border rounded disabled:opacity-40"
          >
            Next
          </button>

          {!feedback ? (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded"
            >
              Submit
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2 bg-green-600 text-white rounded"
            >
              Finish
            </button>
          )}
        </div>

        {feedback && (
          <div className="p-4 border rounded-xl space-y-3">
            <p className="text-green-500">Score: {feedback.score}/10</p>
            <p><b>Strengths:</b> {feedback.strengths}</p>
            <p><b>Improvements:</b> {feedback.improvements}</p>

            {q.example_answer && (
              <div className="mt-3 p-3 bg-gray-100 rounded">
                <p className="font-semibold">Example Answer:</p>
                <p className="text-sm">{q.example_answer}</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

