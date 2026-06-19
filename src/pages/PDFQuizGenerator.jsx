import { useAuth } from "../context/AuthContext";
import { quizService } from "../services/quizService";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { extractPdfText } from "../utils/pdfExtractor";
import { FileText, Loader2, CheckCircle2 } from "lucide-react";
import { aiService } from "../services/aiService";
import { QuizResults } from "../components/quiz/QuizResults";

export function PDFQuizGenerator() {
  const [file, setFile] = useState(null);
  const [pdfText, setPdfText] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const [questionCount, setQuestionCount] = useState(10);
  const [customCount, setCustomCount] = useState("");

  const [difficulty, setDifficulty] = useState("Mixed");

  const [generating, setGenerating] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const [attempt, setAttempt] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFile = async (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    try {
      setLoading(true);
      setFile(selectedFile);

      const extracted = await extractPdfText(selectedFile);



      setPdfText(extracted);
    } catch (error) {
      console.error(error);
      alert("Failed to extract PDF text.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!pdfText) {
      alert("Please upload a PDF first.");
      return;
    }

    try {
      setGenerating(true);

      setCurrentQuestion(0);
      setAnswers({});
      setShowResults(false);

      const generatedQuiz = await aiService.generatePdfQuiz(
        pdfText,
        questionCount,
        difficulty
      );



      setQuiz({
        id: `pdf-${Date.now()}`,
        type: "pdf",
        date: new Date().toISOString().split("T")[0],
        topic: generatedQuiz.topic,
        questions: generatedQuiz.questions,
      });


    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to generate quiz.");
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = (option) => {
    const question = quiz.questions[currentQuestion];

    setAnswers((prev) => ({
      ...prev,
      [question.id]: option,
    }));
  };

  const calculateScore = () => {
    let score = 0;

    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        score++;
      }
    });

    return score;
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      const result = await quizService.submitPdfAttempt(
        user.uid,
        quiz,
        answers
      );

      setAttempt(result);
      setShowResults(true);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">
          PDF Quiz Generator
        </h1>

        <p className="text-slate-400">
          Upload study notes, research papers, or PDFs and instantly generate
          AI-powered quizzes.
        </p>
      </div>

      {/* Upload Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">
            Upload Study Material
          </h2>
        </div>

        <label className="cursor-pointer block">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFile}
            className="hidden"
          />

          <div className="border-2 border-dashed border-slate-700 rounded-2xl p-10 text-center hover:border-purple-500 transition-all">
            <FileText className="w-12 h-12 text-purple-400 mx-auto mb-4" />

            <h3 className="text-lg font-bold text-white">
              Upload PDF
            </h3>

            <p className="text-slate-400 mt-2">
              Click here to browse your files
            </p>

            <p className="text-xs text-slate-500 mt-2">
              PDF files only
            </p>
          </div>
        </label>

        {loading && (
          <div className="flex items-center gap-2 text-purple-400 mt-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            Extracting PDF text...
          </div>
        )}

        {file && (
          <div className="mt-6 p-4 rounded-xl bg-slate-800 border border-slate-700">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>{file.name}</span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              File Size: {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}
      </div>

      {/* Quiz Settings */}
      {pdfText && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-8">
            Quiz Settings
          </h2>

          <div className="mb-8">
            <p className="text-slate-400 mb-3">
              Number of Questions
            </p>

            <div className="flex gap-3 flex-wrap mb-4">
              {[5, 10, 20].map((count) => (
                <button
                  key={count}
                  onClick={() => {
                    setQuestionCount(count);
                    setCustomCount("");
                  }}
                  className={`px-5 py-2 rounded-xl font-semibold transition-all ${questionCount === count && customCount === ""
                    ? "bg-purple-500 text-white"
                    : "bg-slate-800 text-slate-400"
                    }`}
                >
                  {count}
                </button>
              ))}
            </div>

            <input
              type="number"
              min="1"
              max="100"
              placeholder="Custom question count"
              value={customCount}
              onChange={(e) => {
                setCustomCount(e.target.value);

                if (e.target.value) {
                  setQuestionCount(Number(e.target.value));
                }
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500"
            />
          </div>

          <div className="mb-8">
            <p className="text-slate-400 mb-3">
              Difficulty
            </p>

            <div className="flex flex-wrap gap-3">
              {["Easy", "Medium", "Hard", "Mixed"].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-5 py-2 rounded-xl font-semibold transition-all ${difficulty === level
                    ? "bg-purple-500 text-white"
                    : "bg-slate-800 text-slate-400"
                    }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={generating}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:opacity-90 transition-all disabled:opacity-50"
            onClick={handleGenerateQuiz}
          >
            {generating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Quiz...
              </div>
            ) : (
              "Generate Quiz"
            )}
          </button>

          {quiz && !showResults && (
            <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-8">

              <h3 className="text-xl font-bold text-white mb-6">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </h3>

              <p className="text-lg text-white mb-6">
                {quiz.questions[currentQuestion].question}
              </p>

              <div className="space-y-3">
                {quiz.questions[currentQuestion].options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${answers[quiz.questions[currentQuestion].id] === option
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-slate-700 bg-slate-800"
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="flex justify-between mt-8">

                <button
                  disabled={currentQuestion === 0}
                  onClick={() => setCurrentQuestion((prev) => prev - 1)}
                  className="px-4 py-2 bg-slate-800 rounded-xl"
                >
                  Previous
                </button>

                {currentQuestion === quiz.questions.length - 1 ? (
                  <button
                    disabled={
                      submitting ||
                      !answers[quiz.questions[currentQuestion].id]
                    }
                    onClick={handleSubmitQuiz}
                    className="px-6 py-2 bg-purple-600 rounded-xl disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Quiz"}
                  </button>
                ) : (
                  <button
                    disabled={!answers[quiz.questions[currentQuestion].id]}
                    onClick={() => setCurrentQuestion((prev) => prev + 1)}
                    className="px-6 py-2 bg-purple-600 rounded-xl disabled:opacity-50"
                  >
                    Next
                  </button>
                )}
              </div>

            </div>
          )}
          {attempt && (
            <QuizResults
              attempt={attempt}
              onViewHistory={() => navigate("/history")}
              onGoDashboard={() => navigate("/")}
            />
          )}
        </div>
      )}
    </div>
  );
}