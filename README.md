<div align="center">

# ⌨️ TypeStream

**Type what you watch.**

貼上任何 YouTube 連結，跟著字幕一個字一個字打。看得懂，也打得出來。

深色霓虹風格的打字練習，把「看影片」和「練打字」揉在同一個畫面裡。

</div>

---

## ✨ 特色

- 🎬 **真 YouTube 播放器** — 官方 IFrame API 嵌入，貼連結或點示範卡即可開始
- ⌨️ **逐字即時回饋** — 正確／錯誤／待打三態上色，發光游標跟著你走
- 📊 **即時統計** — WPM（正確字元 ÷ 5 ÷ 分鐘）、正確率、進度條
- ✨ **完美句火花** — 一整句無誤打完，在最後一個字噴出霓虹粒子並自動跳下一句
- 🌗 **深／淺色主題** — 一鍵切換、記憶偏好、首屏無閃爍（FOUC-free）
- ♿ **無障礙友善** — 鍵盤操作、可見 focus、`prefers-reduced-motion` 自動收斂動效
- 📱 **RWD** — 窄螢幕自動改為單欄

## 🛠 技術棧

| 類別 | 選用 |
|---|---|
| 框架 | Next.js 16（App Router）+ React 19 |
| 語言 | TypeScript |
| 樣式 | CSS Modules + CSS Variables（無 UI 框架，貼近原型的輕量美學） |
| 播放器 | YouTube IFrame Player API |

## 🚀 本機開發

```bash
npm install
npm run dev
```

開 [http://localhost:3000](http://localhost:3000) 即可。

```bash
npm run build   # 產出正式版
npm run start   # 跑正式版
```

## 📁 專案結構

```
app/
  layout.tsx              # 根版面 + 主題防閃爍 script
  globals.css            # 設計 token（深／淺色）、共用動畫
  page.tsx               # 首頁（貼 URL / 示範卡）
  practice/[videoId]/    # 練習頁（播放器 + 打字邏輯）
components/
  VideoPlayer.tsx        # YouTube IFrame 封裝
  ThemeToggle.tsx        # 深／淺色切換
hooks/
  useTyping.ts           # 打字狀態機（上色 / WPM / 正確率）
lib/
  youtube.ts             # 解析 YouTube videoId
  sentences.ts           # 示範字幕與影片資料
```

## 🗺 Roadmap

目前字幕是**內建示範資料**；真實字幕來源規劃走三層降級（YouTube 會封鎖伺服器機房 IP，前端又受 CORS 限制，所以需要這套設計）：

1. **瀏覽器擴充**（已安裝時）— 用使用者自己的 IP 抓字幕，無限次、零成本
2. **後端 API**（未裝擴充時）— 轉呼叫第三方字幕服務的免費額度
3. **手動貼上**（額度耗盡時）— 安全網，永遠不卡白畫面

- [ ] 接上真實字幕來源（三層降級）
- [ ] 影片時間軸「跟播」模式（字幕到點自動前進）
- [ ] 忽略大小寫／標點選項
- [ ] 練習紀錄與統計

## 📄 License

MIT © [Jason Wang](https://github.com/JasonWang1124)
