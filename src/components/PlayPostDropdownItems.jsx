import React, { useState } from "react";
import { openaiTtsAction } from "@/app/(main)/test/openaiTtsAction";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es-419", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "la", label: "Latin" },
];

export function PlayPostDropdownItems({ post, dropdownOpen, onRequestClose }) {
  const [loadingLang, setLoadingLang] = useState(null);
  const [playingLang, setPlayingLang] = useState(null);
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
    try {
      // Remove URLs from the post text
      const textWithoutUrls = post.text.replace(/https?:\/\/[\w.-]+(?:\/[\w\-.~:/?#[\]@!$&'()*+,;=]*)?/gi, "");
      const base64Audio = await openaiTtsAction(textWithoutUrls, { language: langCode });
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
      alert("Audio playback failed: " + err.message);
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
          {loadingLang === lang.code
            ? `Generating in ${lang.label}...`
            : playingLang === lang.code
              ? `Playing in ${lang.label}...`
              : lang.label}
        </button>
      ))}
    </>
  );
}
