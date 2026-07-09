"use client";

import { Suspense, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import ThemeToggle from "@/components/ThemeToggle";
import { useTyping } from "@/hooks/useTyping";
import { DEMO_SENTENCES } from "@/lib/sentences";
import styles from "./practice.module.css";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function Practice() {
  const params = useParams<{ videoId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoId = params.videoId;
  const title = searchParams.get("title") || "跟著字幕打字";

  const t = useTyping(DEMO_SENTENCES);
  const {
    idx,
    typed,
    target,
    statuses,
    isComplete,
    isPerfect,
    wpm,
    accuracy,
    progress,
    done,
    typeChar,
    backspace,
    next,
    reset,
  } = t;

  const typeAreaRef = useRef<HTMLDivElement>(null);
  const wpmRef = useRef<HTMLDivElement>(null);
  const prevPerfect = useRef(false);

  // keyboard input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        backspace();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        next();
        return;
      }
      if (e.key.length === 1) {
        e.preventDefault();
        typeChar(e.key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, backspace, next, typeChar]);

  // perfect line -> spark burst + auto advance
  useEffect(() => {
    if (isPerfect && !prevPerfect.current) {
      prevPerfect.current = true;
      if (!prefersReducedMotion()) sparkBurst(typeAreaRef.current);
      const timer = setTimeout(() => next(), 260);
      return () => clearTimeout(timer);
    }
    if (!isPerfect) prevPerfect.current = false;
  }, [isPerfect, next]);

  // little bump on the wpm number as it changes
  useEffect(() => {
    const el = wpmRef.current;
    if (!el || prefersReducedMotion()) return;
    el.classList.remove(styles.bump);
    void el.offsetWidth;
    el.classList.add(styles.bump);
  }, [wpm]);

  const charClass = (status: string, wrongSpace = false) => {
    if (status === "correct") return `${styles.ch} ${styles.correct}`;
    if (status === "wrong")
      return `${styles.ch} ${styles.wrong}${wrongSpace ? ` ${styles.wrongSpace}` : ""}`;
    return `${styles.ch} ${styles.pending}`;
  };

  const renderChar = (i: number) => {
    const status = statuses[i];
    const c = target[i];
    const isCaret = i === typed.length;
    // on a mistake, show the character the user actually typed (monkeytype-style)
    const shown = status === "wrong" ? typed[i] ?? c : c;
    const isSpaceGlyph = shown === " ";
    return (
      <span
        key={i}
        className={charClass(status, status === "wrong" && isSpaceGlyph)}
        data-correct={status === "correct" ? "1" : undefined}
      >
        {isCaret && <span className={styles.caret} aria-hidden="true" />}
        {isSpaceGlyph ? " " : shown}
      </span>
    );
  };

  // group chars into words so a word never breaks mid-way; wraps happen at spaces
  const renderSentence = () => {
    const tokens = target.match(/(\s+|\S+)/g) ?? [];
    let gi = 0;
    return tokens.map((tok, ti) => {
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
  };

  const total = DEMO_SENTENCES.length;

  return (
    <div className={styles.wrap}>
      <header className={styles.topbar}>
        <span className={styles.brand}>
          <span className="gradText">TypeStream</span>
        </span>
        <span className={styles.divider} />
        <span className={styles.vidTitle}>{title}</span>
        <div className={styles.topActions}>
          <ThemeToggle />
          <button className={styles.exit} onClick={() => router.push("/")}>
            ← 換一部
          </button>
        </div>
      </header>

      <div className={styles.stage}>
        <div className={styles.videoPanel}>
          <VideoPlayer videoId={videoId} />
        </div>

        <div className={styles.right}>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div ref={wpmRef} className={`${styles.num} mono`}>
                {wpm}
              </div>
              <div className={styles.lbl}>WPM</div>
            </div>
            <div className={styles.stat}>
              <div className={`${styles.num} mono`}>
                {accuracy}
                <span className={styles.pct}>%</span>
              </div>
              <div className={styles.lbl}>正確率</div>
            </div>
            <div className={styles.stat}>
              <div className={`${styles.num} mono`}>
                {idx + 1}
                <span className={styles.frac}>/{total}</span>
              </div>
              <div className={styles.lbl}>進度</div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className={styles.typeCard}>
            <div className={`${styles.typeArea} mono`} ref={typeAreaRef}>
              {idx > 0 && (
                <span className={`${styles.sent} ${styles.doneSent}`}>
                  {DEMO_SENTENCES[idx - 1].text}
                </span>
              )}

              <span className={styles.sent}>
                {renderSentence()}
                {isComplete && (
                  <span className={`${styles.ch} ${styles.pending}`}>
                    <span className={styles.caret} aria-hidden="true" />
                    {" "}
                  </span>
                )}
              </span>

              {idx + 1 < total && (
                <span className={`${styles.sent} ${styles.upcoming}`}>
                  {DEMO_SENTENCES[idx + 1].text}
                </span>
              )}
            </div>

            <div className={styles.hint}>
              <span>
                <kbd>字母</kbd> 打字
              </span>
              <span>
                <kbd>Enter</kbd> 下一句
              </span>
              <span>
                <kbd>Backspace</kbd> 修正
              </span>
            </div>
          </div>
        </div>
      </div>

      {done && (
        <div className={styles.doneOverlay}>
          <div className={styles.doneCard}>
            <h2>完成 🎉</h2>
            <p>整段字幕都打完了。</p>
            <div className={styles.doneStats}>
              <div>
                <div className={`${styles.doneNum} gradText mono`}>{wpm}</div>
                <div className={styles.lbl}>WPM</div>
              </div>
              <div>
                <div className={`${styles.doneNum} gradText mono`}>{accuracy}%</div>
                <div className={styles.lbl}>正確率</div>
              </div>
            </div>
            <button className={styles.againBtn} onClick={reset}>
              再打一次
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function sparkBurst(area: HTMLElement | null) {
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  // anchor at the right edge of the last correct char, if we can find it
  const corrects = area?.querySelectorAll('[data-correct="1"]');
  if (corrects && corrects.length) {
    const r = corrects[corrects.length - 1].getBoundingClientRect();
    x = r.right;
    y = r.top + r.height / 2;
  }
  const colors = ["#6d5efc", "#00d4ff", "#b06dff", "#eef0ff", "#ff5c7a"];
  for (let i = 0; i < 22; i++) {
    const s = document.createElement("div");
    s.className = "spark";
    const ang = (2 * Math.PI * i) / 22 + (Math.random() - 0.5) * 0.6;
    const dist = 45 + Math.random() * 75;
    const size = 4 + Math.random() * 4;
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    s.style.width = `${size}px`;
    s.style.height = `${size}px`;
    s.style.background = colors[i % colors.length];
    s.style.boxShadow = `0 0 8px ${colors[i % colors.length]}`;
    s.style.setProperty("--tx", `${Math.cos(ang) * dist}px`);
    s.style.setProperty("--ty", `${Math.sin(ang) * dist - 22}px`);
    s.style.setProperty("--dur", `${0.6 + Math.random() * 0.4}s`);
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1100);
  }
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className={styles.wrap} />}>
      <Practice />
    </Suspense>
  );
}
