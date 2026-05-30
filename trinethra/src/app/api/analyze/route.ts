import { NextRequest, NextResponse } from "next/server";
import { buildPrompt } from "@/lib/prompt";

export interface AnalysisResult {
  evidence: Array<{
    quote: string;
    tag: "positive" | "negative" | "neutral";
    dimension: string;
  }>;
  rubricScore: number;
  rubricLabel: string;
  justification: string;
  kpis: string[];
  gaps: string[];
  followUpQuestions: Array<{
    question: string;
    targets: string;
  }>;
}

function extractJSON(raw: string): string {
  // Try to find JSON block between { and last }
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return raw.slice(start, end + 1);
  }
  return raw;
}

function parseAnalysis(raw: string): AnalysisResult {
  let cleaned = raw.trim();

  // Remove markdown code fences if present
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

  // Extract JSON block
  cleaned = extractJSON(cleaned);

  try {
    const parsed = JSON.parse(cleaned);

    // Validate required fields exist
    const result: AnalysisResult = {
      evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [],
      rubricScore: typeof parsed.rubricScore === "number" ? parsed.rubricScore : 0,
      rubricLabel: parsed.rubricLabel || "Unknown",
      justification: parsed.justification || "No justification provided.",
      kpis: Array.isArray(parsed.kpis) ? parsed.kpis : [],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
      followUpQuestions: Array.isArray(parsed.followUpQuestions)
        ? parsed.followUpQuestions
        : [],
    };

    return result;
  } catch {
    throw new Error(`Failed to parse LLM response as JSON. Raw response: ${cleaned.slice(0, 200)}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { transcript, model = "llama3.2" } = await req.json();

    if (!transcript || transcript.trim().length < 10) {
      return NextResponse.json(
        { error: "Transcript is too short or empty." },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(transcript);

    // Call Ollama
    let ollamaResponse;
    try {
      ollamaResponse = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0.2, // Low temperature for consistent structured output
            num_predict: 2000,
          },
        }),
      });
    } catch {
      return NextResponse.json(
        {
          error:
            "Cannot connect to Ollama. Make sure Ollama is running: run `ollama serve` in your terminal.",
        },
        { status: 503 }
      );
    }

    if (!ollamaResponse.ok) {
      return NextResponse.json(
        { error: `Ollama returned an error: ${ollamaResponse.statusText}` },
        { status: 502 }
      );
    }

    const ollamaData = await ollamaResponse.json();
    const rawText: string = ollamaData.response || "";

    // Parse with fallback error
    let analysis: AnalysisResult;
    try {
      analysis = parseAnalysis(rawText);
    } catch (parseError: unknown) {
      const message =
        parseError instanceof Error ? parseError.message : "Unknown parse error";
      return NextResponse.json(
        {
          error: `LLM response could not be parsed. ${message}`,
          raw: rawText.slice(0, 500),
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ analysis });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
