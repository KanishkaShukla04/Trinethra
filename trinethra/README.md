# Trinethra — Supervisor Feedback Analyzer

A web tool that takes a supervisor transcript about a DeepThought Fellow, runs it through a local LLM via Ollama, and produces a structured assessment draft for a psychology intern to review, edit, and finalize.

> **The AI suggests. The human decides.** Every section is a draft — not a verdict.

---

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- [Ollama](https://ollama.com) installed and running

### 1. Install Ollama and pull a model

```bash
# Download from https://ollama.com and install
# Then pull the model:
ollama pull llama3.2

# Start Ollama (runs as background service after install)
ollama serve

# Test it:
curl http://localhost:11434/api/generate -d '{"model":"llama3.2","prompt":"hello","stream":false}'
```

### 2. Clone and install the app

```bash
git clone <your-repo-url>
cd trinethra
npm install
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Use the app

1. Paste a supervisor transcript (or click "Load Sample" to use one of the 3 included samples)
2. Click **Run Analysis**
3. Review the AI-generated draft — accept or reject each evidence quote
4. Override the score if needed
5. Use the gap analysis and follow-up questions to prepare for the next call

---

## Model Used

**llama3.2 (3B)** — chosen because:
- Runs on most laptops (8GB+ RAM)
- Fast enough for a 10-minute workflow target
- Follows structured JSON instructions reliably
- Can swap to `mistral` or `phi3` from the UI dropdown

---

## Architecture

```
Browser (Next.js frontend)
        ↓ POST /api/analyze
Next.js API Route (backend)
        ↓ POST http://localhost:11434/api/generate
Ollama (local LLM)
        ↓ JSON response
API Route parses + validates
        ↓
Frontend renders analysis cards
```

- **Frontend**: Next.js 15 + Tailwind CSS — single page with transcript input and analysis output
- **Backend**: Next.js API Route (`/api/analyze`) handles Ollama call, JSON parsing, and error handling
- **LLM**: Ollama running locally — no cloud APIs, no API keys, no cost
- **Data**: `rubric.json` and `sample-transcripts.json` loaded directly into the app

---

## Design Challenges Tackled

### Challenge 2: Structured Output Reliability

LLMs don't always return clean JSON. My approach:
1. **Temperature 0.2** — lower temperature = more consistent formatting
2. **Explicit JSON schema in prompt** — model is shown exact field names and types
3. **Code fence stripping** — regex removes ```json fences before parsing
4. **JSON block extraction** — finds first `{` and last `}` to handle extra commentary
5. **Retry-friendly errors** — if parse fails, the error message is surfaced to the user with the first 500 chars of raw output so they can debug

### Challenge 4: Showing Uncertainty (Automation Bias Prevention)

The UI is designed so the intern never forgets they're reviewing a draft:
1. **Yellow warning banner** at the top of every result: "AI-Generated Draft — Human Review Required"
2. **Every section header** says "AI Suggestion" or "Requires Human Review"
3. **Accept/Reject buttons on each evidence quote** — forces active engagement
4. **Score override field** — intern can change the score directly without friction
5. **Label says "Draft"** — never "Score" or "Result"

---

## What I'd Improve With More Time

1. **Side-by-side view** — transcript on the left, analysis on the right, so the intern can verify quotes without scrolling
2. **Quote highlighting** — click an evidence quote and see it highlighted in the original transcript
3. **Multi-prompt pipeline** — separate Ollama calls for evidence extraction vs. scoring vs. gap analysis for better quality on each step
4. **Confidence indicator** — show when the model's score is near a boundary (e.g., 5-6) vs. confident (e.g., 2 or 9)
5. **Export to PDF** — finalized assessments exported as a report for the TPM

---

## Commit History

The repo follows incremental development:
```
git log --oneline
```
Shows staged commits: project init → transcript input UI → Ollama integration → JSON parsing → analysis cards → review workflow → README

---

## Folder Structure

```
trinethra/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main UI
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Tailwind
│   │   └── api/analyze/
│   │       └── route.ts          # Ollama API integration + JSON parsing
│   ├── data/
│   │   ├── rubric.json           # 1-10 rubric + assessment dimensions
│   │   └── sample-transcripts.json  # 3 test transcripts
│   └── lib/
│       └── prompt.ts             # Prompt builder with rubric + KPI context
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

---

## Assumptions Made

- Ollama runs at `http://localhost:11434` (default port)
- No authentication required — this is an internal tool
- Desktop-only layout (no mobile responsiveness needed per spec)
- Sample transcripts are representative of real supervisor call styles
