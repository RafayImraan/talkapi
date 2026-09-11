# TalkAPI — Hackathon Submission

## Inspiration

We kept running into the same problem: testing and interacting with APIs is painful. Every time we need to check a GitHub repo, look up weather, or test an endpoint, we open Postman, type out requests, and manually parse responses. Customer support agents toggle between 5+ dashboards. E-commerce store owners can't check inventory without multiple logins. Non-technical stakeholders can't use APIs at all without developer help.

We asked: what if you could just *talk* to any API? What if checking the weather, looking up crypto prices, or browsing a product catalog was as simple as asking a question out loud? AssemblyAI's Voice Agent API made this possible — especially the JSON-Schema tool calling, which lets the LLM decide *which* API to call and *how* to parameterize it, all from natural speech.

## What It Does

TalkAPI is a multilingual voice-controlled API agent with 12 tools across 8 categories. You speak a request, and the agent:

1. **Understands your intent** via AssemblyAI's STT and LLM routing
2. **Selects the correct tool** using JSON Schema definitions (progressive reveal: 6 → 9 → 12 tools)
3. **Executes the real API call** — not mocked, not simulated
4. **Speaks the result back** in your language, like a human assistant

### Business Use Cases

**For Developers:** Voice-powered API testing and GitHub workflows. "Search GitHub for react table libraries" — find dependencies without leaving your IDE.

**For E-Commerce:** Voice shopping and inventory checks. "Search for hoodies, add the cheapest one to my cart" — hands-free shopping experience.

**For Customer Support:** Instant knowledge base search in any language. "Urdu mein batao pricing kya hai" — serve customers in their language.

**For Finance:** Real-time crypto, stock, and forex data. "Bitcoin kitna chal raha hai?" — instant price checks.

**For Research:** Breaking news and translation. "AI ki latest news kya hai?" — stay updated hands-free.

## How We Built It

### AssemblyAI Integration
- **Voice Agent API** handles STT, turn-taking, LLM routing, and TTS end-to-end through a single WebSocket connection
- **JSON-Schema tool calling** defines 12 tools with precise parameter schemas, examples, and enums for accurate extraction
- **Progressive tool reveal** starts with 6 core tools and unlocks more as the conversation progresses, demonstrating sophisticated tool calling patterns
- **Multilingual support** leverages the LLM's language detection to respond in 15+ languages naturally

### Architecture
- **Node.js backend** executes tool calls against real external APIs (Open-Meteo, GitHub, CoinGecko, FakeStoreAPI, Yahoo Finance, MyMemory, Google News RSS)
- **React frontend** provides a live agent console with real-time transcription, audio frequency visualization, session statistics, and dark/light themes
- **Browser integration** follows AssemblyAI's recommended pattern: backend mints a temporary token, frontend connects directly to `wss://agents.assemblyai.com/v1/ws`

### Tool Calling Flow
1. User speaks → AssemblyAI STT transcribes
2. LLM routes to correct tool via JSON Schema matching
3. Frontend receives `tool.call`, sends to backend
4. Backend executes real API call, returns result
5. Frontend sends `tool.result` back to AssemblyAI
6. LLM composes response in user's language
7. TTS speaks the answer

## Challenges

1. **AudioWorklet browser compatibility.** Firefox and Safari don't support forced sample rates on AudioContext. Solved with resampling inside the worklet processor.
2. **Tool result timing.** AssemblyAI requires tool results after `reply.done`, not immediately. Required careful state management with pending tool queues.
3. **Progressive tool reveal.** Balancing between giving enough tools for useful responses and too many that confuse the LLM. Settled on 3 tiers with specific unlock triggers.
4. **Multilingual detection.** Getting the agent to naturally switch languages based on user input while maintaining tool-calling accuracy required careful prompt engineering.

## Accomplishments

- **12 tools** across 8 categories, all making real API calls
- **Progressive tool reveal** — 3-tier unlock pattern demonstrating AssemblyAI's advanced capabilities
- **Multilingual voice interaction** — 15+ languages with automatic detection
- **Live transcription** — real-time text display while speaking
- **Audio visualization** — frequency bars during speech and listening
- **Dark/light theme** — professional UI with theme toggle
- **Session statistics** — real-time tool usage tracking
- **Pre-scripted demos** — 8 example scenarios for guided demos
- **Keyboard shortcuts** — Space (mic toggle), Escape (end session)
- **Graceful error recovery** — agent explains failures naturally

## What We Learned

- **AssemblyAI's Voice Agent API is remarkably powerful.** The combination of STT + LLM routing + TTS in a single WebSocket eliminates months of infrastructure work. Tool calling via JSON Schema is especially elegant — define the schema, and the model handles parameter extraction from speech.
- **Progressive tool reveal is a game-changer.** Starting with fewer tools and unlocking more as the conversation progresses improves accuracy significantly. The LLM makes better decisions with a focused toolset.
- **Turn-taking is harder than it looks.** Getting the agent to wait for complete tool results before responding, while still feeling responsive, requires understanding the event flow.
- **Voice-first UX is different.** You can't show a list of 20 results — the agent needs to summarize and prioritize. Tool descriptions need to be written as "when to call this" triggers.
- **Multilingual support multiplies the value.** The same 12 tools suddenly work for Urdu speakers, Hindi speakers, Spanish speakers — without any additional code.

## What's Next

- Persistent sessions with Redis for cart and conversation state
- Multi-user support with authentication and personalized tool access
- Enterprise API integrations (Salesforce, Slack, Jira, Linear)
- Phone access via Twilio SIP integration
- Custom voice options and voice cloning for brand-specific agents
- Analytics dashboard for tool usage insights
