// src/app/(main)/test/openaiTtsAction.js
"use server";

import { textToSpeech, translateText } from "@/lib/services/openAiService";
import { NextResponse } from "next/server";

/**
 * Server action: translates text to the target language (if not English), then generates an audio file using OpenAI TTS and returns a base64-encoded mp3 string
 * @param {string} text
 * @param {object} options
 * @returns {Promise<string>} base64-encoded mp3 audio
 */
export async function openaiTtsAction(text, options = {}) {
  if (!text) throw new Error("No text provided");
  const { language = "en" } = options;
  let ttsText = text;
  if (language && language !== "en") {
    ttsText = await translateText(text, language);
  }
  const audioBuffer = await textToSpeech(ttsText, { ...options });
  return audioBuffer.toString("base64");
}
