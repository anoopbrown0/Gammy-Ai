import express from "express";
import path from "path";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const server = http.createServer(app);

// Middleware
app.use(express.json());

// Initialize Gemini API securely on the server side
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } else {
    console.warn("GEMINI_API_KEY is not defined. AI coach features will operate in simulated assistant mode.");
  }
} catch (error) {
  console.error("Failed to initialize GoogleGenAI client:", error);
}

// WebSocket Server for Gemini Live API Voice Conversations (gemini-3.1-flash-live-preview)
const wss = new WebSocketServer({ server, path: "/live" });

wss.on("connection", async (clientWs: WebSocket) => {
  console.log("Client connected to Gemini Live API Voice endpoint.");
  if (!ai) {
    clientWs.send(JSON.stringify({ error: "GEMINI_API_KEY is not defined on server." }));
    clientWs.close();
    return;
  }

  try {
    const session = await ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
        },
        systemInstruction: 
          "You are Sabit, an elite AI voice success coach. You speak warmly, concisely, and with inspirational clarity. " +
          "Your goal is to converse with the user in real-time, helping them stay accountable to their habits, morning routine, and daily goals. " +
          "Keep responses short (1-3 spoken sentences at a time) so the audio conversation feels natural, fluid, and engaging.",
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) {
            clientWs.send(JSON.stringify({ audio }));
          }
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
          const textPart = message.serverContent?.modelTurn?.parts?.find((p: any) => p.text);
          if (textPart && textPart.text) {
            clientWs.send(JSON.stringify({ text: textPart.text }));
          }
        },
        onclose: () => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ status: "session_closed" }));
          }
        },
        onerror: (err: any) => {
          console.error("Gemini Live session error:", err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ error: err?.message || "Live API session error" }));
          }
        },
      },
    });

    clientWs.on("message", (data: any) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.audio) {
          session.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: "audio/pcm;rate=16000" },
          });
        } else if (parsed.text) {
          session.sendRealtimeInput({
            text: parsed.text,
          });
        }
      } catch (e) {
        console.error("Error processing client live message:", e);
      }
    });

    clientWs.on("close", () => {
      try {
        session.close();
      } catch (e) {}
    });

  } catch (err: any) {
    console.error("Failed to establish live session:", err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ error: err?.message || "Failed to establish Live session" }));
      clientWs.close();
    }
  }
});

// AI Success Coach chat endpoint with multi-turn support, model selection, and role customization
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, model, role } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Model selection logic based on requested task requirements
    // Supported models: gemini-3.5-flash (default), gemini-3.1-pro-preview (complex tasks), gemini-3.1-flash-lite (fast)
    const selectedModel = model || "gemini-3.5-flash";

    let roleDescription = "You are Sabit, the premium AI Success Coach. You help the user build consistent habits, achieve their goals, and optimize daily performance.";
    if (role === "accountability") {
      roleDescription = "You are Sabit, a Ruthless Accountability Partner. You hold the user to strict non-negotiable standards, demand zero excuses, and focus on execution and streak protection.";
    } else if (role === "planner") {
      roleDescription = "You are Sabit, a Strategic Routine Architect. You specialize in habit stacking, time blocking, energy management, and systematic routine design.";
    } else if (role === "mentor") {
      roleDescription = "You are Sabit, a Mindset & Wellness Coach. You emphasize mental stamina, recovery, stress management, and sustainable personal growth.";
    }

    const systemInstruction = 
      `${roleDescription} ` +
      "You speak in a highly professional, elegant, precise, and sophisticated tone. " +
      "Keep responses visually structured using markdown (bullet points, bold highlights, clean headers). " +
      "Refer to metrics when relevant: Current Streak is 17 Days, Longest Streak is 46 Days, and Success Rate is 84%. " +
      "Refer to active habits if relevant: Gym (5x/wk), Reading (30m), Meditation (15m), Portfolio Coding (1h), Walking (10k steps), Water (3L), English (15m), Savings ($20/day). " +
      "Keep responses crisp, impactful, and directly actionable.";

    if (ai) {
      const contents = [];
      
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          contents.push({
            role: turn.role === "user" ? "user" : "model",
            parts: [{ text: turn.content }],
          });
        }
      }
      
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || "I am currently reflecting on your goal. Let us focus on taking immediate action on your habits!";
      return res.json({ reply: replyText, modelUsed: selectedModel });
    } else {
      setTimeout(() => {
        const simulatedReplies = [
          "Consistency is the ultimate currency of success. Your current 17-day streak is excellent, but let's push it towards your historic 46-day milestone today! What habit are we locking in next?",
          "An 84% Success Rate is elite. To bridge the remaining 16%, let's streamline your morning stack. Doing Meditation (15 mins) immediately followed by Reading ensures high-focus momentum.",
          "Remember: we do not rise to the level of our goals, we fall to the level of our systems. Your Portfolio coding habit is the key lever for your professional leap. Let's make sure that 1 hour is non-negotiable today.",
          "Let's keep the focus high. Gym and Water Intake are your baseline energy habits. Lock those in early in the day so your brain is primed for high-performance cognitive work."
        ];
        const randomReply = simulatedReplies[Math.floor(Math.random() * simulatedReplies.length)];
        return res.json({ reply: randomReply, simulated: true, modelUsed: "simulated" });
      }, 700);
    }
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error?.message || "An error occurred while communicating with the AI Success Coach." });
  }
});

