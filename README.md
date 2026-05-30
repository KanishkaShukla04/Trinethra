# Trinethra – Supervisor Feedback Analyzer

AI-assisted supervisor feedback analysis tool built for DeepThought's Trinethra platform.

## Overview

Trinethra is designed to help psychology interns and TPMs analyze supervisor feedback transcripts faster and more consistently.

The application accepts a supervisor transcript, sends it to a locally running LLM through Ollama, and generates a structured draft assessment that can be reviewed by a human evaluator.

The goal is not to replace human judgment but to reduce manual analysis time and improve consistency.

---

## Features

### Evidence Extraction

Identifies important supervisor statements and classifies them as:

* Positive
* Negative
* Neutral

### Rubric Scoring

Generates a suggested rubric score (1–10) with justification based on transcript evidence.

### KPI Mapping

Maps supervisor observations to relevant business KPIs.

### Gap Analysis

Detects important assessment areas not discussed in the transcript.

### Follow-up Question Generation

Suggests targeted questions for future supervisor interviews.

### Human Review Workflow

All outputs are presented as AI-generated suggestions requiring human validation.

---

## Tech Stack

### Frontend

* Next.js 15
* TypeScript
* Tailwind CSS

### Backend

* Next.js API Routes

### AI Layer

* Ollama
* Llama 3.2

---

## Architecture

Supervisor Transcript
↓
Next.js Frontend
↓
API Route (/api/analyze)
↓
Ollama Local API
↓
Llama 3.2
↓
Structured JSON Analysis
↓
Human Review Interface

---

## Setup Instructions

### 1. Clone Repository

```bash
git clone <repository-url>
cd trinethra
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Ollama

Download and install Ollama from:

https://ollama.com

### 4. Pull Model

```bash
ollama pull llama3.2
```

### 5. Verify Ollama

```bash
curl http://localhost:11434/api/tags
```

### 6. Run Application

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Design Challenges Addressed

### Challenge 1: Structured Output Reliability

LLMs frequently generate malformed JSON.

Approach:

* Enforced JSON-only responses
* Added JSON extraction logic
* Added response validation before rendering
* Added parsing fallback handling

### Challenge 2: Showing Uncertainty

AI-generated assessments should not be treated as final decisions.

Approach:

* Analysis is labelled as AI-generated
* Human review is required
* Findings are presented as suggestions rather than verdicts

---

## Demo Videos

### Application Demo

https://drive.google.com/file/d/1uz0qjfs_9APacgoiavLLgLfUrZ5gtDwE/view

### Code Walkthrough

https://drive.google.com/file/d/1J1KEVu5OV6qVjGNTWXMwEzwknVDA-GTe/view

---

## Future Improvements

* Confidence scoring for findings
* Editable evidence and rubric scores
* Side-by-side transcript and analysis view
* Transcript quote highlighting
* Multi-model evaluation support
* Analysis export (PDF/CSV)

---

## Why Llama 3.2?

Llama 3.2 provides:

* Good reasoning quality
* Fast local inference
* Low hardware requirements
* Reliable structured output generation

making it suitable for rapid transcript analysis workflows.

---

## Author

Kanishka Shukla
Software Developer Internship Assignment
DeepThought – Trinethra Module
