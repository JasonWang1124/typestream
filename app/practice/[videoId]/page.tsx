"use client";

import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import ThemeToggle from "@/components/ThemeToggle";
import { useTyping } from "@/hooks/useTyping";
import type { Sentence } from "@/lib/sentences";
import styles from "./practice.module.css";

function Practice() {
  const params = useParams<{ videoId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoId = params.videoId;

  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [title, setTitle] = useState(searchParams.get("title") || "跟著字幕打字");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // fetch the real transcript for this video (cached per session)
  useEffect(() => {
    let alive = true;
    const cacheKey = `st_${videoId}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        setSentences(parsed.sentences);
        if (parsed.title) setTitle(parsed.title);
        setLoading(false);
        return;
      }
    } catch {
      // ignore cache errors
    }

    setLoading(true);
    fetch("/api/transcript", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        lang: "en",
      }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "無法載入字幕");
        return data;
      })
      .then((data) => {
        if (!alive) return;
        setSentences(data.sentences);
        if (data.title) setTitle(data.title);
        setLoading(false);
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(data));
        } catch {
          // storage may be full / unavailable
        }
      })
      .catch((e) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "無法載入字幕");
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [videoId]);

  const {
    idx,
    typed,
    target,
    statuses,
    isPerfect,
    wpm,
    accuracy,
    progress,
    done,
    typeChar,
    backspace,
    next,
    reset,
  } = useTyping(sentences);

  const typeAreaRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLInputElement>(null);
  const composingRef = useRef(false);
  const prevPerfect = useRef(false);
  const [caret, setCaret] = useState({ x: 0, y: 0, h: 0, show: false });

  const focusCapture = useCallback(() => {
    captureRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!loading && !error) focusCapture();
  }, [loading, error, focusCapture]);

  const onCaptureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (composingRef.current) return;
    const v = e.target.value;
    for (const ch of v) {
      if (ch === "\n") next();
      else typeChar(ch);
    }
    e.target.value = "";
  };
  const onCaptureKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      backspace();
    } else if (e.key === "Enter") {
      e.preventDefault();
      next();
    }
  };

  useEffect(() => {
    if (isPerfect && !prevPerfect.current) {
      prevPerfect.current = true;
      const timer = setTimeout(() => next(), 240);
      return () => clearTimeout(timer);
    }
    if (!isPerfect) prevPerfect.current = false;
  }, [isPerfect, next]);

  // smooth caret: measure the current character's position each keystroke
  useLayoutEffect(() => {
    const area = typeAreaRef.current;
    if (!area) return;
    const el = area.querySelector<HTMLElement>(`[data-ci="${typed.length}"]`);
    if (!el) {
      setCaret((c) => ({ ...c, show: false }));
      return;
    }
    const ar = area.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setCaret({ x: r.left - ar.left, y: r.top - ar.top, h: r.height, show: true });
  }, [typed, target, idx]);

  const renderChar = (i: number) => {
    const status = statuses[i];
    const c = target[i];
    const shown = status === "wrong" ? typed[i] ?? c : c;
    const isSpace = shown === " ";
    const cls =
      status === "correct"
        ? `${styles.ch} ${styles.correct}`
        : status === "wrong"
        ? `${styles.ch} ${styles.wrong}${isSpace ? ` ${styles.wrongSpace}` : ""}`
        : `${styles.ch} ${styles.pending}`;
    return (
      <span key={i} data-ci={i} className={cls}>
        {isSpace ? " " : shown}
      </span>
    );
  };

  const renderSentence = () => {
    const tokens = target.match(/(\s+|\S+)/g) ?? [];
    let gi = 0;
    const out = tokens.map((tok, ti) => {
      const isSpace = /\s/.test(tok);
      const chars = [];
      for (let k = 0; k < tok.length; k++) {
        chars.push(renderChar(gi));
        gi += 1;
      }
      return (
        <span key={`t${ti}`} className={isSpace ? styles.space : styles.word}>
          {chars}
        </span>
      );
    });
    out.push(
      <span key="end" data-ci={target.length} className={styles.endMark}>
        {"​"}
      </span>
    );
    return out;
  };

  const total = sentences.length;

  const header = (
    <header className={styles.topbar}>
      <span className={`${styles.logo} mono`}>
        <span className={styles.logoDot} />
        typestream
      </span>
      <span className={styles.vidTitle}>{title}</span>
      <div className={styles.topActions}>
        <ThemeToggle />
        <button
          className={`${styles.exit} mono`}
          onClick={(e) => {
            e.stopPropagation();
            router.push("/");
          }}
        >
          esc
        </button>
      </div>
    </header>
  );

  if (loading) {
    return (
      <div className={styles.wrap}>
        {header}
        <div className={styles.statusScreen}>
          <div className={styles.spinner} />
          <p className={`${styles.statusText} mono`}>載入字幕中…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrap}>
        {header}
        <div className={styles.statusScreen}>
          <p className={`${styles.errorText} mono`}>{error}</p>
          <button className={`${styles.newBtn} mono`} onClick={() => router.push("/")}>
            換一部
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap} onClick={focusCapture}>
      {header}

      <div className={styles.stage}>
        <div className={styles.videoCol}>
          <div className={styles.videoPanel}>
            <VideoPlayer videoId={videoId} />
          </div>
        </div>

        <div className={styles.typeCol}>
          <div className={`${styles.stats} mono`}>
            <div className={styles.metric}>
              <span className={styles.metricNum}>{wpm}</span>
              <span className={styles.metricLbl}>wpm</span>
            </div>
            <div className={styles.metricDivider} />
            <div className={styles.metric}>
              <span className={styles.metricNum}>{accuracy}</span>
              <span className={styles.metricLbl}>acc</span>
            </div>
            <div className={styles.metricDivider} />
            <div className={styles.metric}>
              <span className={styles.metricNum}>
                {idx + 1}
                <span className={styles.metricFrac}>/{total}</span>
              </span>
              <span className={styles.metricLbl}>line</span>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
            </div>
          </div>

          <div className={styles.typeCard}>
            <div className={`${styles.typeArea} mono`} ref={typeAreaRef}>
              {idx > 0 && (
                <div className={`${styles.line} ${styles.lineDone}`}>
                  {sentences[idx - 1].text}
                </div>
              )}
              <div className={styles.line}>
                {renderSentence()}
                {caret.show && (
                  <span
                    className={styles.caret}
                    aria-hidden="true"
                    style={{
                      transform: `translate(${caret.x}px, ${caret.y}px)`,
                      height: caret.h,
                    }}
                  />
                )}
              </div>
              {idx + 1 < total && (
                <div className={`${styles.line} ${styles.lineNext}`}>
                  {sentences[idx + 1].text}
                </div>
              )}
            </div>

            <div className={`${styles.hint} mono`}>
              <span>
                <kbd>enter</kbd> next
              </span>
              <span>
                <kbd>⌫</kbd> fix
              </span>
            </div>
          </div>
        </div>
      </div>

      {done && (
        <div className={styles.doneOverlay} onClick={(e) => e.stopPropagation()}>
          <div className={styles.doneCard}>
            <span className={`${styles.doneLabel} mono`}>session complete</span>
            <div className={styles.doneStats}>
              <div className={styles.doneMetric}>
                <span className={`${styles.doneNum} mono`}>{wpm}</span>
                <span className={`${styles.doneLbl} mono`}>wpm</span>
              </div>
              <div className={styles.doneMetric}>
                <span className={`${styles.doneNum} mono`}>{accuracy}</span>
                <span className={`${styles.doneLbl} mono`}>accuracy</span>
              </div>
            </div>
            <div className={styles.doneActions}>
              <button className={`${styles.againBtn} mono`} onClick={reset}>
                Type again
              </button>
              <button className={`${styles.newBtn} mono`} onClick={() => router.push("/")}>
                New video
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={captureRef}
        className={styles.capture}
        onChange={onCaptureChange}
        onKeyDown={onCaptureKeyDown}
        onCompositionStart={() => (composingRef.current = true)}
        onCompositionEnd={(e) => {
          composingRef.current = false;
          e.currentTarget.value = "";
        }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        inputMode="text"
        aria-hidden="true"
      />
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className={styles.wrap} />}>
      <Practice />
    </Suspense>
  );
}
