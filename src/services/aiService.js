const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export const aiService = {
  /**
   * Generates a detailed structured study plan based on a topic and duration.
   * Now with category awareness, trusted sources, and reliable roadmap generation.
   */
  generateStudyPlan: async (topic, duration, mode = "standard") => {
    let prompt = "";

    if (mode === "coach") {
      prompt = `
      Create a comprehensive, highly structured, and interactive learning plan for the topic: "${topic}".
      The total duration is "${duration}".

      ### INSTRUCTIONS:
      1. ROADMAP LIMIT: Generate exactly 2 or 3 learning phases to cover this topic at a high level.
      2. TARGET AUDIENCE: The user wants to learn directly inside the platform without leaving. Ensure explanation quality is extremely high, clear, and comprehensive.
      3. REQUIRED SCHEMA:
         - Each phase must contain:
           - "phase_title": A descriptive title.
           - "duration_minutes": Duration of this phase as a number (e.g. 30).
           - "estimated_difficulty": Difficulty level (either "Beginner", "Intermediate", or "Advanced").
           - "concepts": 2-4 key keywords/terms explored.
           - "concept_overview": A comprehensive textual explanation explaining what the topic is, why it matters, and its core operational ideas (at least 3-4 sentences, high educational quality).
           - "key_takeaways": 3 to 5 critical bullet points summarizing what was covered.
           - "common_mistakes": 2 to 4 typical misconceptions, bugs, errors, or common implementation issues.
           - "practice_tasks": An array of objects, where each object represents a practical exercise to reinforce learning. Each object must have "title" (string) and "description" (string).
           - "knowledge_check": An array of 3 to 5 multiple-choice questions testing their understanding. Each question must have:
             - "question" (string)
             - "options" (array of strings, exactly 3-4 options)
             - "correct_answer" (string, must exactly match one of the options)
             - "explanation" (string, a clear paragraph explaining why that answer is correct and others are not, to be shown after submission)
           - "optional_references": An empty array [] (do not include links by default).

      ### RESPONSE FORMAT:
      {
        "title": "${topic}",
        "total_duration": "${duration}",
        "category": "Technical|Academic|Skill-based",
        "isRefactoredPlan": true,
        "phases": [
          {
            "phase_title": "",
            "duration_minutes": 0,
            "estimated_difficulty": "",
            "concepts": [],
            "concept_overview": "",
            "key_takeaways": [],
            "common_mistakes": [],
            "practice_tasks": [
              { "title": "", "description": "" }
            ],
            "knowledge_check": [
              { "question": "", "options": [], "correct_answer": "", "explanation": "" }
            ],
            "optional_references": []
          }
        ]
      }
      Return ONLY valid JSON.
      `;
    } else {
      prompt = `
      Create a comprehensive, reliable, and context-aware learning plan for the topic: "${topic}".
      The total duration is "${duration}".

      ### INSTRUCTIONS:
      1. ROADMAP COMPLETENESS: Always return 4 to 6 learning phases that form a logical progression.
      2. TOPIC CLASSIFICATION: Classify the topic into one of these categories: Technical, Academic, or Skill-based.
      3. CATEGORY-AWARE RESOURCES:
         - Technical: Prioritize official developer documentation (e.g., react.dev, docs.python.org, developer.mozilla.org, learn.microsoft.com, typescriptlang.org/docs), structured learning paths (freecodecamp.org, web.dev, geeksforgeeks.org), and code repos/problems (github.com, leetcode.com).
         - Academic: Prioritize reputable lecture videos, university repositories, structured articles, or books (coursera.org, edx.org, khanacademy.org, wikipedia.org).
         - Skill-based: Prioritize reputable case studies, tutorials, practical exercises, and official design guidelines (figma.com, behance.net, web.dev).
      4. TRUSTED SOURCES & LINK RELIABILITY:
         - Always prioritize official, high-quality, and authoritative documentation domains matching the specific subject first.
         - Allowed domains: developer.mozilla.org, freecodecamp.org, geeksforgeeks.org, leetcode.com, github.com, wikipedia.org, coursera.org, edx.org, khanacademy.org, react.dev, nextjs.org, python.org, learn.microsoft.com, typescriptlang.org, go.dev.
         - If a direct authoritative URL is not known with absolute confidence, return a specific search query URL fallback.
           Search URL format: https://youtube.com/results?search_query=... or https://www.google.com/search?q=...
      5. METADATA: Each resource must have title, type, url, and difficulty_level.

      ### RESPONSE FORMAT:
      {
        "title": "${topic}",
        "total_duration": "${duration}",
        "category": "",
        "phases": [
          {
            "phase_title": "",
            "duration_minutes": 0,
            "concepts": [],
            "resources": [
              { "title": "", "type": "video|article|repo|documentation|practice|search", "url": "", "difficulty_level": "Beginner|Intermediate|Advanced" }
            ],
            "practice_tasks": []
          }
        ]
      }
      Return ONLY valid JSON.
      `;
    }

    try {
      if (!API_KEY) {
        throw new Error("Missing OpenRouter API Key.");
      }

      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "StudyScope"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct",
          messages: [
            { role: "system", content: "You are an expert AI tutor. You output ONLY valid JSON plans." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "AI service error");
      }

      const data = await response.json();
      const text = data.choices[0].message.content;
      return JSON.parse(text);
    } catch (error) {
      console.error("AI Generation Error:", error);
      throw new Error(error.message || "Failed to generate study plan.");
    }
  },

  /**
   * Generates a summary after a study session
   */
  generateSessionSummary: async (topic, tasksCompleted) => {
    const prompt = `Summarize a study session about "${topic}". Tasks: ${tasksCompleted.join(", ")}. Format: JSON with concepts, summary, nextStep.`;

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        }),
      });

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error("AI Summary Error:", error);
      throw new Error("Failed to generate session summary.");
    }
  }
};
