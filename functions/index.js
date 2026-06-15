const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineString } = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const appUrl = defineString("APP_URL", {
  description: "Public URL of the StudyScope app",
  default: "https://studyscope-ai.web.app",
});

const smtpHost = defineString("SMTP_HOST", { default: "" });
const smtpPort = defineString("SMTP_PORT", { default: "587" });
const smtpUser = defineString("SMTP_USER", { default: "" });
const smtpPass = defineString("SMTP_PASS", { default: "" });
const smtpFrom = defineString("SMTP_FROM", { default: "StudyScope <noreply@studyscope.app>" });

function createTransport() {
  const host = smtpHost.value();
  if (!host) {
    console.warn("SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS via Firebase params.");
    return null;
  }
  return nodemailer.createTransport({
    host,
    port: parseInt(smtpPort.value(), 10),
    secure: false,
    auth: {
      user: smtpUser.value(),
      pass: smtpPass.value(),
    },
  });
}

function buildReminderEmail(toEmail, displayName) {
  const quizUrl = `${appUrl.value()}/quiz`;
  const name = displayName || "there";

  return {
    subject: "Your daily quiz is ready — StudyScope",
    text: `Hi ${name},\n\nYour daily knowledge quiz is waiting for you on StudyScope.\n\nOpen StudyScope and take today's quiz:\n${quizUrl}\n\nKeep your streak going!\n\n— StudyScope`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f172a; color: #e2e8f0; border-radius: 16px;">
        <h1 style="color: #fff; font-size: 24px; margin-bottom: 8px;">Daily Quiz Reminder</h1>
        <p style="color: #94a3b8; line-height: 1.6;">Hi ${name}, your daily knowledge quiz is ready. Open StudyScope to keep your streak going!</p>
        <a href="${quizUrl}" style="display: inline-block; margin-top: 24px; padding: 14px 28px; background: linear-gradient(to right, #6366f1, #a855f7); color: #fff; text-decoration: none; border-radius: 12px; font-weight: bold;">
          Take Today's Quiz
        </a>
        <p style="color: #64748b; font-size: 12px; margin-top: 32px;">You received this because email reminders are enabled in your StudyScope settings. Quiz questions are not included in this email.</p>
      </div>
    `,
  };
}

/**
 * Runs every day at 8:00 AM UTC.
 * Sends a reminder email to users with emailReminders enabled who haven't completed today's quiz.
 */
exports.sendDailyQuizReminders = onSchedule(
  {
    schedule: "0 8 * * *",
    timeZone: "UTC",
    retryCount: 3,
  },
  async () => {
    const transport = createTransport();
    if (!transport) {
      console.error("Email transport not configured. Skipping reminders.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const db = admin.firestore();

    const usersSnap = await db.collection("users").where("emailReminders", "==", true).get();

    let sent = 0;
    let skipped = 0;

    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      const email = userData.email;

      if (!email) {
        skipped++;
        continue;
      }

      if (userData.lastQuizDate === today) {
        skipped++;
        continue;
      }

      const attemptSnap = await db
        .collection("quizAttempts")
        .where("userId", "==", userId)
        .where("date", "==", today)
        .limit(1)
        .get();

      if (!attemptSnap.empty) {
        skipped++;
        continue;
      }

      const mail = buildReminderEmail(email, userData.displayName);
      await transport.sendMail({
        from: smtpFrom.value(),
        to: email,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      });

      sent++;
    }

    console.log(`Daily reminders: ${sent} sent, ${skipped} skipped.`);
  }
);
