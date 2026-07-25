# CipherLab — Caesar Cipher

An interactive educational web app that teaches the Caesar Cipher through hands-on encryption/decryption, practice challenges, and step-by-step explanations. Built for a student cybersecurity portfolio.

🔗 **Live site:** https://cipherlab-caesar.vercel.app/

## What It Is

CipherLab is a browser-only tool for learning about one of the oldest encryption techniques in history — the Caesar Cipher. Named after Julius Caesar, who used it to protect military correspondence over 2,000 years ago, this substitution cipher shifts each letter by a fixed number of positions through the alphabet.

## Features

- **Learn** — Interactive visual explanation of how the Caesar Cipher works, including alphabet shift visualization and a comparison of classical vs. modern encryption
- **Playground** — Encrypt and decrypt messages with adjustable shift values in real time
- **Challenge** — Test your skills by decrypting messages with unknown shift values
- **Explanation** — Step-by-step walkthrough showing exactly how each letter is transformed
- **Dual alphabet support** — Works with both English (A–Z) and Albanian (A–Zh) alphabets
- **Dark cyberpunk theme** — Polished dark UI with neon accents and responsive mobile-first layout
- **100% client-side** — All cipher logic runs in the browser; no accounts, no data storage, no backend

## Tech Stack

| Technology | Purpose |
|---|---|
| [React 19](https://react.dev) | UI components |
| [TypeScript](https://www.typescriptlang.org) | Type-safe code |
| [Vite](https://vitejs.dev) | Build tool & dev server |
| [Tailwind CSS 4](https://tailwindcss.com) | Styling |
| [TanStack Start](https://tanstack.com/start) | Framework (routing, SSR support) |
| [Bun](https://bun.sh) | Package manager & runtime |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.3+)

### Install & Run

```bash
# Clone the repository
git clone https://github.com/luedamera08/cipherlab-caesar.git
cd cipherlab-caesar

# Install dependencies
bun install

# Start the development server
bun run dev
```

The app will be available at https://cipherlab-caesar.vercel.app/

### Build for Production

```bash
bun run build
bun run start
```

## ⚠️ Security Disclaimer

**The Caesar Cipher is not secure for protecting real data.** It has only 25 possible keys — a modern computer can crack it in milliseconds. It is trivially vulnerable to frequency analysis and brute-force attacks.

This tool is designed **for educational purposes only**. Never use it for:
- Passwords or authentication
- Personal or financial information
- Any sensitive data requiring real confidentiality

For actual security needs, use modern encryption standards like AES-256, which are used by banks, militaries, and HTTPS.

## Project Structure

```
src/
├── components/
│   └── CipherLab.tsx    # Main application component (all 4 sections)
├── lib/
│   └── cipher.ts        # Caesar Cipher logic (encrypt, decrypt, alphabet handling)
├── routes/
│   ├── __root.tsx       # Root layout with header, nav, and footer
│   └── index.tsx        # Landing page route
├── router.tsx           # TanStack Router configuration
├── db.ts                # Database helper (unused for cipher features)
└── styles/
    └── app.css          # Tailwind imports and global styles
```

## License

This project is built as a portfolio piece for educational and demonstrative purposes.
