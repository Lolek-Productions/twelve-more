import React, { useState } from "react";
import { openaiTtsAction } from "@/app/(main)/test/openaiTtsAction";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es-mx", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "la", label: "Latin" },
];

const TEXT_WORD_LIMIT = 20;

export function PlayPostDropdownItems({ post, dropdownOpen, onRequestClose }) {
  const [loadingLang, setLoadingLang] = useState(null);
  const [playingLang, setPlayingLang] = useState(null);
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
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.onended = null;
          audioRef.current.onpause = null;
        } catch (e) {}
        audioRef.current = null;
      }
      setPlayingLang(null);
      setLoadingLang(null);
    } else {
      playbackAborted.current = false;
    }
    // Cleanup: also stop audio if component is unmounted
    return () => {
      playbackAborted.current = true;
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.onended = null;
          audioRef.current.onpause = null;
        } catch (e) {}
        audioRef.current = null;
      }
      setPlayingLang(null);
      setLoadingLang(null);
    };
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
      // Prefer sentence-based chunking, but limit to 20 words per chunk
      let chunks = [];
      // Split into sentences (simple regex, can be improved for edge cases)
      let sentences = textWithoutUrls.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
      if (sentences) {
        for (let sentence of sentences) {
          const sentenceWords = sentence.trim().split(/\s+/);
          if (sentenceWords.length <= TEXT_WORD_LIMIT) {
            chunks.push(sentence.trim());
          } else {
            // Sentence too long, split into 20-word chunks
            for (let i = 0; i < sentenceWords.length; i += TEXT_WORD_LIMIT) {
              chunks.push(sentenceWords.slice(i, i + TEXT_WORD_LIMIT).join(' '));
            }
          }
        }
      } else {
        // fallback: no sentence split, chunk by words
        for (let i = 0; i < words.length; i += TEXT_WORD_LIMIT) {
          chunks.push(words.slice(i, i + TEXT_WORD_LIMIT).join(' '));
        }
      }
      // Streaming logic
      let audios = Array(chunks.length).fill(null); // Will be filled as chunks are ready
      let audioPromises = [];
      let errored = false;
      // Helper to fetch audio for a chunk, retry up to 3 times
      async function fetchAudioChunk(i) {
        let attempts = 0;
        while (attempts < 3 && !playbackAborted.current) {
          try {
            const base64Audio = await openaiTtsAction(chunks[i], { language: langCode, signal: controller.signal });
            audios[i] = `data:audio/mp3;base64,${base64Audio}`;
            return; // Success
          } catch (err) {
            attempts++;
            if (playbackAborted.current) return;
            if (attempts < 3) {
              await new Promise(res => setTimeout(res, 500));
            }
          }
        }
        // If we get here, all attempts failed
        setLoadingLang(null);
        setPlayingLang(null);
        alert(`Audio generation failed for chunk ${i + 1} after 3 attempts. Try again or use a shorter post.`);
      }
      // Start fetching all chunks in parallel, but only play as they arrive
      // Start fetching the first chunk immediately
      audioPromises[0] = fetchAudioChunk(0);
      // Begin fetching the rest in background
      for (let i = 1; i < chunks.length; i++) {
        audioPromises[i] = fetchAudioChunk(i);
      }
      // Playback logic: play as soon as each chunk is ready
      let playIndex = 0;
      async function playNext() {
        if (playbackAborted.current || errored) {
          setPlayingLang(null);

          return;
        }
        if (playIndex >= chunks.length) {
          setPlayingLang(null);

          if (onRequestClose) onRequestClose();
          return;
        }
        // Wait for the audio chunk to be ready
        while (audios[playIndex] === null) {
          if (errored || playbackAborted.current) return;
          // Wait a short interval before checking again
          await new Promise(res => setTimeout(res, 120));
        }
        // Skip empty or unsupported audio sources
        const src = audios[playIndex];
        if (
          !src ||
          typeof src !== 'string' ||
          !src.startsWith('data:audio/mp3') ||
          src.length < 30 // arbitrary minimum length for a valid base64 mp3
        ) {
          playIndex++;
          playNext();
          return;
        }
        const audio = new Audio(src);
        audioRef.current = audio;
        setPlayingLang(langCode);
        audio.play().catch((err) => {
          console.error('Audio playback error:', err, err.message, err.name);
          setPlayingLang(null);

          alert("Audio playback failed on your device. Try again or use a shorter post.");
        });
        audio.onended = () => {
          playIndex++;
          playNext();
        };
        audio.onpause = () => setPlayingLang(null);
      }
      // Start playback as soon as the first chunk is ready
      (async () => {
        await audioPromises[0];
        clearTimeout(timeoutId);
        setLoadingLang(null);
        playNext();
      })();
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