// AI Performance Insights endpoint with structured JSON output
app.post("/api/insights", async (req, res) => {
  try {
    const { habits, successRate, currentStreak, monthlyAchievement } = req.body;
    
    const habitSummary = (habits || []).map((h: any) => {
      const completedCount = (h.days || []).filter((d: any) => d === "completed").length;
      return `${h.name} (Goal: ${h.goal}, Streak: ${h.streak}d, Completions: ${completedCount}/31)`;
    }).join("\n");

    const prompt = 
      `Analyze the user's current habits ledger performance and provide custom high-performance coaching insights.\n\n` +
      `METRICS:\n` +
      `- Success Rate: ${successRate || 0}%\n` +
      `- Current Streak: ${currentStreak || 0} Days\n` +
      `- Monthly Achievement: ${monthlyAchievement || 0}%\n\n` +
      `ACTIVE HABITS:\n${habitSummary || "None active yet."}\n\n` +
      `Please provide your feedback strictly as a JSON object with the following fields:\n` +
      `{\n` +
      `  "summary": "A sophisticated, motivational 2-sentence summary addressing their progress.",\n` +
      `  "strengths": ["Strengths 1", "Strengths 2"],\n` +
      `  "gaps": ["Gap or threat to consistency 1", "Gap or threat to consistency 2"],\n` +
      `  "actionPlan": ["Immediate tactical action 1", "Immediate tactical action 2", "Immediate tactical action 3"]\n` +
      `}`;

    const systemInstruction = 
      "You are Sabit AI, the elite analytics engine for the high-performance Sabit Habit Ledger. " +
      "You analyze tracking telemetry and return highly precise, elegant, and actionable coaching plans. " +
      "You must ALWAYS return your response in raw valid JSON format matching the specified schema.";

    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.5,
          responseMimeType: "application/json",
        },
      });

      const text = response.text?.trim() || "{}";
      try {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      } catch (parseErr) {
        return res.json({
          summary: "Your commitment to routine is clear. Let us streamline your daily choices to optimize for higher mental stamina.",
          strengths: ["Consistency in baseline energy habits", "Strong streak protection"],
          gaps: ["Vulnerability in late-evening coding sessions", "Incomplete hydration tracking"],
          actionPlan: ["Set a hard 11:00 PM boundary for portfolio work", "Log your first 1L water intake before 9:00 AM", "Review and celebrate your 17-day streak each morning"]
        });
      }
    } else {
      setTimeout(() => {
        return res.json({
          summary: "Your ledger indicates highly disciplined momentum. An 84% success rate places you in the upper echelon of high-performance routine builders.",
          strengths: [
            "Excellent protection of high-streak active habits.",
            "Strong early-morning execution on wellness actions."
          ],
          gaps: [
            "Minor variance in evening focus habits.",
            "Sub-optimal hydration consistency during high-intensity coding intervals."
          ],
          actionPlan: [
            "Perform your 15-minute Meditation session as an anchoring anchor immediately before Portfolio coding.",
            "Hydrate with 1L of mineral water in the first 2 hours of waking to optimize metabolic performance.",
            "Engage 'Beast Mode' for coding sessions to lock out digital distractions."
          ]
        });
      }, 700);
    }
  } catch (error: any) {
    console.error("Error in /api/insights:", error);
    res.status(500).json({ error: error?.message || "Failed to generate analytical insights." });
  }
});

