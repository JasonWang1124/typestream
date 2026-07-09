import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Sentence } from "@/lib/sentences";

export type CharStatus = "correct" | "wrong" | "pending";

export interface TypingState {
  idx: number;
  typed: string[];
  target: string;
  statuses: CharStatus[];
  isComplete: boolean;
  isPerfect: boolean;
  wpm: number;
  accuracy: number;
  elapsed: number;
  progress: number; // 0..1
  done: boolean;
  typeChar: (c: string) => void;
  backspace: () => void;
  next: () => void;
  reset: () => void;
}

export function useTyping(sentences: Sentence[]): TypingState {
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState<string[]>([]);
  const [cumCorrect, setCumCorrect] = useState(0);
  const [cumKeys, setCumKeys] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);

  const startedRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const target = sentences[idx]?.text ?? "";

  const statuses = useMemo<CharStatus[]>(
    () =>
      Array.from(target).map((c, i) => {
        if (i >= typed.length) return "pending";
        return typed[i] === c ? "correct" : "wrong";
      }),
    [target, typed]
  );

  const isComplete = target.length > 0 && typed.length >= target.length;
  const isPerfect = isComplete && typed.every((c, i) => c === target[i]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const ensureTimer = useCallback(() => {
    if (startedRef.current === null) {
      startedRef.current = Date.now();
      timerRef.current = setInterval(() => {
        if (startedRef.current !== null) {
          setElapsed((Date.now() - startedRef.current) / 1000);
        }
      }, 500);
    }
  }, []);

  // clean up the interval on unmount
  useEffect(() => stopTimer, [stopTimer]);

  const typeChar = useCallback(
    (c: string) => {
      if (typed.length >= target.length) return;
      ensureTimer();
      const expected = target[typed.length];
      setCumKeys((k) => k + 1);
      if (c === expected) setCumCorrect((n) => n + 1);
      setTyped((prev) => [...prev, c]);
    },
    [typed.length, target, ensureTimer]
  );

  const backspace = useCallback(() => {
    if (typed.length === 0) return;
    setTyped((prev) => prev.slice(0, -1));
    setCumKeys((k) => k + 1);
  }, [typed.length]);

  const next = useCallback(() => {
    if (idx + 1 >= sentences.length) {
      stopTimer();
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setTyped([]);
  }, [idx, sentences.length, stopTimer]);

  const reset = useCallback(() => {
    stopTimer();
    startedRef.current = null;
    setIdx(0);
    setTyped([]);
    setCumCorrect(0);
    setCumKeys(0);
    setElapsed(0);
    setDone(false);
  }, [stopTimer]);

  const wpm =
    elapsed <= 0 || cumCorrect <= 0 ? 0 : Math.round(cumCorrect / 5 / (elapsed / 60));
  const accuracy = cumKeys === 0 ? 100 : Math.round((cumCorrect / cumKeys) * 100);
  const progress = sentences.length === 0 ? 0 : (idx + 1) / sentences.length;

  return {
    idx,
    typed,
    target,
    statuses,
    isComplete,
    isPerfect,
    wpm,
    accuracy,
    elapsed,
    progress,
    done,
    typeChar,
    backspace,
    next,
    reset,
  };
}
