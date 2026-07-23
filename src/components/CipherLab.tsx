import { useState, useCallback, useMemo, useEffect } from "react";
import type { FC } from "react";
import {
  caesarCipher,
  encrypt,
  decrypt,
  generateChallenge,
  normalizeAlbanian,
  denormalizeAlbanian,
  ENGLISH_ALPHABET,
  ALBANIAN_ALPHABET_DISPLAY,
  ALPHABETS,
  type Language,
} from "~/lib/cipher";

// ─── Types ───────────────────────────────────────────────────────────────

type Section = "learn" | "playground" | "challenge" | "explanation";
type Mode = "encrypt" | "decrypt";

// ─── Constants ───────────────────────────────────────────────────────────

const NAV_ITEMS: { key: Section; label: string }[] = [
  { key: "learn", label: "Learn" },
  { key: "playground", label: "Playground" },
  { key: "challenge", label: "Challenge" },
  { key: "explanation", label: "Explanation" },
];

const EXAMPLE_MESSAGES: Record<string, string> = {
  english: "Hello, World! This is a secret message.",
  albanian: "Përshëndetje, botë! Ky është një mesazh sekret.",
};

// ─── Sub-components ──────────────────────────────────────────────────────

/** Animated letter shift display — shows a few letters cycling. */
const ShiftVisual: FC<{
  shift: number;
  alphabet: string[];
}> = ({ shift, alphabet }) => {
  // Pick a few representative single-char samples from the alphabet
  const samples = useMemo(() => {
    const singles = alphabet.filter((a) => a.length === 1);
    const count = Math.min(5, singles.length);
    return singles.slice(0, count);
  }, [alphabet]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {samples.map((letter, i) => {
        const idx = alphabet.indexOf(letter);
        const shiftedIdx = ((idx + shift) % alphabet.length + alphabet.length) % alphabet.length;
        const shifted = alphabet[shiftedIdx];
        return (
          <div key={i} className="flex items-center gap-1">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-lg font-bold text-cyan-300 transition-all duration-300">
              {letter}
            </span>
            <svg className="h-4 w-4 text-cyan-500/60" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M10 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10 text-lg font-bold text-violet-300 transition-all duration-300">
              {shifted}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Learn Section ───────────────────────────────────────────────────────

const LearnSection: FC = () => (
  <div className="space-y-8">
    {/* Hero */}
    <div className="text-center">
      <h2 className="text-3xl font-bold text-white sm:text-4xl">
        What is the{" "}
        <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
          Caesar Cipher
        </span>
        ?
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
        One of the oldest and simplest encryption techniques — used by Julius Caesar
        to protect military messages over 2,000 years ago.
      </p>
    </div>

    {/* Visual explanation card */}
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-6 backdrop-blur-sm sm:p-8">
      <h3 className="text-xl font-semibold text-white">How It Works</h3>
      <p className="mt-2 text-slate-400">
        Each letter in your message is <strong className="text-cyan-300">shifted</strong> by
        a fixed number of positions through the alphabet.
      </p>

      <div className="mt-6 overflow-x-auto">
        <div className="flex min-w-max items-center gap-1 text-sm font-mono">
          {/* Plain alphabet row */}
          {ENGLISH_ALPHABET.map((letter) => (
            <span
              key={"plain-" + letter}
              className="flex h-8 w-8 items-center justify-center rounded bg-slate-700/60 text-slate-300"
            >
              {letter}
            </span>
          ))}
        </div>

        <div className="my-3 text-center text-sm text-cyan-400">
          ↓ shift right by 3 ↓
        </div>

        <div className="flex min-w-max items-center gap-1 text-sm font-mono">
          {/* Shifted alphabet row */}
          {ENGLISH_ALPHABET.map((_, i) => {
            const shifted = ENGLISH_ALPHABET[(i + 3) % 26];
            return (
              <span
                key={"shift-" + i}
                className="flex h-8 w-8 items-center justify-center rounded bg-cyan-500/15 text-cyan-300"
              >
                {shifted}
              </span>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-slate-400">
        So <code className="rounded bg-slate-700 px-1.5 py-0.5 text-cyan-300">A → D</code>,
        {" "}<code className="rounded bg-slate-700 px-1.5 py-0.5 text-cyan-300">B → E</code>,
        {" "}<code className="rounded bg-slate-700 px-1.5 py-0.5 text-cyan-300">X → A</code>{" "}
        (wraps around!), and so on. To decrypt, just shift backward.
      </p>
    </div>

    {/* Warning card */}
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex-shrink-0 text-2xl" aria-hidden="true">⚠️</span>
        <div>
          <h3 className="text-lg font-semibold text-amber-300">
            For Learning Only
          </h3>
          <p className="mt-1 text-amber-200/80">
            The Caesar Cipher is <strong>not secure</strong> for protecting real data.
            It has only 25 possible keys — a computer can crack it in milliseconds.
            Never use it for passwords, personal information, or anything sensitive.
          </p>
        </div>
      </div>
    </div>

    {/* Comparison */}
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-300">
          <span className="text-2xl">🏛️</span> Classical Cipher
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-400">
          <li>• Simple letter substitution</li>
          <li>• Only 25 possible keys</li>
          <li>• Broken by hand in minutes</li>
          <li>• Vulnerable to frequency analysis</li>
          <li>• No mathematical security</li>
        </ul>
      </div>
      <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-6 backdrop-blur-sm">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-cyan-300">
          <span className="text-2xl">🔒</span> Modern Encryption
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-400">
          <li>• Complex mathematical algorithms</li>
          <li>• 2²⁵⁶+ possible keys (AES-256)</li>
          <li>• Requires supercomputers to attack</li>
          <li>• Resistant to all known analysis</li>
          <li>• Used by banks, militaries, HTTPS</li>
        </ul>
      </div>
    </div>
  </div>
);

// ─── Playground Section ──────────────────────────────────────────────────

const PlaygroundSection: FC = () => {
  const [message, setMessage] = useState("");
  const [shift, setShift] = useState(3);
  const [mode, setMode] = useState<Mode>("encrypt");
  const [language, setLanguage] = useState<Language>("english");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [inputError, setInputError] = useState("");
  const [outputLabel, setOutputLabel] = useState("");

  const alphabet = ALPHABETS[language];
  // Display-friendly alphabet for the shift visual (shows natural digraphs)
  const displayAlphabet =
    language === "albanian" ? ALBANIAN_ALPHABET_DISPLAY : ENGLISH_ALPHABET;

  // Denormalize result for display (Albanian internal chars → natural digraphs)
  const displayResult = language === "albanian" ? denormalizeAlbanian(result) : result;

  const handleTransform = useCallback(() => {
    setInputError("");
    const trimmed = message.trim();
    if (!trimmed) {
      setInputError("Please enter a message to transform.");
      setResult("");
      setOutputLabel("");
      return;
    }
    if (shift < 1 || shift > alphabet.length - 1) {
      setInputError(`Shift must be between 1 and ${alphabet.length - 1}.`);
      setResult("");
      setOutputLabel("");
      return;
    }
    const output =
      mode === "encrypt"
        ? encrypt(trimmed, shift, alphabet, language)
        : decrypt(trimmed, shift, alphabet, language);
    setResult(output);
    setOutputLabel(mode === "encrypt" ? "Encrypted Result" : "Decrypted Result");
  }, [message, shift, mode, alphabet, language]);

  // Auto-transform when inputs change (debounced feel via state)
  useEffect(() => {
    if (message.trim()) {
      handleTransform();
    } else {
      setResult("");
      setOutputLabel("");
    }
  }, [message, shift, mode, language, handleTransform]);

  const handleCopy = async () => {
    if (!displayResult) return;
    try {
      await navigator.clipboard.writeText(displayResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      setCopied(false);
    }
  };

  const handleClear = () => {
    setMessage("");
    setResult("");
    setInputError("");
    setOutputLabel("");
  };

  const handleExample = () => {
    setMessage(EXAMPLE_MESSAGES[language] || EXAMPLE_MESSAGES.english);
    setInputError("");
  };

  const alphSize = alphabet.length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">Playground</h2>
        <p className="mt-2 text-slate-400">
          Encrypt or decrypt messages and see the cipher in action.
        </p>
      </div>

      {/* Controls row: language + mode */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[140px]">
          <label htmlFor="language-select" className="mb-1 block text-sm font-medium text-slate-400">
            Alphabet
          </label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="english">English (26 letters)</option>
            <option value="albanian">Albanian (36 letters)</option>
          </select>
        </div>

        <div className="flex-1 min-w-[140px]">
          <label className="mb-1 block text-sm font-medium text-slate-400">Mode</label>
          <div className="flex rounded-lg border border-slate-600 bg-slate-800 p-1">
            <button
              onClick={() => setMode("encrypt")}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                mode === "encrypt"
                  ? "bg-cyan-500/20 text-cyan-300 shadow-sm shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🔒 Encrypt
            </button>
            <button
              onClick={() => setMode("decrypt")}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                mode === "decrypt"
                  ? "bg-violet-500/20 text-violet-300 shadow-sm shadow-violet-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🔓 Decrypt
            </button>
          </div>
        </div>
      </div>

      {/* Shift slider */}
      <div>
        <label htmlFor="shift-slider" className="mb-1 block text-sm font-medium text-slate-400">
          Shift: <span className="text-cyan-300 font-bold text-lg">{shift}</span>
        </label>
        <input
          id="shift-slider"
          type="range"
          min={1}
          max={alphSize - 1}
          value={shift}
          onChange={(e) => setShift(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer
            bg-slate-700
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-6
            [&::-webkit-slider-thumb]:w-6
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-cyan-500
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:shadow-cyan-500/30
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:h-6
            [&::-moz-range-thumb]:w-6
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-cyan-500
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:shadow-lg
            [&::-moz-range-thumb]:shadow-cyan-500/30
            [&::-moz-range-thumb]:cursor-pointer"
          aria-valuemin={1}
          aria-valuemax={alphSize - 1}
          aria-valuenow={shift}
          aria-valuetext={`Shift of ${shift}`}
        />
        <div className="mt-1 flex justify-between text-xs text-slate-500">
          <span>1</span>
          <span>{alphSize - 1}</span>
        </div>
      </div>

      {/* Visual shift animation */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
        <p className="mb-3 text-center text-sm text-slate-500">Live shift preview</p>
        <ShiftVisual shift={mode === "encrypt" ? shift : -shift} alphabet={displayAlphabet} />
      </div>

      {/* Input area */}
      <div>
        <label htmlFor="message-input" className="mb-1 block text-sm font-medium text-slate-400">
          Your Message
        </label>
        <textarea
          id="message-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type or paste your message here..."
          rows={3}
          className="w-full rounded-xl border border-slate-600 bg-slate-800/60 px-4 py-3 text-white placeholder-slate-500
            focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-y"
        />
        {inputError && (
          <p className="mt-1 text-sm text-amber-400" role="alert">{inputError}</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleTransform}
          className="rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white
            hover:bg-cyan-500 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          {mode === "encrypt" ? "🔒 Encrypt" : "🔓 Decrypt"}
        </button>
        <button
          onClick={handleExample}
          className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-300
            hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          📝 Example
        </button>
        <button
          onClick={handleClear}
          className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-300
            hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          🗑️ Clear
        </button>
      </div>

      {/* Output panel */}
      {displayResult && (
        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-800/80 to-slate-800/40 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              {outputLabel}
            </h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 px-3 py-1.5 text-xs font-medium text-cyan-300
                hover:bg-cyan-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              {copied ? "✅ Copied!" : "📋 Copy Result"}
            </button>
          </div>
          <p className="break-all font-mono text-lg text-white">{displayResult}</p>
        </div>
      )}
    </div>
  );
};

// ─── Challenge Section ───────────────────────────────────────────────────

const ChallengeSection: FC = () => {
  const [language, setLanguage] = useState<Language>("english");
  const [challenge, setChallenge] = useState(() => generateChallenge(ALPHABETS.english, "english"));
  const [userAnswer, setUserAnswer] = useState("");
  const [userShift, setUserShift] = useState<number | "">("");
  const [feedback, setFeedback] = useState<{ type: "correct" | "incorrect" | "hint" | ""; message: string }>({ type: "", message: "" });
  const [completed, setCompleted] = useState(false);

  const alphabet = ALPHABETS[language];

  const newChallenge = useCallback(() => {
    const c = generateChallenge(alphabet, language);
    setChallenge(c);
    setUserAnswer("");
    setUserShift("");
    setFeedback({ type: "", message: "" });
    setCompleted(false);
  }, [alphabet]);

  // Regenerate when language changes
  useEffect(() => {
    newChallenge();
  }, [language, newChallenge]);

  const handleCheck = () => {
    if (userShift === "" || userShift < 1 || userShift > alphabet.length - 1) {
      setFeedback({
        type: "hint",
        message: `Please enter a shift between 1 and ${alphabet.length - 1}.`,
      });
      return;
    }

    if (Number(userShift) === challenge.shift) {
      const decrypted = decrypt(challenge.ciphertext, Number(userShift), alphabet, language);
      // Denormalize for comparison with user's natural-language answer
      const decryptedDisplay = language === "albanian" ? denormalizeAlbanian(decrypted) : decrypted;
      // Normalize user answer for comparison
      const normalizedAnswer = language === "albanian" ? normalizeAlbanian(userAnswer.trim()) : userAnswer.trim();
      const normalizedDecrypted = language === "albanian" ? normalizeAlbanian(decryptedDisplay) : decryptedDisplay;
      if (normalizedAnswer && normalizedAnswer.toLowerCase() !== normalizedDecrypted.toLowerCase()) {
        setFeedback({
          type: "hint",
          message: "The shift is correct, but the message text doesn't match. Did you type the decrypted message? Try decrypting with the correct shift!",
        });
        return;
      }
      setFeedback({
        type: "correct",
        message: `🎉 Correct! The shift was ${challenge.shift}. The original message was: "${challenge.plaintext}"`,
      });
      setCompleted(true);
    } else {
      setFeedback({
        type: "incorrect",
        message: "That's not the right shift. Try a different number — remember there are only so many possibilities!",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">Challenge</h2>
        <p className="mt-2 text-slate-400">
          Can you crack the code? Find the shift and decode the message.
        </p>
      </div>

      {/* Progress */}
      {completed && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
          <span className="text-emerald-400 font-semibold">✅ Challenge Completed!</span>
        </div>
      )}

      {/* Language selector */}
      <div>
        <label htmlFor="challenge-language" className="mb-1 block text-sm font-medium text-slate-400">
          Alphabet
        </label>
        <select
          id="challenge-language"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="w-full max-w-xs rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        >
          <option value="english">English (26 letters)</option>
          <option value="albanian">Albanian (36 letters)</option>
        </select>
      </div>

      {/* Encrypted message */}
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-slate-800/80 to-slate-800/40 p-6 backdrop-blur-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-violet-400">
          🔐 Encrypted Message
        </h3>
        <p className="mt-3 break-all font-mono text-xl text-white">
          {language === "albanian" ? denormalizeAlbanian(challenge.ciphertext) : challenge.ciphertext}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          This message was encrypted with a shift between 1 and {alphabet.length - 1}.
        </p>
      </div>

      {/* Answer inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="shift-guess" className="mb-1 block text-sm font-medium text-slate-400">
            Your Shift Guess
          </label>
          <input
            id="shift-guess"
            type="number"
            min={1}
            max={alphabet.length - 1}
            value={userShift}
            onChange={(e) => setUserShift(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder={`1–${alphabet.length - 1}`}
            className="w-full rounded-lg border border-slate-600 bg-slate-800/60 px-4 py-2.5 text-white placeholder-slate-500
              focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label htmlFor="decoded-guess" className="mb-1 block text-sm font-medium text-slate-400">
            Decoded Message (optional)
          </label>
          <input
            id="decoded-guess"
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="What does it say?"
            className="w-full rounded-lg border border-slate-600 bg-slate-800/60 px-4 py-2.5 text-white placeholder-slate-500
              focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Check button */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCheck}
          disabled={completed}
          className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white
            hover:bg-violet-500 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-slate-900
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🔍 Check My Answer
        </button>
        <button
          onClick={newChallenge}
          className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-300
            hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          🎲 New Challenge
        </button>
      </div>

      {/* Feedback */}
      {feedback.message && (
        <div
          className={`rounded-xl p-4 ${
            feedback.type === "correct"
              ? "border border-emerald-500/30 bg-emerald-500/5"
              : feedback.type === "incorrect"
                ? "border border-red-500/30 bg-red-500/5"
                : "border border-amber-500/30 bg-amber-500/5"
          }`}
          role="alert"
        >
          <p
            className={`text-sm font-medium ${
              feedback.type === "correct"
                ? "text-emerald-300"
                : feedback.type === "incorrect"
                  ? "text-red-300"
                  : "text-amber-300"
            }`}
          >
            {feedback.message}
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Explanation Section ─────────────────────────────────────────────────

const ExplanationSection: FC = () => {
  const [message, setMessage] = useState("");
  const [shift, setShift] = useState(3);
  const [language, setLanguage] = useState<Language>("english");

  const alphabet = ALPHABETS[language];

  // Build the step-by-step transformation table
  const steps = useMemo(() => {
    if (!message.trim()) return [];
    const trimmed = message.trim();
    // For Albanian, normalize input to internal form before analysis
    const workingInput = language === "albanian" ? normalizeAlbanian(trimmed) : trimmed;
    const output = caesarCipher(trimmed, shift, alphabet, language);
    const entries: { original: string; shifted: string }[] = [];

    // Walk through the working input character by character
    for (let i = 0; i < workingInput.length; i++) {
      const char = workingInput[i];
      // Check if this character is part of the alphabet
      const upperChar = char.toUpperCase();
      const idx = alphabet.findIndex((a) => a.toUpperCase() === upperChar);

      if (idx !== -1) {
        const newIdx = (idx + shift) % alphabet.length;
        const shiftedChar = alphabet[newIdx];
        // Preserve case
        const shiftedCased = char === char.toUpperCase() && char !== char.toLowerCase()
          ? shiftedChar.toUpperCase()
          : shiftedChar.toLowerCase();
        entries.push({ original: char, shifted: shiftedCased });
      }
      // Non-alphabet chars are skipped (pass through)
    }

    // Denormalize for display if Albanian
    if (language === "albanian") {
      return entries.slice(0, 30).map(e => ({
        original: denormalizeAlbanian(e.original),
        shifted: denormalizeAlbanian(e.shifted),
      }));
    }

    return entries.slice(0, 30); // Limit display to 30 entries
  }, [message, shift, alphabet, language]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">Explanation</h2>
        <p className="mt-2 text-slate-400">
          See exactly how the cipher transforms each character step by step.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[140px]">
          <label htmlFor="explain-language" className="mb-1 block text-sm font-medium text-slate-400">
            Alphabet
          </label>
          <select
            id="explain-language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="english">English (26 letters)</option>
            <option value="albanian">Albanian (36 letters)</option>
          </select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label htmlFor="explain-shift" className="mb-1 block text-sm font-medium text-slate-400">
            Shift
          </label>
          <input
            id="explain-shift"
            type="number"
            min={1}
            max={alphabet.length - 1}
            value={shift}
            onChange={(e) => setShift(Math.max(1, Math.min(alphabet.length - 1, Number(e.target.value) || 1)))}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="explain-message" className="mb-1 block text-sm font-medium text-slate-400">
          Message to Analyze
        </label>
        <textarea
          id="explain-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter a message to see how it transforms..."
          rows={2}
          className="w-full rounded-xl border border-slate-600 bg-slate-800/60 px-4 py-3 text-white placeholder-slate-500
            focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-y"
        />
      </div>

      {/* Transformation table */}
      {steps.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-700/60">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/60">
                <th className="px-4 py-3 font-semibold text-slate-300">Original</th>
                <th className="px-4 py-3 font-semibold text-slate-300">→</th>
                <th className="px-4 py-3 font-semibold text-slate-300">Shifted (+{shift})</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((step, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-800 transition-colors hover:bg-slate-800/40"
                >
                  <td className="px-4 py-2.5 font-mono text-slate-300">{step.original}</td>
                  <td className="px-4 py-2.5 text-cyan-400">→</td>
                  <td className="px-4 py-2.5 font-mono text-cyan-300">{step.shifted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {message.trim() && steps.length === 0 && (
        <p className="text-sm text-slate-500 text-center">
          No alphabet letters found in the message. Try adding some letters!
        </p>
      )}

      {/* Educational writeup */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-6 backdrop-blur-sm space-y-4">
        <h3 className="text-xl font-semibold text-white">What I Learned About Substitution Ciphers</h3>

        <div className="space-y-3 text-slate-400 text-sm leading-relaxed">
          <p>
            The Caesar Cipher is a <strong className="text-white">substitution cipher</strong> —
            each letter in the plaintext is replaced by a letter some fixed number of positions
            down the alphabet. It's named after Julius Caesar, who used a shift of 3 for military
            communications.
          </p>

          <h4 className="text-base font-semibold text-cyan-300">Key Size</h4>
          <p>
            With only <strong className="text-white">{alphabet.length - 1} possible shifts</strong>{" "}
            (the shift of 0 does nothing, and shifts wrap around), the key space is trivially small.
            For the English alphabet, that's just 25 keys. A person can try every key by hand in
            minutes, and a computer can do it in <strong className="text-white">milliseconds</strong>.
          </p>

          <h4 className="text-base font-semibold text-cyan-300">Brute Force Attack</h4>
          <p>
            To break a Caesar Cipher, an attacker simply tries every possible shift and looks for
            the one that produces readable text. This is called a{" "}
            <strong className="text-white">brute force attack</strong>. Because the key space is
            so small, brute force is always successful against the Caesar Cipher.
          </p>

          <h4 className="text-base font-semibold text-cyan-300">Frequency Analysis</h4>
          <p>
            Even without brute force, an attacker can use{" "}
            <strong className="text-white">frequency analysis</strong> — studying how often each
            letter appears in the ciphertext and comparing it to known letter frequencies in the
            language. In English, "E" is the most common letter; in the ciphertext, the most
            common letter is likely the shifted version of "E."
          </p>

          <h4 className="text-base font-semibold text-cyan-300">Why Modern Encryption Is Needed</h4>
          <p>
            Modern encryption algorithms like{" "}
            <strong className="text-white">AES (Advanced Encryption Standard)</strong> use
            keys that are 128, 192, or 256 bits long — meaning there are 2²⁵⁶ possible keys
            (a number with 78 digits). Even with all the world's computers working together,
            it would take billions of years to try every possible key. Modern ciphers also use
            complex mathematical operations (substitution, permutation, mixing) across multiple
            rounds, making them resistant to frequency analysis and other attacks.
          </p>

          <h4 className="text-base font-semibold text-amber-300">⚠️ Remember</h4>
          <p>
            The Caesar Cipher is a wonderful tool for learning about cryptography, but it provides{" "}
            <strong className="text-white">zero real-world security</strong>. Never use it to protect
            passwords, personal data, financial information, or anything you wouldn't write on a
            public billboard. Real security requires modern, peer-reviewed encryption algorithms
            implemented correctly.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Main CipherLab App ──────────────────────────────────────────────────

export default function CipherLab() {
  const [activeSection, setActiveSection] = useState<Section>("learn");

  return (
    <div className="min-h-dvh bg-[#0a0e1a] text-white selection:bg-cyan-500/30">
      {/* Background grid/dot texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #00e5ff 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
        aria-hidden="true"
      />

      {/* Header / Navigation */}
      <header className="relative z-10 border-b border-slate-700/50 bg-[#0a0e1a]/80 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">🔐</span>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-cyan-400">Cipher</span>
                <span className="text-violet-400">Lab</span>
              </span>
            </div>

            {/* Nav items */}
            <nav className="flex flex-wrap gap-1" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#0a0e1a] ${
                    activeSection === item.key
                      ? "bg-cyan-500/15 text-cyan-300 shadow-sm shadow-cyan-500/10"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                  aria-current={activeSection === item.key ? "page" : undefined}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {activeSection === "learn" && <LearnSection />}
        {activeSection === "playground" && <PlaygroundSection />}
        {activeSection === "challenge" && <ChallengeSection />}
        {activeSection === "explanation" && <ExplanationSection />}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-700/50 bg-[#0a0e1a]/80 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 py-6 text-center text-xs text-slate-500 sm:px-6">
          Built as an educational cryptography project. Caesar Cipher is for learning only and
          must not be used to protect sensitive information.
        </div>
      </footer>
    </div>
  );
}
