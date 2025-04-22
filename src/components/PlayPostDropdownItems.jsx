import React, { useState } from "react";
import { openaiTtsAction } from "@/app/(main)/test/openaiTtsAction";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es-419", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "la", label: "Latin" },
];

const TEXT_WORD_LIMIT = 150;

export function PlayPostDropdownItems({ post, dropdownOpen, onRequestClose }) {
  const [loadingLang, setLoadingLang] = useState(null);
  const [playingLang, setPlayingLang] = useState(null);
  const [limitingLang, setLimitingLang] = useState(null);
  const audioRef = React.useRef(null);

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
        setTimeout(() => setLimitingLang(null), 3000);
      }
      const base64Audio = await openaiTtsAction(textWithoutUrls, { language: langCode, signal: controller.signal });
      clearTimeout(timeoutId);
      setLoadingLang(null);
      const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setPlayingLang(langCode);
      audio.play();

      audio.onended = () => {
        setPlayingLang(null);
        if (onRequestClose) onRequestClose();
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
            handlePlay(lang.code);
          }}
        >
          {limitingLang === lang.code
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
