"use client";

import { useMemo, useState } from "react";
import {
  AI_KNOWLEDGE_STATS,
  AI_MASTER_QUOTE_DRAFT,
  AI_PRODUCT_RECOMMENDATIONS,
  answerSmartHiveAiQuery,
} from "@/lib/experience/ai";
import { useAiAssistantStore, useSelectionStore } from "@/lib/experience/stores";
import type { AiAssistantResponse, AiVisualSelectionKind } from "@/types/experience";
import styles from "@/styles/experience/experience.module.css";

const QUICK_PROMPTS = [
  "Recommend products",
  "Build quotation",
  "Calculate savings",
  "Explain automation",
  "Find devices",
  "Compare products",
] as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatLabel(value: string) {
  return value.replace(/-/g, " ");
}

function selectionPayload(kind: string, id: string | null): { readonly kind: AiVisualSelectionKind; readonly id: string | null } {
  if (kind === "room" || kind === "device") return { kind, id };
  return { kind: "none", id: null };
}

function ResponseCard({ response }: { readonly response: AiAssistantResponse }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/15 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold">{response.title}</div>
          <div className={`${styles.muted} mt-0.5 text-[10px] capitalize`}>
            {formatLabel(response.intent)} / {response.visualContext.label}
          </div>
        </div>
        <span className="rounded-full bg-sky-300/15 px-2 py-1 text-[9px] font-semibold uppercase text-sky-100">
          {Math.round(response.confidence * 100)}%
        </span>
      </div>
      <p className={`${styles.muted} mt-2 text-[10px] leading-relaxed`}>{response.summary}</p>
      <ul className={`${styles.muted} mt-2 space-y-1 text-[10px]`}>
        {response.bullets.slice(0, 5).map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
      {response.recommendations.length > 0 ? (
        <div className="mt-3 rounded-xl border border-sky-200/15 bg-sky-200/10 p-2">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em]">AI Recommendations</div>
          <div className={`${styles.muted} mt-1 text-[10px]`}>
            {response.recommendations.slice(0, 3).map((recommendation) => recommendation.title).join(" / ")}
          </div>
        </div>
      ) : null}
      {response.savingsEstimate ? (
        <div className="mt-3 rounded-xl border border-emerald-200/15 bg-emerald-200/10 p-2 text-[10px]">
          <div className="font-medium">Savings: {formatCurrency(response.savingsEstimate.yearlySavingsUsd)}/yr</div>
          <div className={styles.muted}>{response.savingsEstimate.savingsPercent}% projected optimization.</div>
        </div>
      ) : null}
      {response.quoteDraft ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/15 p-2 text-[10px]">
          <div className="font-medium">Quote Draft: {formatCurrency(response.quoteDraft.totalCost)}</div>
          <div className={styles.muted}>{response.quoteDraft.lineItems.length} line items / existing quote engine untouched.</div>
        </div>
      ) : null}
    </article>
  );
}

export function AiAssistantPanel() {
  const selectionKind = useSelectionStore((state) => state.kind);
  const selectedId = useSelectionStore((state) => state.selectedId);
  const messages = useAiAssistantStore((state) => state.messages);
  const ask = useAiAssistantStore((state) => state.ask);
  const explainSelection = useAiAssistantStore((state) => state.explainSelection);
  const clear = useAiAssistantStore((state) => state.clear);
  const [query, setQuery] = useState("");
  const selection = useMemo(() => selectionPayload(selectionKind, selectedId), [selectionKind, selectedId]);
  const visualResponse = useMemo(() => answerSmartHiveAiQuery(selection.kind === "none" ? "Explain the digital twin" : `Explain this ${selection.kind}`, selection), [selection]);

  const submitQuery = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    ask(trimmed, selection);
    setQuery("");
  };

  return (
    <div className="mt-4 rounded-2xl border border-sky-300/20 bg-sky-300/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium">SmartHive AI Assistant</div>
          <div className={`${styles.muted} text-[10px]`}>
            {AI_KNOWLEDGE_STATS.roomCount} rooms / {AI_KNOWLEDGE_STATS.smartDeviceCount} devices / {AI_KNOWLEDGE_STATS.automationRuleCount} rules
          </div>
        </div>
        <span className="rounded-full bg-emerald-300/15 px-2 py-1 text-[9px] font-semibold uppercase text-emerald-100">Voice Ready</span>
      </div>

      <section className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Visual AI Context</div>
        <div className="mt-1 text-xs font-semibold">{visualResponse.visualContext.label}</div>
        <p className={`${styles.muted} mt-1 text-[10px] leading-relaxed`}>{visualResponse.summary}</p>
        <button
          type="button"
          onClick={() => explainSelection(selection)}
          className="mt-2 w-full rounded-xl border border-sky-200/30 bg-sky-200/10 px-3 py-2 text-[10px] font-semibold uppercase text-sky-100 hover:bg-sky-200/15"
        >
          Explain Selection
        </button>
      </section>

      <div className="mt-3 flex gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submitQuery();
          }}
          placeholder="Ask about rooms, devices, quotes, savings..."
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[10px] outline-none placeholder:text-white/35 focus:border-sky-300/40"
        />
        <button type="button" onClick={submitQuery} className="rounded-xl border border-white/10 bg-white px-3 py-2 text-[10px] font-semibold uppercase text-slate-950">
          Ask
        </button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => ask(prompt, selection)}
            className="rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[9px] font-semibold uppercase text-white/70 hover:bg-white/10"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
        <div className="rounded-xl border border-white/10 bg-black/15 p-2">
          <div className={styles.muted}>Master Quote</div>
          <div>{formatCurrency(AI_MASTER_QUOTE_DRAFT.totalCost)}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/15 p-2">
          <div className={styles.muted}>AI Recommendations</div>
          <div>{AI_PRODUCT_RECOMMENDATIONS.length}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em]">Conversation</div>
        <button type="button" onClick={clear} className={`${styles.muted} text-[10px] hover:text-white`}>Reset</button>
      </div>

      <div className="mt-2 max-h-80 space-y-2 overflow-y-auto pr-1">
        {messages.map((message) => (
          <ResponseCard key={`${message.id}-${message.query}`} response={message} />
        ))}
      </div>
    </div>
  );
}
