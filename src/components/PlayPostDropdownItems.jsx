import React, { useState } from "react";
import { openaiTtsAction } from "@/app/(main)/test/openaiTtsAction";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es-419", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "la", label: "Latin" },
];

const TEXT_WORD_LIMIT = 20;

export function PlayPostDropdownItems({ post, dropdownOpen, onRequestClose }) {
  const [loadingLang, setLoadingLang] = useState(null);
  const [playingLang, setPlayingLang] = useState(null);
  const [limitingLang, setLimitingLang] = useState(null);
  const audioRef = React.useRef(null);
  const audioUnlocked = React.useRef(false);
  const playbackAborted = React.useRef(false);

  // Play a silent audio to unlock the audio context on mobile (only once)
  function unlockAudioContext() {
    if (audioUnlocked.current) return;
    try {
      const ctx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext) ? new (window.AudioContext || window.webkitAudioContext)() : null;
      if (ctx) {
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        audioUnlocked.current = true;
        setTimeout(() => ctx.close(), 100);
      }
    } catch (e) {
      // fail silently
    }
  }

  React.useEffect(() => {
    if (!dropdownOpen) {
      playbackAborted.current = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      setPlayingLang(null);
      setLoadingLang(null);
      setLimitingLang(null);
    } else {
      playbackAborted.current = false;
    }
  }, [dropdownOpen]);

  async function handlePlay(langCode) {
    setLoadingLang(langCode);
    setPlayingLang(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
    try {
      // Remove URLs from the post text
      let textWithoutUrls = post.text.replace(/https?:\/\/[\w.-]+(?:\/[\w\-.~:/?#[\]@!$&'()*+,;=]*)?/gi, "");
      // Limit to TEXT_WORD_LIMIT words
      const words = textWithoutUrls.trim().split(/\s+/);
      let showLimitNotice = false;
      let chunks = [];
      if (words.length > TEXT_WORD_LIMIT) {
        showLimitNotice = true;
        setLimitingLang(langCode);
        // Split into 20-word chunks
        for (let i = 0; i < words.length; i += TEXT_WORD_LIMIT) {
          chunks.push(words.slice(i, i + TEXT_WORD_LIMIT).join(' '));
        }
      } else {
        chunks = [textWithoutUrls];
      }
      let audios = [];
      for (let i = 0; i < chunks.length; i++) {
        if (playbackAborted.current) {
          // Stop generating further audio if aborted
          return;
        }
        try {
          const base64Audio = await openaiTtsAction(chunks[i], { language: langCode, signal: controller.signal });
          console.log(`Chunk ${i + 1} base64 length:`, base64Audio.length);
          audios.push(`data:audio/mp3;base64,${base64Audio}`);
        } catch (err) {
          console.error(`TTS API error on chunk ${i + 1}:`, err, err.message, err.name);
          setLoadingLang(null);
          setPlayingLang(null);
          setLimitingLang(null);
          alert(`Audio generation failed for chunk ${i + 1}. Try again or use a shorter post.`);
          return;
        }
      }
      clearTimeout(timeoutId);
      setLoadingLang(null);
      let playIndex = 0;
      function playNext() {
        if (playbackAborted.current) {
          setPlayingLang(null);
          setLimitingLang(null);
          return;
        }
        if (playIndex >= audios.length) {
          setPlayingLang(null);
          setLimitingLang(null);
          if (onRequestClose) onRequestClose();
          return;
        }
        const audio = new Audio(audios[playIndex]);
        audioRef.current = audio;
        setPlayingLang(langCode);
        audio.play().catch((err) => {
          console.error('Audio playback error:', err, err.message, err.name);
          setPlayingLang(null);
          setLimitingLang(null);
          alert("Audio playback failed on your device. Try again or use a shorter post.");
        });
        audio.onended = () => {
          playIndex++;
          playNext();
        };
        audio.onpause = () => setPlayingLang(null);
      }
      playNext();
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        alert("Audio generation timed out. Please try again.");
      } else {
        alert("Audio playback failed: " + err.message);
      }
      setLoadingLang(null);
      setPlayingLang(null);
    }
  }

  return (
    <>
      <div className="px-3 py-1 text-xs text-gray-500">Play Post Audio In...</div>
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          className="w-full text-left px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
          disabled={loadingLang === lang.code || playingLang === lang.code}
          onClick={e => {
            e.stopPropagation();
            unlockAudioContext();
            handlePlay(lang.code);
          }}
        >
          {(limitingLang === lang.code && (loadingLang === lang.code || playingLang === lang.code))
            ? `Text limited to first ${TEXT_WORD_LIMIT} words. Generating in ${lang.label}...`
            : loadingLang === lang.code
              ? `Generating in ${lang.label}...`
              : playingLang === lang.code
                ? `Playing in ${lang.label}...`
                : lang.label}
        </button>
      ))}
    </>
  );
}
