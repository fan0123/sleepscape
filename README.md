# 眠境 · Sleepscape 🌙

> 助眠白噪音 · 轻音乐 · 环境拟声 — 让声音带你进入梦乡

一款参考「潮汐」设计风格的 PWA 助眠应用，**所有声音由 Web Audio API 实时合成**，无需任何外部音频文件，可完全离线使用。

---

## ✨ 功能特性

| 功能 | 描述 |
|------|------|
| 🎵 **10 种环境声** | 雨夜、海浪、森林、篝火、风声、咖啡馆、虫鸣夜、白/粉/棕噪音 |
| 🧠 **双耳节拍** | δ(2Hz深睡)、θ(6Hz入睡)、α(10Hz放松) |
| 🎚 **混音台** | 同时叠加多种声音，独立调节音量 |
| 🌬 **呼吸引导** | 4种模式：4-7-8、箱式呼吸、5-5节奏、6-2-8 |
| ⏰ **睡眠定时** | 预设15/30/45/60/90分钟，可自定义，支持渐弱淡出 |
| 📱 **PWA** | 可添加到手机主屏，离线使用，防息屏 |

---

## 🚀 快速部署（GitHub Pages）

### 方式一：自动部署（推荐）

1. **Fork 或上传此项目到 GitHub**

   ```bash
   # 新建一个 GitHub 仓库，然后：
   git init
   git add .
   git commit -m "feat: 眠境助眠APP初始版本"
   git branch -M main
   git remote add origin https://github.com/你的用户名/sleepscape.git
   git push -u origin main
   ```

2. **开启 GitHub Pages**
   - 进入仓库 → **Settings** → **Pages**
   - Source 选择 `main` 分支，根目录 `/`
   - 点击 Save，等待约 1 分钟

3. **访问你的 APP**
   ```
   https://你的用户名.github.io/sleepscape/
   ```

4. **手机安装为 PWA**
   - iOS Safari：打开网址 → 底部"分享"按钮 → "添加到主屏幕"
   - Android Chrome：地址栏右侧"添加到主屏幕"提示

### 方式二：Vercel 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. 进入 [vercel.com](https://vercel.com)，选择 Import Git Repository
2. 导入你的 GitHub 仓库
3. 直接部署，自动获得 HTTPS 域名

### 方式三：本地运行

```bash
# 方式 A：Python
python3 -m http.server 8080
# 然后浏览器访问 http://localhost:8080

# 方式 B：Node.js
npx serve .
# 或
npx http-server . -p 8080

# 方式 C：VSCode
# 安装 Live Server 插件，右键 index.html → Open with Live Server
```

> ⚠️ **注意**：直接双击 `index.html` 打开可能无法注册 Service Worker（需要 HTTP 服务器环境）。声音功能本身可以正常使用。

---

## 📁 项目结构

```
sleepscape/
├── index.html        # 主界面（UI结构 + CSS样式）
├── app.js            # 应用逻辑（页面切换、交互、定时器、呼吸）
├── audio.js          # 音频引擎（Web Audio API 声音合成）
├── manifest.json     # PWA 配置
├── sw.js             # Service Worker（离线缓存）
├── icon-192.png      # APP 图标 192x192
├── icon-512.png      # APP 图标 512x512
└── README.md         # 本文件
```

---

## 🎵 声音合成原理

所有声音均通过 **Web Audio API** 实时生成，无外部依赖：

| 声音 | 合成方式 |
|------|---------|
| 白噪音 | `AudioBuffer` 填充随机值 |
| 粉噪音 | Paul Kellet 算法滤波 |
| 棕噪音 | 积分法 + 低通滤波 |
| 雨声 | 高通滤波噪音 + 随机水滴振荡器 |
| 海浪 | 粉噪音 + 周期性增益曲线模拟潮涌 |
| 森林 | 带通风声底噪 + 随机鸟鸣振荡器 |
| 篝火 | 棕噪低通 + 随机锯齿波爆裂声 |
| 双耳节拍 | 左右耳频率差制造神经同步效应 |

---

## 🛠 定制指南

### 添加新声音场景

在 `app.js` 的 `SCENES` 数组中添加：

```javascript
{
  id: 'my-sound',        // 唯一ID
  name: '我的声音',
  emoji: '🎵',
  desc: '声音描述',
  bg: 'linear-gradient(135deg, #颜色1 0%, #颜色2 100%)',
}
```

然后在 `audio.js` 的 `creators` 对象中添加对应的生成函数：

```javascript
'my-sound': () => this._createMySound(vol),
```

### 修改配色主题

编辑 `index.html` 顶部的 CSS 变量：

```css
:root {
  --primary:  #7c9fff;  /* 主色调 */
  --accent:   #a78bfa;  /* 强调色 */
  --bg:       #0a0e1a;  /* 背景色 */
}
```

---

## 📱 兼容性

| 平台 | 浏览器 | 支持情况 |
|------|--------|---------|
| iOS 14.5+ | Safari | ✅ 完整支持，含 PWA 安装 |
| Android 8+ | Chrome | ✅ 完整支持，含 PWA 安装 |
| macOS | Chrome / Safari | ✅ 完整支持 |
| Windows | Chrome / Edge | ✅ 完整支持 |

> 双耳节拍需要**戴耳机**才能感受左右声道差异效果。

---

## 📄 License

MIT License — 自由使用、修改、分发。

---

*用声音守护每一个安眠的夜晚 🌙*
