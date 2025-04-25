// src/app/(main)/test/openaiTtsAction.js
"use server";

import { textToSpeech, translateText } from "@/lib/services/openAiService";
import { franc } from "franc";
import { NextResponse } from "next/server";

/**
 * Server action: translates text to the target language (if not English), then generates an audio file using OpenAI TTS and returns a base64-encoded mp3 string
 * @param {string} text
 * @param {object} options
 * @returns {Promise<string>} base64-encoded mp3 audio
 */
export async function openaiTtsAction(text, options = {}) {
  if (!text) return null; // Skip empty chunk
  const { language = "en" } = options;
  let ttsText = text;

  // Map franc ISO 639-3 codes to supported output language codes
  const francToLang = {
    eng: "en",
    spa: "es",
    fra: "fr",
    deu: "de",
    lat: "la",
  };

  // Detect the language of the input text
  const detectedIso = franc(text);
  const detectedLang = francToLang[detectedIso] || "en";

  // Compare only the language prefix (e.g., 'en', 'es')
  const detectedPrefix = detectedLang.split('-')[0];
  const requestedPrefix = language.split('-')[0];

  // Only translate if detected language prefix is different from desired output language prefix
  if (language && detectedPrefix !== requestedPrefix) {
    ttsText = await translateText(text, language);
  }

  const audioBuffer = await textToSpeech(ttsText, { ...options, language });
  if (!audioBuffer) return null;
  return audioBuffer.toString("base64");
}
