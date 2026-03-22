# FlowBridge

A full-stack cash flow statement converter between IFRS and US GAAP accounting standards. Paste or upload a cash flow statement in one standard, and FlowBridge converts it to the other — highlighting key classification differences like interest, dividends, leases, and taxes.

## Features

- **IFRS ↔ US GAAP conversion** with detailed reclassification of line items
- **AI-powered analysis** using Google Gemini for intelligent parsing and conversion
- **Confidence scoring** with rule-based validation (parsing, translation, reconciliation)
- **Net Change in Cash reconciliation** comparing both standards side-by-side
- **Image OCR input** via Tesseract.js for scanned statements
- **Export** to PDF and Excel
- **Currency support** for USD, EUR, GBP, JPY, INR, CAD, AUD

## Tech Stack

### Frontend
- [React 19](https://react.dev/) — UI framework
- [Vite 8](https://vite.dev/) — Build tool
- [Tailwind CSS v4](https://tailwindcss.com/) — Utility-first CSS
- [shadcn/ui v4](https://ui.shadcn.com/) — Component library (built on [Base UI](https://base-ui.com/))
- [Lucide React](https://lucide.dev/) — Icons
- [Recharts](https://recharts.org/) — Charts
- [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) — PDF export
- [SheetJS (xlsx)](https://sheetjs.com/) — Excel export
- [Tesseract.js](https://tesseract.projectnaptha.com/) — OCR for image uploads

### Backend
- [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/) — API server
- [Google Gemini API](https://ai.google.dev/) (`@google/generative-ai`) — AI conversion engine
- [Multer](https://github.com/expressjs/multer) — File upload handling
- [pdf-parse](https://github.com/nicblue/pdf-parse) — PDF text extraction

### Development Tools
- [Claude Code](https://claude.ai/claude-code) by [Anthropic](https://www.anthropic.com/) — AI-assisted development
- [ESLint](https://eslint.org/) — Linting
- [Nodemon](https://nodemon.io/) — Dev server auto-restart

## Getting Started

### Prerequisites
- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### Setup

```bash
# Clone the repo
git clone <your-repo-url>
cd flowbridge

# Install dependencies
cd server && npm install
cd ../client && npm install

# Configure environment
cp server/.env.example server/.env
# Add your GEMINI_API_KEY to server/.env

# Start the backend (port 3001)
cd server && npm run dev

# Start the frontend (port 5173)
cd ../client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `GEMINI_API_KEY` | `server/.env` | Google Gemini API key |
| `VITE_API_URL` | `client/.env` | Backend URL (defaults to `/api` in dev via proxy) |

## Project Structure

```
flowbridge/
├── client/          # React frontend
│   └── src/
│       ├── components/
│       │   ├── ui/        # shadcn/ui components
│       │   ├── input/     # Input panel, text paste, OCR, direction selector
│       │   ├── output/    # Output panel, cash flow table, diff view, confidence
│       │   ├── layout/    # Header, sidebar
│       │   └── shared/    # Error banner, loading spinner, drag-drop zone
│       ├── api/           # API client
│       └── utils/         # Formatting helpers
├── server/          # Express backend
│   ├── routes/      # API routes
│   ├── converters/  # Gemini client, prompt builder
│   ├── parsers/     # PDF, CSV, image parsers
│   └── validators/  # Confidence scoring
└── README.md
```

## License

MIT
