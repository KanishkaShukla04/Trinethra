"use client";

import { useState } from "react";
import type { AnalysisResult } from "./api/analyze/route";
import sampleTranscripts from "@/data/sample-transcripts.json";

type Status = "idle" | "loading" | "done" | "error";

const SCORE_COLOR: Record<string, string> = {
  "Non-Functional": "text-red-400",
  "Below Expectations": "text-orange-400",
  Functional: "text-yellow-400",
  Strong: "text-green-400",
  Exceptional: "text-emerald-400",
};

const TAG_STYLE: Record<string, string> = {
  positive: "bg-green-900 text-green-300 border border-green-700",
  negative: "bg-red-900 text-red-300 border border-red-700",
  neutral: "bg-gray-800 text-gray-300 border border-gray-600",
};

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [model, setModel] = useState("llama3.2");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [editedScore, setEditedScore] = useState<number | null>(null);
  const [acceptedEvidence, setAcceptedEvidence] = useState<Set<number>>(new Set());
  const [rejectedEvidence, setRejectedEvidence] = useState<Set<number>>(new Set());

  const runAnalysis = async () => {
    if (!transcript.trim()) return;
    setStatus("loading");
    setResult(null);
    setError("");
    setEditedScore(null);
    setAcceptedEvidence(new Set());
    setRejectedEvidence(new Set());

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, model }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unknown error");
        setStatus("error");
        return;
      }
      setResult(data.analysis);
      setStatus("done");
    } catch {
      setError("Network error. Is the app running?");
      setStatus("error");
    }
  };

  const toggleEvidence = (index: number, action: "accept" | "reject") => {
    const accepted = new Set(acceptedEvidence);
    const rejected = new Set(rejectedEvidence);
    if (action === "accept") {
      accepted.has(index) ? accepted.delete(index) : accepted.add(index);
      rejected.delete(index);
    } else {
      rejected.has(index) ? rejected.delete(index) : rejected.add(index);
      accepted.delete(index);
    }
    setAcceptedEvidence(accepted);
    setRejectedEvidence(rejected);
  };

  const displayScore = editedScore ?? result?.rubricScore ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">👁️</span>
          <h1 className="text-2xl font-bold tracking-tight">Trinethra</h1>
          <span className="text-xs bg-blue-900 text-blue-300 border border-blue-700 px-2 py-0.5 rounded-full">
            AI Draft — Requires Human Review
          </span>
        </div>
        <p className="text-gray-400 text-sm">
          Supervisor Feedback Analyzer · DeepThought PDGMS
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-300">
            Supervisor Transcript
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Model:</span>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="text-xs bg-gray-800 border border-gray-600 rounded px-2 py-1 text-gray-300"
            >
              <option value="llama3.2">llama3.2</option>
              <option value="mistral">mistral</option>
              <option value="phi3">phi3</option>
              <option value="gemma">gemma</option>
            </select>
          </div>
        </div>

        {/* Sample loaders */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {sampleTranscripts.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setTranscript(t.transcript)}
              className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 px-3 py-1 rounded-full transition"
            >
              Load Sample {i + 1} — {t.supervisor.split(",")[0]}
            </button>
          ))}
        </div>

        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={8}
          placeholder="Paste the supervisor transcript here, or load a sample above..."
          className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm text-gray-100 placeholder-gray-500 resize-none focus:outline-none focus:border-blue-500 transition"
        />

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-500">
            {transcript.length > 0 ? `${transcript.split(/\s+/).filter(Boolean).length} words` : "No transcript"}
          </span>
          <button
            onClick={runAnalysis}
            disabled={status === "loading" || !transcript.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold px-6 py-2 rounded-lg text-sm transition"
          >
            {status === "loading" ? "Analyzing…" : "Run Analysis"}
          </button>
        </div>
      </div>

      {/* Loading */}
      {status === "loading" && (
        <div className="text-center py-12 text-gray-400">
          <div className="animate-pulse text-4xl mb-3">👁️</div>
          <p className="text-sm">Sending to Ollama ({model})…</p>
          <p className="text-xs mt-1 text-gray-600">This may take 20-60 seconds depending on your hardware</p>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="bg-red-950 border border-red-700 text-red-300 rounded-xl p-4 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results */}
      {status === "done" && result && (
        <div className="space-y-5">
          <div className="bg-yellow-950 border border-yellow-700 text-yellow-300 rounded-xl p-3 text-xs flex items-start gap-2">
            <span>⚠️</span>
            <span>
              <strong>AI-Generated Draft — Human Review Required.</strong> All sections below are suggestions. Accept, reject, or edit before finalizing. Do not treat scores as verdicts.
            </span>
          </div>

          {/* Score Card */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm text-gray-300">📊 Rubric Score</h2>
              <span className="text-xs text-gray-500">AI Suggestion — Edit if needed</span>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <span className={`text-5xl font-bold ${SCORE_COLOR[result.rubricLabel] || "text-white"}`}>
                {displayScore}
              </span>
              <div>
                <div className={`text-sm font-semibold ${SCORE_COLOR[result.rubricLabel] || "text-white"}`}>
                  {result.rubricLabel}
                </div>
                <div className="text-xs text-gray-500">out of 10</div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-gray-500">Override:</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={editedScore ?? result.rubricScore}
                  onChange={(e) => setEditedScore(Number(e.target.value))}
                  className="w-14 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-center"
                />
              </div>
            </div>
            <p className="text-sm text-gray-300 bg-gray-800 rounded-lg p-3 leading-relaxed">
              {result.justification}
            </p>
          </div>

          {/* Evidence */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm text-gray-300">💬 Extracted Evidence</h2>
              <span className="text-xs text-gray-500">
                {acceptedEvidence.size} accepted · {rejectedEvidence.size} rejected
              </span>
            </div>
            <div className="space-y-3">
              {result.evidence.map((e, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-3 border transition ${
                    rejectedEvidence.has(i)
                      ? "opacity-40 border-gray-700 bg-gray-800"
                      : acceptedEvidence.has(i)
                      ? "border-green-700 bg-green-950"
                      : "border-gray-700 bg-gray-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-gray-200 italic mb-1">"{e.quote}"</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAG_STYLE[e.tag]}`}>
                          {e.tag}
                        </span>
                        <span className="text-xs text-gray-500">{e.dimension}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => toggleEvidence(i, "accept")}
                        className={`text-xs px-2 py-1 rounded transition ${
                          acceptedEvidence.has(i)
                            ? "bg-green-700 text-white"
                            : "bg-gray-700 text-gray-400 hover:bg-green-900 hover:text-green-300"
                        }`}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => toggleEvidence(i, "reject")}
                        className={`text-xs px-2 py-1 rounded transition ${
                          rejectedEvidence.has(i)
                            ? "bg-red-700 text-white"
                            : "bg-gray-700 text-gray-400 hover:bg-red-900 hover:text-red-300"
                        }`}
                      >
                        ✗
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KPI Mapping */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
            <h2 className="font-semibold text-sm text-gray-300 mb-3">🎯 KPI Mapping</h2>
            <div className="flex flex-wrap gap-2">
              {result.kpis.map((kpi, i) => (
                <span
                  key={i}
                  className="text-xs bg-blue-900 text-blue-300 border border-blue-700 px-3 py-1 rounded-full"
                >
                  {kpi}
                </span>
              ))}
              {result.kpis.length === 0 && (
                <span className="text-xs text-gray-500">No KPIs mapped</span>
              )}
            </div>
          </div>

          {/* Gap Analysis */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
            <h2 className="font-semibold text-sm text-gray-300 mb-3">🔍 Gap Analysis</h2>
            <p className="text-xs text-gray-500 mb-3">
              Assessment dimensions the transcript did NOT address:
            </p>
            <div className="space-y-2">
              {result.gaps.map((gap, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800 rounded-lg px-3 py-2"
                >
                  <span className="text-orange-400 text-xs">◉</span>
                  {gap}
                </div>
              ))}
              {result.gaps.length === 0 && (
                <span className="text-xs text-gray-500">No gaps detected</span>
              )}
            </div>
          </div>

          {/* Follow-up Questions */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
            <h2 className="font-semibold text-sm text-gray-300 mb-3">❓ Suggested Follow-up Questions</h2>
            <div className="space-y-3">
              {result.followUpQuestions.map((q, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-200 mb-1">
                    <span className="text-blue-400 font-medium mr-2">Q{i + 1}.</span>
                    {q.question}
                  </p>
                  <p className="text-xs text-gray-500">
                    Targets: <span className="text-gray-400">{q.targets}</span>
                  </p>
                </div>
              ))}
              {result.followUpQuestions.length === 0 && (
                <span className="text-xs text-gray-500">No questions generated</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
