const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const DEFAULT_TOPICS = [
  "General Knowledge",
  "Science",
  "Technology",
  "History",
  "Mathematics",
];

export { DEFAULT_TOPICS };

async function callOpenRouter(prompt, maxTokens = 3000) {
  if (!API_KEY) {
    throw new Error(
      "Missing OpenRouter API Key. Add VITE_OPENROUTER_API_KEY to your .env file."
    );
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      max_tokens: maxTokens,
      messages: [
        {
          role: "system",
          content:
            "You are an expert quiz creator. Return ONLY valid JSON. Do not wrap JSON in markdown.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.error?.message ||
      JSON.stringify(errorData) ||
      "AI service error"
    );
  }

  const data = await response.json();

  let content = data.choices?.[0]?.message?.content || "";

  content = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();



  return JSON.parse(content);
}

export const aiService = {
  /**
   * DAILY QUIZ
   */
  generateDailyQuiz: async (topic) => {
    const prompt = `
Create a daily knowledge quiz on the topic: "${topic}".

REQUIREMENTS:
1. Generate EXACTLY 10 multiple-choice questions.
2. Each question must contain:
   - question
   - options (4)
   - correct_answer
   - explanation
   - topic
   - difficulty
3. Mix difficulties:
   - 3 Beginner
   - 4 Intermediate
   - 3 Advanced

Return ONLY valid JSON:

{
  "topic": "${topic}",
  "questions": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "correct_answer": "",
      "explanation": "",
      "topic": "",
      "difficulty": ""
    }
  ]
}
`;

    const parsed = await callOpenRouter(prompt, 2000);

    if (!parsed.questions || parsed.questions.length !== 10) {
      throw new Error(
        "AI did not return exactly 10 questions. Please try again."
      );
    }

    parsed.questions = parsed.questions.map((q, i) => ({
      id: `q${i}`,
      question: q.question,
      options: q.options?.slice(0, 4) || [],
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      topic: q.topic || topic,
      difficulty: ["Beginner", "Intermediate", "Advanced"].includes(
        q.difficulty
      )
        ? q.difficulty
        : "Intermediate",
    }));

    return parsed;
  },

  /**
   * PDF QUIZ
   */
  generatePdfQuiz: async (
    pdfText,
    questionCount = 10,
    difficulty = "Mixed"
  ) => {
    const trimmedText = pdfText.slice(0, 12000);

    const prompt = `
You are creating a quiz from study material.

Generate EXACTLY ${questionCount} multiple choice questions.

Difficulty: ${difficulty}

RULES:
- Use ONLY information from the provided material.
- Each question must have exactly 4 options.
- correct_answer must exactly match one option.
- explanation must be 1-3 sentences.
- topic should be a short subtopic.
- difficulty should be Beginner, Intermediate, or Advanced.

Study Material:

${trimmedText}

Return ONLY valid JSON:

{
  "topic": "PDF Quiz",
  "questions": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "correct_answer": "",
      "explanation": "",
      "topic": "",
      "difficulty": ""
    }
  ]
}
`;

    const parsed = await callOpenRouter(prompt, 4000);

    if (!parsed.questions) {
      throw new Error("No questions returned.");
    }

    parsed.questions = parsed.questions.map((q, i) => ({
      id: `pdf_q${i}`,
      question: q.question,
      options: q.options?.slice(0, 4) || [],
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      topic: q.topic || "PDF Quiz",
      difficulty: q.difficulty || "Intermediate",
    }));

    return parsed;
  },
};