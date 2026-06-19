import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
  Link,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AuthOverlay } from "./components/auth/AuthOverlay";
import { LandingPage } from "./components/LandingPage";
import {
  LayoutDashboard,
  Sparkles,
  History as HistoryIcon,
  Brain,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  FileText,
} from "lucide-react";
import { Button } from "./components/ui/Button";
import { Dashboard } from "./components/dashboard/Dashboard";
import { DailyQuiz } from "./pages/DailyQuiz";
import { QuizHistory } from "./pages/QuizHistory";
import { QuizReview } from "./pages/QuizReview";
import { TopicMastery } from "./pages/TopicMastery";
import { PDFQuizGenerator } from "./pages/PDFQuizGenerator";
import { Settings } from "./pages/Settings";

function AppContent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);

  if (!user && !showAuthOverlay) {
    return <LandingPage onGetStarted={() => setShowAuthOverlay(true)} />;
  }

  if (!user && showAuthOverlay) {
    return (
      <>
        <LandingPage onGetStarted={() => setShowAuthOverlay(true)} />
        <AuthOverlay onClose={() => setShowAuthOverlay(false)} />
      </>
    );
  }

  const navItems = [
    { path: "/", id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/quiz", id: "quiz", label: "Daily Quiz", icon: Sparkles },
    {path: "/quiz-generator", id: "pdfquiz", label: "PDF Quiz", icon: FileText },
    { path: "/history", id: "history", label: "Quiz History", icon: HistoryIcon },
    { path: "/topics", id: "topics", label: "Topic Mastery", icon: Brain },
    { path: "/settings", id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  const isRouteActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">
      <aside
        className={`fixed inset-y-0 left-0 z-40 transition-transform lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-20"
        } bg-slate-950 border-r border-slate-800 flex flex-col`}
      >
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            {sidebarOpen && <h1 className="text-xl font-bold tracking-tight">StudyScope</h1>}
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <nav className="flex-grow px-3 mt-4 space-y-1">
          {navItems.map((item) => {
            const active = isRouteActive(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  active
                    ? "bg-purple-500/10 text-purple-400 font-bold"
                    : "text-slate-500 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <item.icon className={`w-5 h-5 ${active ? "text-purple-400" : ""}`} />
                {sidebarOpen && <span>{item.label}</span>}
                {active && sidebarOpen && (
                  <div className="ml-auto w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div
            className={`flex items-center gap-3 p-2 rounded-xl bg-slate-900 border border-slate-800 ${
              sidebarOpen ? "" : "justify-center"
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
              {user.photoURL ? (
                <img src={user.photoURL} alt="User" />
              ) : (
                <span className="text-xs font-black text-brand-600">
                  {user.email[0].toUpperCase()}
                </span>
              )}
            </div>
            {sidebarOpen && (
              <div className="flex-grow min-w-0">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">User</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-200 truncate">
                    {user.displayName || user.email.split("@")[0]}
                  </p>
                  <button onClick={logout} title="Sign Out">
                    <LogOut className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-grow overflow-auto">
        <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md flex items-center px-4 md:px-8 sticky top-0 z-30">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2 lg:hidden px-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-grow" />
          <Button
            size="sm"
            className="hidden sm:flex gap-2 h-9 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 border-0"
            onClick={() => navigate("/quiz")}
          >
            <Sparkles className="w-4 h-4" /> Today's Quiz
          </Button>
        </header>

        <div className="max-w-7xl mx-auto py-8 px-4 md:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/quiz" element={<DailyQuiz />} />
                <Route path="/history" element={<QuizHistory />} />
                <Route path="/history/:id" element={<QuizReview />} />
                <Route path="/topics" element={<TopicMastery />} />
                <Route path="/quiz-generator" element={<PDFQuizGenerator />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
