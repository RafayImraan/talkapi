# TalkAPI — Voice-Controlled API Agent

**Control any API, just by talking.**

TalkAPI is a multilingual voice agent that lets anyone interact with real-world REST APIs using only their voice. No Postman, no curl, no code — just speak your request and the agent handles everything.

Built for the [AssemblyAI Voice Agent Hackathon](https://www.assemblyai.com/docs/voice-agents/voice-agent-api).

## Problem

Developers and non-technical users waste hours manually testing APIs — opening Postman, writing curl commands, reading documentation, copy-pasting JSON. Customer support agents toggle between 5+ dashboards to answer simple questions. E-commerce store owners can't check inventory without logging into multiple panels. TalkAPI eliminates this friction entirely.

## Business Value

### For Developers
- **API Testing:** "What's the weather in Karachi?" — test Open-Meteo integration without writing code
- **GitHub Workflows:** "Search GitHub for react table libraries" — find dependencies by voice while coding
- **Stock Monitoring:** "What's NVIDIA's stock price?" — quick checks without leaving your IDE

### For E-Commerce
- **Voice Shopping:** "Search for hoodies, add the cheapest one to my cart" — hands-free shopping experience
- **Inventory Checks:** "What products do we have in electronics?" — instant catalog search

### For Customer Support
- **Knowledge Base Search:** "What's your refund policy?" — instant answers from company FAQ
- **Multi-language Support:** "Urdu mein batao pricing kya hai" — serve customers in their language

### For Finance
- **Real-time Data:** "Bitcoin kitna chal raha hai?" — crypto and stock prices on demand
- **Currency Conversion:** "100 dollars kitne PKR hain?" — instant forex rates

### For News & Research
- **Breaking News:** "AI ki latest news kya hai?" — stay updated hands-free
- **Quick Translation:** "Hello ko Spanish mein translate karo" — instant multilingual support

## How It Works

1. **User speaks** a natural-language request into the browser microphone
2. **AssemblyAI Voice Agent API** handles STT (speech-to-text), LLM routing, and turn-taking end-to-end through a single WebSocket connection
3. **Progressive Tool Reveal** — the agent starts with 6 core tools and unlocks more as the conversation progresses, improving accuracy at each stage
4. **The LLM** identifies which tool to call and extracts the parameters using JSON-Schema tool definitions
5. **TalkAPI backend** receives the tool call, executes the real API request, and returns the result
6. **The LLM** composes a natural-language response in the user's language and speaks it back via TTS
7. **The frontend** displays a live conversation log with real-time transcription, audio visualization, and tool call cards

## Features

- **12 tools** across 8 categories with progressive reveal (6 → 9 → 12 tools)
- **Multilingual** — agent responds in the same language you speak (English, Urdu, Hindi, Spanish, etc.)
- **Live transcription** — see your speech in real-time as you talk
- **Audio visualization** — frequency bars while speaking and listening
- **Dark/Light theme** — toggle with the sun/moon button
- **Keyboard shortcuts** — Space to toggle mic, Escape to end session
- **Demo scenarios** — pre-scripted examples to try on first load
- **Session stats** — track tool usage per session
- **Emoji reactions** — ✅ on success, ❌ on error, ⏳ while running
- **Graceful error recovery** — agent explains failures naturally and suggests alternatives

## Tools

| # | Tool | Description | API | Tier |
|---|------|-------------|-----|------|
| 1 | `get_weather` | Current weather for any city | Open-Meteo | 1 |
| 2 | `search_github_repos` | Search GitHub repos by keyword | GitHub API | 1 |
| 3 | `get_crypto_price` | Current USD price for cryptocurrencies | CoinGecko | 1 |
| 4 | `get_exchange_rate` | Currency conversion rates | ExchangeRate.host | 1 |
| 5 | `search_knowledge_base` | Search Nimbus Cloud FAQ | Local JSON | 1 |
| 6 | `get_news` | Latest news articles on any topic | Google News RSS | 1 |
| 7 | `get_github_repo_info` | Stars, forks, language for a specific repo | GitHub API | 2 |
| 8 | `get_github_issues` | Top issues for a repository | GitHub API | 2 |
| 9 | `get_stock_price` | Stock price and daily change | Yahoo Finance | 2 |
| 10 | `translate_text` | Translate between 15+ languages | MyMemory API | 2 |
| 11 | `search_products` | Browse products by name/category | FakeStoreAPI | 3 |
| 12 | `manage_cart` | Add/remove/view/clear shopping cart | In-memory | 3 |

## Tech Stack

- **Voice layer:** AssemblyAI Voice Agent API — handles STT, LLM routing, TTS, and turn-taking end-to-end through a single WebSocket connection
- **Backend:** Node.js + Express — tool execution, token minting, session history, progressive tool reveal
- **Frontend:** React + Vite — agent console with live transcription, audio visualization, dark/light themes
- **APIs:** All free, no API keys required (except AssemblyAI)

## Setup

### Prerequisites

- Node.js 18+
- An [AssemblyAI API key](https://www.assemblyai.com/dashboard/api-keys)

### 1. Clone and install

```bash
git clone <repo-url>
cd talkapi

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

```bash
cd backend
cp ../.env.example .env
# Edit .env and add your ASSEMBLYAI_API_KEY
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend
npm start

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open `http://localhost:3000` in Chrome, click the mic button, and start talking.

### Keyboard Shortcuts

- **Space** — Toggle mic on/off (or start session if disconnected)
- **Esc** — End session

## Progressive Tool Reveal

TalkAPI uses a 3-tier progressive tool reveal pattern:

1. **Tier 1 (Start):** 6 core tools — weather, GitHub search, crypto, exchange rates, knowledge base, news
2. **Tier 2 (After 1st tool call):** +4 tools — detailed GitHub info, stock prices, translation
3. **Tier 3 (After 3rd tool call):** +2 tools — product search, shopping cart

This improves LLM accuracy by starting with fewer tool choices and expanding as the conversation progresses.

## Future Work

- Persistent cart/session state with Redis
- Multi-user support with authentication
- Custom enterprise API integrations (Salesforce, Slack, Jira)
- Phone access via Twilio SIP
- Custom voice options
- Voice cloning for brand-specific agents

## License

MIT
