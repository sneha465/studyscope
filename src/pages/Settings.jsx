import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Mail, Loader2, Save } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { quizService } from "../services/quizService";
import { DEFAULT_TOPICS } from "../services/aiService";

export function Settings() {
  const { user } = useAuth();
  const [emailReminders, setEmailReminders] = useState(true);
  const [preferredTopics, setPreferredTopics] = useState(DEFAULT_TOPICS.join(", "));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      await quizService.ensureUserDoc(user.uid, user.email);
      const profile = await quizService.getUserProfile(user.uid);
      if (profile) {
        setEmailReminders(profile.emailReminders !== false);
        setPreferredTopics((profile.preferredTopics || DEFAULT_TOPICS).join(", "));
      }
      setLoading(false);
    }
    load();
  }, [user.uid, user.email]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const topics = preferredTopics
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    await quizService.updateUserSettings(user.uid, {
      emailReminders,
      preferredTopics: topics.length > 0 ? topics : DEFAULT_TOPICS,
      email: user.email,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
          <Bell className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Settings</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-black">
            Preferences & reminders
          </p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white">Email Reminders</h3>
            <p className="text-sm text-slate-500 mt-1">Receive a daily reminder to complete your quiz</p>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="font-bold text-white text-sm">Daily Quiz Reminder</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sent to {user.email} — link only, no quiz questions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmailReminders(!emailReminders)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  emailReminders ? "bg-purple-600" : "bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    emailReminders ? "left-6" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <Input
              label="Preferred Quiz Topics (comma-separated)"
              placeholder="Science, Technology, History"
              value={preferredTopics}
              onChange={(e) => setPreferredTopics(e.target.value)}
            />
            <p className="text-xs text-slate-500 -mt-4">
              Topics rotate daily for your AI-generated quizzes.
            </p>

            <Button
              className="w-full gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 border-0"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saved ? "Saved!" : "Save Settings"}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
