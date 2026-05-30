const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/*
====================================
🤖 NEO GPT MULTI-LANG API
Created by Célestin Olua
====================================
*/

app.get("/", (req, res) => {
  res.json({
    status: "ONLINE",
    api: "NEO GPT MULTI-LANG 🤖",
    creator: "Célestin Olua",
    usage: "/chat?text=hello&lang=fr (optional)"
  });
});

// 🤖 CHAT ROUTE
app.get("/chat", async (req, res) => {
  try {
    const text = req.query.text;
    let lang = req.query.lang || detectLang(text);

    if (!text) {
      return res.json({ error: "Missing ?text=" });
    }

    const reply = await askGPT(text, lang);

    res.json({
      user: text,
      language: lang,
      ai: reply,
      creator: "Célestin Olua",
      model: "GPT Multi-Lang"
    });

  } catch (err) {
    res.status(500).json({
      error: "GPT API error"
    });
  }
});

/*
=========================
🌍 SIMPLE LANGUAGE DETECTOR
=========================
*/
function detectLang(text) {
  const t = text.toLowerCase();

  if (t.match(/[àâçéèêëîïôûù]/)) return "fr";
  if (t.includes("bonjour") || t.includes("salut")) return "fr";
  if (t.includes("hello") || t.includes("hi")) return "en";
  if (t.includes("mbote") || t.includes("sango")) return "ln"; // lingala

  return "en";
}

/*
=========================
🤖 GPT ENGINE (OpenAI STYLE)
=========================
*/
async function askGPT(text, lang) {
  try {
    const prompt = buildPrompt(text, lang);

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: prompt.system },
          { role: "user", content: text }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer YOUR_OPENAI_API_KEY`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content;

  } catch (err) {
    return "⚠️ GPT service unavailable or invalid API key";
  }
}

/*
=========================
🧠 MULTI-LANG PROMPTS
=========================
*/
function buildPrompt(text, lang) {
  const prompts = {
    fr: {
      system: "Tu es un assistant intelligent qui répond uniquement en français."
    },
    en: {
      system: "You are a smart AI assistant. Always respond in English."
    },
    ln: {
      system: "Ozali assistant ya mayele. Yanolá kaka na Lingala na ndenge ya pete."
    }
  };

  return prompts[lang] || prompts.en;
}

// 404
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    routes: ["/chat?text=hello", "/chat?text=bonjour&lang=fr"]
  });
});

// START SERVER
app.listen(PORT, () => {
  console.log(`
====================================
🤖 NEO GPT MULTI-LANG RUNNING
Creator: Célestin Olua
PORT: ${PORT}
====================================
  `);
});
