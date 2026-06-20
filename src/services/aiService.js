import { GoogleGenerativeAI } from "@google/generative-ai";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

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



  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt);

    let content = result.response.text();

    content = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    console.log("RAW AI RESPONSE:");
    console.log(content);

    return JSON.parse(content);
  } catch (error) {
    console.error("FAILED JSON:");
    console.log(error);

    throw new Error(
      "AI returned invalid JSON. Please try generating again."
    );
  }
}









function chunkText(text, chunkSize = 3000) {
  const chunks = [];

  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  return chunks;
}

function selectChunksEvenly(chunks, count) {
  if (chunks.length <= count) {
    return chunks;
  }

  const selected = [];

  for (let i = 0; i < count; i++) {
    const index = Math.round(
      (i * (chunks.length - 1)) /
      (count - 1)
    );

    selected.push(chunks[index]);
  }

  return selected;
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

    if (!pdfText || pdfText.trim().length < 200) {
      throw new Error(
        "Couldn't extract enough text from this PDF."
      );
    }

    const chunks = chunkText(pdfText, 1500);

    const selectedChunks = selectChunksEvenly(
      chunks,
      Math.min(chunks.length, questionCount)
    );

    const baseQuestions = Math.floor(
      questionCount / selectedChunks.length
    );

    let extraQuestions =
      questionCount % selectedChunks.length;

    let allQuestions = [];
    for (const chunk of selectedChunks) {

      const questionsForChunk =
        baseQuestions +
        (extraQuestions > 0 ? 1 : 0);

      if (extraQuestions > 0) {
        extraQuestions--;
      }

      const prompt = `
Generate EXACTLY ${questionsForChunk} multiple choice questions.

Difficulty: ${difficulty}

RULES:
- Use ONLY information from the provided material.
- Each question must have exactly 4 options.
- correct_answer must exactly match one option.
- explanation must be 1-2 sentences.
- topic should be a short subtopic.
- difficulty should be Beginner, Intermediate, or Advanced.

Study Material:

${chunk}

Return ONLY valid JSON:

{
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

      try {
        const parsed = await callOpenRouter(
          prompt,
          250
        );

        if (parsed.questions) {
          allQuestions.push(...parsed.questions);
        }

      } catch (error) {
        console.error("Chunk failed:", error);
      }
    }
    allQuestions = allQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, questionCount);

    const validQuestions = allQuestions.filter(
      (q) =>
        q.question &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.correct_answer &&
        q.explanation
    );

    if (validQuestions.length < questionCount) {
      throw new Error(
        `Only generated ${validQuestions.length}/${questionCount} valid questions. Try again.`
      );
    }

    return {
      topic: "PDF Quiz",
      questions: validQuestions.map((q, i) => ({
        id: `pdf_q${i}`,
        question: q.question,
        options: q.options.slice(0, 4),
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        topic: q.topic || "PDF Quiz",
        difficulty: q.difficulty || "Intermediate",
      })),
    };
  },
};