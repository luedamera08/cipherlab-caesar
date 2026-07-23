/**
 * CipherLab — Caesar Cipher Utility Library
 *
 * Implements the Caesar Cipher for both English (26 letters) and
 * Albanian (36 letters) alphabets. All logic runs client-side.
 *
 * The Albanian alphabet has 36 letters including 9 digraphs. To avoid
 * ambiguity in ciphertext (e.g. "sh" encrypted to "X" followed by "h"
 * looks like the digraph "Xh"), the cipher uses single-character
 * internal representations and normalizes/denormalizes digraphs.
 */

// ─── Alphabet Definitions ───────────────────────────────────────────────

/** Standard 26-letter English alphabet (single characters only). */
export const ENGLISH_ALPHABET: string[] = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
  "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
  "U", "V", "W", "X", "Y", "Z",
];

/**
 * 36-letter Albanian alphabet — internal single-character representation.
 *
 * Digraphs are mapped to unique single characters so the Caesar shift
 * operates on a clean 1:1 character basis, avoiding ambiguous ciphertext:
 *   Dh→Đ, Gj→Ǵ, Ll→Ļ, Nj→Ņ, Rr→Ŗ, Sh→Ş, Th→Ŧ, Xh→Ẍ, Zh→Ž
 */
export const ALBANIAN_ALPHABET_INTERNAL: string[] = [
  "A", "B", "C", "Ç", "D", "Đ", "E", "Ë", "F", "G",
  "Ǵ", "H", "I", "J", "K", "L", "Ļ", "M", "N", "Ņ",
  "O", "P", "Q", "R", "Ŗ", "S", "Ş", "T", "Ŧ", "U",
  "V", "X", "Ẍ", "Y", "Z", "Ž",
];

/**
 * Human-readable Albanian alphabet — maps each internal character
 * to its display form (digraphs shown as two letters).
 * Used for display purposes and for the "natural" form users see.
 */
export const ALBANIAN_DISPLAY: Record<string, string> = {
  "Đ": "Dh", "đ": "dh",
  "Ǵ": "Gj", "ǵ": "gj",
  "Ļ": "Ll", "ļ": "ll",
  "Ņ": "Nj", "ņ": "nj",
  "Ŗ": "Rr", "ŗ": "rr",
  "Ş": "Sh", "ş": "sh",
  "Ŧ": "Th", "ŧ": "th",
  "Ẍ": "Xh", "ẍ": "xh",
  "Ž": "Zh", "ž": "zh",
};

/**
 * Normalization map: converts natural Albanian digraphs to internal
 * single-character representations. Ordered longest-first so "Sh"
 * is matched before "S".
 */
const DIGRAPH_TO_INTERNAL: [string, string, string][] = [
  // [uppercase-digraph, lowercase-digraph, internal-uppercase]
  ["Dh", "dh", "Đ"],
  ["Gj", "gj", "Ǵ"],
  ["Ll", "ll", "Ļ"],
  ["Nj", "nj", "Ņ"],
  ["Rr", "rr", "Ŗ"],
  ["Sh", "sh", "Ş"],
  ["Th", "th", "Ŧ"],
  ["Xh", "xh", "Ẍ"],
  ["Zh", "zh", "Ž"],
];

/**
 * Normalizes natural Albanian text by converting digraphs to their
 * internal single-character representations.
 *
 * Example: "Shkolla" → "Şkolla", "Përshëndetje" → "PërşëŅdetje"
 */
export function normalizeAlbanian(text: string): string {
  let result = "";
  let i = 0;
  while (i < text.length) {
    let matched = false;
    // Try 2-character digraphs first
    if (i + 1 < text.length) {
      const pair = text.slice(i, i + 2);
      for (const [upper, lower, internal] of DIGRAPH_TO_INTERNAL) {
        if (pair === upper) {
          result += internal;
          i += 2;
          matched = true;
          break;
        }
        if (pair === lower) {
          // Internal char is uppercase; lowercase version is the same char lowercased
          result += internal.toLowerCase();
          i += 2;
          matched = true;
          break;
        }
        // Title case: "Sh" → internal uppercase (treat as uppercase)
        // Already covered by uppercase check
      }
    }
    if (!matched) {
      result += text[i];
      i++;
    }
  }
  return result;
}

/**
 * Denormalizes internal single-character representations back to
 * natural Albanian digraphs for display.
 *
 * Example: "Şkolla" → "Shkolla"
 */
export function denormalizeAlbanian(text: string): string {
  let result = "";
  for (const ch of text) {
    const display = ALBANIAN_DISPLAY[ch];
    result += display ?? ch;
  }
  return result;
}

/**
 * The full Albanian alphabet for display — shows all 36 letters
 * in their natural (digraph) form for the Learn section.
 */
export const ALBANIAN_ALPHABET_DISPLAY: string[] = [
  "A", "B", "C", "Ç", "D", "Dh", "E", "Ë", "F", "G",
  "Gj", "H", "I", "J", "K", "L", "Ll", "M", "N", "Nj",
  "O", "P", "Q", "R", "Rr", "S", "Sh", "T", "Th", "U",
  "V", "X", "Xh", "Y", "Z", "Zh",
];

/** Map language keys to their alphabets and helpers. */
export const ALPHABETS: Record<string, string[]> = {
  english: ENGLISH_ALPHABET,
  albanian: ALBANIAN_ALPHABET_INTERNAL,
};

