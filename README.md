# FlowBridge

A full-stack cash flow statement converter between IFRS and US GAAP standards.

## Features

- Convert cash flow statements between IFRS and US GAAP
- AI-powered conversion using Google Gemini API
- Rule-based confidence scoring
- Image upload with OCR support (Tesseract.js)
- Export to PDF and Excel
- Currency selection (USD, EUR, GBP, JPY, INR)
- Side-by-side diff view of changes
- Net Change in Cash reconciliation

## Tech Stack

**Client:** React 19, Vite 8, Tailwind CSS v4, shadcn/ui

**Server:** Node.js, Express, Google Gemini API

## Getting Started

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Set up environment variables
# Add your Gemini API key to server/.env
GEMINI_API_KEY=your_key_here

# Run the server
cd server && node index.js

# Run the client (in a separate terminal)
cd client && npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:3001`.
