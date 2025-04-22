import React, { useState } from "react";
import { openaiTtsAction } from "@/app/(main)/test/openaiTtsAction";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es-419", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "la", label: "Latin" },
];

const TEXT_WORD_LIMIT = 70;

export function PlayPostDropdownItems({ post, dropdownOpen, onRequestClose }) {
  const [loadingLang, setLoadingLang] = useState(null);
  const [playingLang, setPlayingLang] = useState(null);
  const [limitingLang, setLimitingLang] = useState(null);
  const audioRef = React.useRef(null);
  const audioUnlocked = React.useRef(false);

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
    if (!dropdownOpen && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setPlayingLang(null);
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
      if (words.length > TEXT_WORD_LIMIT) {
        textWithoutUrls = words.slice(0, TEXT_WORD_LIMIT).join(' ');
        showLimitNotice = true;
        setLimitingLang(langCode);
      }
      const base64Audio = await openaiTtsAction(textWithoutUrls, { language: langCode, signal: controller.signal });
      clearTimeout(timeoutId);
      setLoadingLang(null);
      const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setPlayingLang(langCode);
      audio.play().catch((err) => {
        console.error('Audio playback error:', err);
        setPlayingLang(null);
        setLimitingLang(null);
        alert("Audio playback failed on your device. Try again or use a shorter post.");
      });

      audio.onended = () => {
        setPlayingLang(null);
        if (onRequestClose) onRequestClose();
        setLimitingLang(null);
      };
      audio.onpause = () => setPlayingLang(null);
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
