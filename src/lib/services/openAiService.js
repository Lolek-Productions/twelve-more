// src/lib/services/openAiService.js
// Service for generating audio files from text using OpenAI's TTS API and the OPENAI_KEY from .env.local

import OpenAI from "openai";

const OPENAI_KEY = process.env.OPENAI_KEY;

if (!OPENAI_KEY) {
  throw new Error('OpenAI API key not found in environment variables. Please set OPENAI_KEY in .env.local');
}

const openai = new OpenAI({ apiKey: OPENAI_KEY });

/**
 * Generates an audio file (mp3) from text using OpenAI's TTS API.
 * @param {string} text - The text to convert to speech.
 * @param {object} [options] - Additional options for TTS (voice, model, etc.)
 * @returns {Promise<Buffer>} - The audio file as a Buffer (mp3 format)
 */
async function textToSpeech(text, options = {}) {
  const {
    voice = 'alloy', // OpenAI supported voices: alloy, echo, fable, onyx, nova, shimmer
    model = 'tts-1',
    response_format = 'mp3',
    language,
    ...rest
  } = options;

  const request = {
    model,
    input: text,
    voice,
    response_format,
    ...rest,
  };
  if (language) {
    request.language = language;
  }

  const response = await openai.audio.speech.create(request);

  // Return the audio as a Buffer
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Translate text to a target language using OpenAI Chat API.
 * @param {string} text
 * @param {string} targetLang - BCP-47 code (e.g. 'es', 'fr')
 * @returns {Promise<string>} Translated text
 */
async function translateText(text, targetLang) {
  if (!targetLang) return text;
  const langNames = { en: "English", es: "Spanish", fr: "French", de: "German", la: "Latin" };
  const langLabel = langNames[targetLang] || targetLang;
  let prompt = `Translate the following text to ${langLabel}. Respond with only the translation:\n"""${text}"""`;
  
  let response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a translation assistant.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 1000,
    temperature: 0.3,
  });
  let translated = response.choices[0].message.content.trim();
  

  // Fallback: If translation is identical to input, try a more explicit prompt
  if (translated === text) {
    prompt = `Translate to ${langLabel}. Only output the translation.\nText: ${text}`;
    
    response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a translation assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });
    translated = response.choices[0].message.content.trim();
    
  }
  return translated;
}

export { textToSpeech, translateText };
