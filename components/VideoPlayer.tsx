"use client";

import { useEffect, useRef } from "react";

interface YTPlayer {
  destroy?: () => void;
}
interface YTPlayerConstructor {
  new (el: HTMLElement, opts: unknown): YTPlayer;
}
interface YTNamespace {
  Player: YTPlayerConstructor;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/**
 * Embeds a real YouTube player via the official IFrame API.
 * The transcript is fetched separately — the player is playback only.
 */
export default function VideoPlayer({ videoId }: { videoId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);

  useEffect(() => {
    let cancelled = false;

    const create = () => {
      if (cancelled || !containerRef.current || !window.YT) return;
      containerRef.current.innerHTML = "";
      const holder = document.createElement("div");
      holder.style.width = "100%";
      holder.style.height = "100%";
      containerRef.current.appendChild(holder);
      playerRef.current = new window.YT.Player(holder, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
      });
    };

    if (window.YT?.Player) {
      create();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        create();
      };
      if (!document.getElementById("youtube-iframe-api")) {
        const s = document.createElement("script");
        s.id = "youtube-iframe-api";
        s.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(s);
      }
    }

    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy?.();
      } catch {
        // player may not be fully initialised yet
      }
      playerRef.current = null;
    };
  }, [videoId]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%", lineHeight: 0 }} />;
}