export type Language = keyof typeof ALPHABETS;

// ─── Helper: Normalize shift ────────────────────────────────────────────

/**
 * Normalizes a shift value into the range [0, alphabetSize).
 * Handles negative shifts (decrypt) and shifts larger than the alphabet.
 */
function normalizeShift(shift: number, alphabetSize: number): number {
  return ((shift % alphabetSize) + alphabetSize) % alphabetSize;
}

// ─── Helper: Case preservation ──────────────────────────────────────────

/**
 * Applies the case pattern of `source` onto `target`.
 * Both are expected to be single characters.
 */
function applyCase(source: string, target: string): string {
  if (source === source.toUpperCase() && source !== source.toLowerCase()) {
    return target.toUpperCase();
  }
  return target.toLowerCase();
}

// ─── Core Cipher Function ───────────────────────────────────────────────

/**
 * Applies a Caesar Cipher shift to the input text using the given alphabet.
 *
 * Algorithm (for English — single chars only):
 * 1. For each character in the input, find its index in the alphabet
 *    (case-insensitive lookup).
 * 2. Shift the index by `shift` positions, wrapping around.
 * 3. Preserve the original case in the output.
 * 4. Non-alphabet characters pass through unchanged.
 *
 * For Albanian, the input is first normalized (digraphs → single chars),
 * shifted, then denormalized for display. This ensures a correct roundtrip.
 *
 * @param text    - The input text to transform.
 * @param shift   - Number of positions to shift.
 *                  Positive = encrypt (forward), negative = decrypt (backward).
 * @param alphabet - The ordered alphabet array to use (single characters only).
 * @param language - Optional language key for normalization.
 * @returns The transformed text.
 */
export function caesarCipher(
  text: string,
  shift: number,
  alphabet: string[],
): string {
  const n = alphabet.length;
  if (n === 0) return text;

  const effectiveShift = normalizeShift(shift, n);

  // Build uppercase lookup map (all entries are single chars)
  const upperMap: Map<string, number> = new Map();
  for (let i = 0; i < n; i++) {
    upperMap.set(alphabet[i].toUpperCase(), i);
  }

  let result = "";
  for (const ch of text) {
    const upperCh = ch.toUpperCase();
    const idx = upperMap.get(upperCh);

    if (idx !== undefined) {
      // Shift the character
      const newIdx = (idx + effectiveShift) % n;
      const shiftedChar = alphabet[newIdx];
      result += applyCase(ch, shiftedChar);
    } else {
      // Non-alphabet character — pass through unchanged
      result += ch;
    }
  }

  return result;
}

/**
 * Convenience: encrypt = forward shift.
 * For Albanian, normalizes digraphs before shifting.
 */
export function encrypt(
  text: string,
  shift: number,
  alphabet: string[],
  language?: Language,
): string {
  const workingText = language === "albanian" ? normalizeAlbanian(text) : text;
  return caesarCipher(workingText, shift, alphabet);
}

/**
 * Convenience: decrypt = backward shift (negative).
 * Does NOT normalize — assumes the ciphertext is already in internal form.
 */
export function decrypt(
  text: string,
  shift: number,
  alphabet: string[],
  _language?: Language,
): string {
  return caesarCipher(text, -shift, alphabet);
}

// ─── Challenge Helpers ──────────────────────────────────────────────────

/** Harmless educational sample messages for challenges. */
const CHALLENGE_MESSAGES: Record<string, string[]> = {
  english: [
    "The eagle flies at dawn",
    "Knowledge is power",
    "Stay curious and keep learning",
    "Every expert was once a beginner",
    "Practice makes progress",
    "Ciphers hide messages in plain sight",
    "Cryptography is the art of secrets",
    "Think before you act",
    "Small steps lead to big journeys",
    "Learning never exhausts the mind",
  ],
  albanian: [
    "Shqiperia eshte e bukur",
    "Dituria eshte fuqi",
    "Mesimi eshte thesar",
    "Puna e sotme sjell sukses",
    "Shkolla eshte shtepia e dyte",
    "Gjuha shqipe eshte pasuri",
    "Celesi i suksesit eshte puna",
    "Leximi hap mendjen",
    "Fjala e mire cel dyert",
    "Njohuria te ben te lire",
  ],
};

/**
 * Generate a random challenge: picks a random message, applies a random shift
 * (1–alphabetSize-1), and returns both the encrypted text and the answer.
 */
export function generateChallenge(
  alphabet: string[],
  language?: Language,
): {
  plaintext: string;
  ciphertext: string;
  shift: number;
} {
  // Detect language based on alphabet length
  const lang = language ?? (alphabet.length === 26 ? "english" : "albanian");
  const messages = CHALLENGE_MESSAGES[lang] || CHALLENGE_MESSAGES.english;

  const plaintext = messages[Math.floor(Math.random() * messages.length)];
  // Random shift between 1 and alphabetSize-1 (inclusive)
  const shift = Math.floor(Math.random() * (alphabet.length - 1)) + 1;
  // Normalize Albanian plaintext before encrypting
  const workingText = lang === "albanian" ? normalizeAlbanian(plaintext) : plaintext;
  const ciphertext = caesarCipher(workingText, shift, alphabet);

  return { plaintext, ciphertext, shift };
}
