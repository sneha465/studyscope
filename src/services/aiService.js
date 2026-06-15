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

export const aiService = {
  /**
   * Generates a daily quiz with exactly 10 multiple-choice questions.
   */
  generateDailyQuiz: async (topic) => {
    const prompt = `
Create a daily knowledge quiz on the topic: "${topic}".

### REQUIREMENTS:
1. Generate EXACTLY 10 multiple-choice questions.
2. Each question MUST have:
   - "question": clear question text (string)
   - "options": array of EXACTLY 4 answer options (strings)
   - "correct_answer": must exactly match one of the options (string)
   - "explanation": 2-3 sentence explanation of why the correct answer is right (string)
   - "topic": a specific sub-topic tag within "${topic}" (string)
   - "difficulty": one of "Beginner", "Intermediate", or "Advanced"
3. Mix difficulties: roughly 3 Beginner, 4 Intermediate, 3 Advanced.
4. Cover diverse sub-topics within "${topic}".
5. All questions must be factually accurate and educational.

### RESPONSE FORMAT (JSON only):
{
  "topic": "${topic}",
  "questions": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "correct_answer": "",
      "explanation": "",
      "topic": "",
      "difficulty": "Beginner|Intermediate|Advanced"
    }
  ]
}

Return ONLY valid JSON with exactly 10 questions in the questions array.
`;

    if (!API_KEY) {
      throw new Error("Missing OpenRouter API Key. Add VITE_OPENROUTER_API_KEY to your .env file.");
    }

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324",
        max_tokens: 2000,
        messages: [
          {
            role: "system",
            content:
              "You are an expert quiz creator. Output ONLY valid JSON with exactly 10 quiz questions.",
          },
          { role: "user", content: prompt },
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
    const content = data.choices[0].message.content;

   

    const cleanContent = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

    const parsed = JSON.parse(cleanContent);

    if (!parsed.questions || parsed.questions.length !== 10) {
      throw new Error("AI did not return exactly 10 questions. Please try again.");
    }

    parsed.questions = parsed.questions.map((q, i) => ({
      id: `q${i}`,
      question: q.question,
      options: q.options?.slice(0, 4) || [],
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      topic: q.topic || topic,
      difficulty: ["Beginner", "Intermediate", "Advanced"].includes(q.difficulty)
        ? q.difficulty
        : "Intermediate",
    }));

    return parsed;
  },
};
