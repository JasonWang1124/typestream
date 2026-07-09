"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { parseVideoId } from "@/lib/youtube";
import { DEMO_VIDEOS } from "@/lib/sentences";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const start = () => {
    const trimmed = url.trim();
    // empty → jump straight into the first demo so the app is instantly playable
    if (!trimmed) {
      const first = DEMO_VIDEOS[0];
      router.push(`/practice/${first.id}?title=${encodeURIComponent(first.title)}`);
      return;
    }
    const id = parseVideoId(trimmed);
    if (!id) {
      setError("看起來不是有效的 YouTube 連結，再確認一下～");
      return;
    }
    router.push(`/practice/${id}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") start();
  };

  return (
    <main className={styles.home}>
      <div className={styles.themeSlot}>
        <ThemeToggle />
      </div>

      <p className={styles.eyebrow}>
        <span className={styles.dot} />
        TypeStream
      </p>

      <h1 className={styles.title}>
        Type what you <span className="gradText">watch.</span>
      </h1>
      <p className={styles.sub}>
        貼上任何 YouTube 連結，跟著字幕一個字一個字打。看得懂，也打得出來。
      </p>

      <div className={styles.inputWrap}>
        <input
          className={styles.input}
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={onKeyDown}
          placeholder="貼上 YouTube 連結…（留空直接試打示範）"
          spellCheck={false}
          autoComplete="off"
          aria-label="YouTube URL"
        />
        <button className={styles.startBtn} onClick={start}>
          Start →
        </button>
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <p className={styles.tryLabel}>直接試試</p>
      <div className={styles.cards}>
        {DEMO_VIDEOS.map((v) => (
          <button
            key={v.id}
            className={styles.card}
            onClick={() =>
              router.push(`/practice/${v.id}?title=${encodeURIComponent(v.title)}`)
            }
            aria-label={`開始練習：${v.title}`}
          >
            <div className={styles.thumb} style={{ background: v.gradient }}>
              <span className={styles.play} aria-hidden="true" />
              <span className={styles.badge}>{v.duration}</span>
            </div>
            <span className={styles.cardTitle}>{v.title}</span>
            <span className={styles.cardMeta}>{v.channel}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
