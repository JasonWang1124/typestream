import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TypeStream — Type what you watch",
  description: "貼上任何 YouTube 連結，跟著字幕一個字一個字打。看得懂，也打得出來。",
};

// Set the theme before first paint to avoid a flash of the wrong colours.
const themeInit = `try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
