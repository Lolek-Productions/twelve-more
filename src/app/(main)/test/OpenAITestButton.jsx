// src/app/(main)/test/OpenAITestButton.jsx
"use client";
import React, { useState } from "react";
import { openaiTtsAction } from "./openaiTtsAction";

// Common BCP-47 language codes for demo
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "ja", label: "Japanese" },
  { code: "zh", label: "Chinese" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
];

export default function OpenAITestButton() {
  const [text, setText] = useState("Hello from OpenAI!");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    setLoading(true);
    try {
      // Pass language as an option to the server action
      const base64Audio = await openaiTtsAction(text, { language });
      const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={3} />
      <select value={language} onChange={e => setLanguage(e.target.value)}>
        {LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>{lang.label}</option>
        ))}
      </select>
      <button onClick={handleSend} disabled={loading} style={{ padding: 8 }}>
        {loading ? "Generating audio..." : "Send to OpenAI & Play"}
      </button>
    </div>
  );
}
