# TypeStream · 開發檢查表

> 每完成一個階段就打勾。

## ✅ 已完成

### 基礎
- [x] Next.js 16 + TypeScript + App Router 骨架
- [x] 首頁（貼 URL / 示範）＋ 練習頁
- [x] 真 YouTube 播放器（IFrame API）
- [x] 打字狀態機：逐字上色、WPM、正確率、進度
- [x] monkeytype 風格錯字顯示（顯示實際打的錯字）
- [x] 單字不拆換行
- [x] RWD（手機 / 平板 / 桌機）
- [x] 上 GitHub（乾淨個人身份）

### 可用性
- [x] **手機打字** — 隱藏 input 喚起虛擬鍵盤（含中文輸入法防護）

### UI/UX 大改造 — Monospace Instrument
- [x] 丟掉紫青漸層 + 玻璃霓虹（AI 通用感）
- [x] 單一信號橘 `#ff5a1f`，實色面板 + 極細分隔線
- [x] Bricolage Grotesque（大標）+ JetBrains Mono（功能區）
- [x] signature：平滑滑動游標 + 打對字柔和點亮
- [x] 示範改終端機式行列表
- [x] 深 / 淺色都重新設計（淺色暖米白紙感）

### 核心功能
- [x] **接真實字幕** — 後端 API `/api/transcript`（youtube-transcript）
      貼任何影片抓它自己的字幕、自動抓標題、切句、快取 ✓ 本機可用

## 🚧 進行中
- [ ] 部署 Vercel（拿公開網址）

## 🟡 待辦 · 核心
- [ ] 手動貼上 fallback（Vercel 機房 IP 被 YouTube 擋時用）
- [ ] 瀏覽器擴充層（用使用者 IP，無限量抓字幕）
- [ ] 跟播模式（字幕到時間點自動前進）
- [ ] 忽略大小寫 / 標點選項的 UI 開關
- [ ] 練習紀錄（localStorage 存歷史成績）

## 🔵 加分
- [ ] 換 favicon（⌨️ 主題）
- [ ] OG 分享預覽圖
- [ ] 連對 combo streak 遊戲化
- [ ] 結算頁數據視覺化（WPM 曲線）
- [ ] 音效回饋