// AI Habit Strategy Generator endpoint (Recommends custom habits based on focus area)
app.post("/api/generate-habits", async (req, res) => {
  try {
    const { focusArea } = req.body;
    const prompt = `Generate 3 high-impact habits tailored to the focus area: "${focusArea || "Overall High Performance & Career Growth"}". For each habit, specify name, category (e.g. Fitness, Focus, Mindset, Health, Wealth), target goal, frequency (e.g. Daily, 5x/week), and a short 1-sentence why statement. Return strictly as JSON array of objects with keys: name, category, goal, frequency, reason.`;

    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite productivity scientist. Return valid JSON array only.",
          responseMimeType: "application/json",
        },
      });
      const text = response.text?.trim() || "[]";
      try {
        const parsed = JSON.parse(text);
        return res.json({ habits: parsed });
      } catch (e) {
        return res.json({
          habits: [
            { name: "Deep Work Sprint", category: "Focus", goal: "90 Mins", frequency: "Daily", reason: "Unlocks high-value creative and engineering output." },
            { name: "Cold Exposure", category: "Health", goal: "3 Mins", frequency: "Daily", reason: "Spikes dopamine and mental resilience for hours." },
            { name: "Strategic Evening Review", category: "Mindset", goal: "10 Mins", frequency: "Daily", reason: "Premaps tomorrow's priority actions to reduce friction." }
          ]
        });
      }
    } else {
      setTimeout(() => {
        return res.json({
          habits: [
            { name: "Deep Work Sprint", category: "Focus", goal: "90 Mins", frequency: "Daily", reason: "Unlocks high-value creative and engineering output." },
            { name: "Cold Exposure", category: "Health", goal: "3 Mins", frequency: "Daily", reason: "Spikes dopamine and mental resilience for hours." },
            { name: "Strategic Evening Review", category: "Mindset", goal: "10 Mins", frequency: "Daily", reason: "Premaps tomorrow's priority actions to reduce friction." }
          ]
        });
      }, 600);
    }
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to generate custom habits." });
  }
});

// AI Success Mantra endpoint (Fast generation using gemini-3.1-flash-lite)
app.post("/api/generate-mantra", async (req, res) => {
  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: "Generate a powerful, inspiring, 1-sentence success quote/mantra for a high achiever building daily consistency.",
        config: {
          systemInstruction: "You are a master philosopher and executive coach. Keep it under 20 words.",
        }
      });
      return res.json({ mantra: response.text || "Discipline is choosing between what you want now and what you want most." });
    } else {
      const mantras = [
        "Small daily disciplines repeated consistently over time lead to monumental achievements.",
        "Your future is created by what you do today, not tomorrow.",
        "Consistency is the true test of high performance; show up when it matters most.",
        "Master the morning stack, and you master the trajectory of your life."
      ];
      return res.json({ mantra: mantras[Math.floor(Math.random() * mantras.length)] });
    }
  } catch (err: any) {
    res.status(500).json({ mantra: "Discipline is choosing between what you want now and what you want most." });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Sabit server with Live API WebSocket running on http://localhost:${PORT} [${process.env.NODE_ENV || "development"}]`);
  });
}

startServer();

