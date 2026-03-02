import dotenv from "dotenv";
import express from "express";
import nodemailer from "nodemailer";

dotenv.config();
dotenv.config({ path: "../.env.local" });

const app = express();
app.use(express.json({ limit: "1mb" }));

const port = process.env.NOTIFY_PORT ? Number(process.env.NOTIFY_PORT) : 5174;
const host = process.env.SMTP_HOST;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM;
const secure = String(process.env.SMTP_SECURE || "true").toLowerCase() === "true";
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;

if (!host || !user || !pass || !from) {
  console.warn("SMTP environment variables are missing. Email notifications will fail.");
}

const transporter = nodemailer.createTransport({
  host,
  port: smtpPort,
  secure,
  auth: {
    user,
    pass,
  },
});

app.post("/api/notifications", async (req, res) => {
  const { to, subject, text } = req.body || {};
  if (!to || !subject || !text) {
    return res.status(400).json({ error: "Missing to/subject/text" });
  }
  if (!host || !user || !pass || !from) {
    return res.status(500).json({ error: "SMTP not configured" });
  }
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
    });
    return res.json({ ok: true, messageId: info.messageId });
  } catch (error) {
    console.error("Email send failed:", error);
    return res.status(500).json({ error: "Email send failed" });
  }
});

app.listen(port, () => {
  console.log(`Notification server running on http://localhost:${port}`);
});
