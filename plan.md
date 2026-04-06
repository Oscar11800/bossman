# Bossman: AI Directs AI to Code

A creative web project where you speak to a "Director AI" who interprets your vision and prompts a "Coder AI" to build live programs — with real, unsandboxed access to the page itself.

## Core Loop

```
You (toggle mic button) → Director AI (speech-to-text → text prompt) → Coder AI (text in, code out) → Executes unsandboxed on the real page
```

- You speak to the Director. The Director transcribes your speech and translates it into structured prompts for the Coder.
- The Coder only sees text from the Director. It does not know you exist.
- The Coder's output is real JavaScript that executes in the main DOM — not sandboxed, not in an iframe. It can reach anything on the page.
- If you want the Coder to break out of its monitor, you tell the Director, the Director tells the Coder. The chain of command is the point.
- Page refresh = full reset. No persistence. The page always returns to its original state.

## Finalized Spec

### Voice Input
- Toggle button: click once to start dictation, click again to stop
- Uses Web Speech API (`SpeechRecognition`)
- Transcribed text appears as your speech bubble

### Director AI
- Receives your transcribed speech
- Responds with text in Animal Crossing-style speech bubbles
- Audio: mumble/gibberish sounds per word (Animal Crossing style) + typing sounds
- Outputs structured JSON: dialogue lines for display + a code prompt for the Coder
- Has personality — interprets and riffs on your requests, doesn't just parrot them
- The Director is the only entity that knows about you

### Coder AI
- Receives only text prompts from the Director
- Does not know about you (the human)
- Has conversation context to iterate on its work
- Outputs JavaScript/HTML code
- Code is constrained to a structured template with a canvas draw space (the "retro computer monitor")
- BUT the code runs unsandboxed in the main page context — if directed, it can manipulate any DOM element, the Director's bubbles, the page layout, anything
- The "retro computer" is its suggested workspace, not its prison

### The Monitor
- Retro CRT computer aesthetic — scanlines, slight glow, chunky border
- Code streams into it character by character with typing/keyboard sounds
- This is where the Coder's output is displayed and where its programs run by default
- Breakouts beyond the monitor are real DOM manipulation, not faked

### Sound Design
- Director speech: Animal Crossing-style mumble (randomized syllable sounds per word, pitch-shifted)
- Code streaming: mechanical keyboard / typewriter clatter
- General UI: subtle click/bloop sounds

### Execution Model
- Coder's generated code is injected via `<script>` into the main document
- Full access to `document`, `window`, all page elements
- No iframe, no sandbox, no restrictions
- Reset = browser refresh (natural behavior, no special logic needed)

### Kill Switch
- Browser refresh (`Ctrl+R` / `Cmd+R`) or close tab
- Page always loads fresh from static files — all Coder mutations are ephemeral

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Language | TypeScript | Type safety for the Director↔Coder protocol |
| Build | Vite | Instant dev server, fast builds, minimal config |
| Framework | Vanilla DOM | No React overhead for a single interactive page |
| Hosting | GitHub Pages | Free, static, via GitHub Actions |
| API Proxy | Cloudflare Worker | Holds API key server-side, free tier (100k req/day) |
| AI | Claude API | Two separate calls: Director + Coder, both streaming |
| Voice | Web Speech API | Native browser, no library needed |
| Audio | Web Audio API | Generate Animal Crossing mumbles + typing sounds programmatically |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (Vite-built static page on GitHub Pages)           │
│                                                             │
│  ┌──────────┐    ┌─────────────┐    ┌────────────────────┐  │
│  │ You      │    │ Director    │    │ Retro Monitor      │  │
│  │ [toggle  │ →  │ Speech      │ →  │ Code streams in    │  │
│  │  mic]    │    │ bubbles +   │    │ then executes      │  │
│  │ Speech   │    │ AC mumble   │    │ unsandboxed in     │  │
│  │ bubble   │    │ audio       │    │ main DOM           │  │
│  └──────────┘    └──────┬──────┘    └────────────────────┘  │
│                         │                                    │
│                         ▼                                    │
│                  Cloudflare Worker                            │
│                  (proxies to Claude API,                      │
│                   holds API key)                              │
│                         │                                    │
│              ┌──────────┴──────────┐                         │
│              │                     │                         │
│        Claude Call 1         Claude Call 2                    │
│        (Director)            (Coder)                         │
│        - persona prompt      - code-only prompt              │
│        - returns dialogue    - returns JS/HTML               │
│          + coder instruction - has conversation context       │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
bossman/
  src/
    main.ts              ← entry point, orchestration, voice input
    director.ts          ← Director AI: system prompt, streaming, parsing response
    coder.ts             ← Coder AI: system prompt, streaming, code parsing
    screen.ts            ← retro monitor rendering, code display, execution
    audio.ts             ← Animal Crossing mumble generator, typing sounds, UI sounds
    ui.ts                ← speech bubbles, toggle button, layout
    types.ts             ← shared types (DirectorResponse, CoderOutput, etc.)
    style.css            ← layout, retro monitor CSS, speech bubble styles, CRT effect
  index.html             ← shell HTML
  vite.config.ts
  tsconfig.json
  package.json
  worker/
    index.ts             ← Cloudflare Worker: ~20 lines, proxies API calls
    wrangler.toml        ← Cloudflare config
  plan.md
```

## Implementation Plan

### Phase 1: Scaffold + Voice Loop
1. Init Vite + TypeScript project, configure for GitHub Pages
2. Basic `index.html` layout: mic toggle button, Director area, Monitor area
3. Implement voice input (`SpeechRecognition`) with toggle on/off
4. Display transcribed text as user speech bubble
5. Basic CSS layout — doesn't need to be pretty yet, just functional zones

### Phase 2: Cloudflare Worker Proxy
6. Write the Worker: accepts POST with messages array, forwards to Claude API with API key from env, streams response back
7. Deploy Worker, note the URL
8. Test with a simple fetch from the browser

### Phase 3: Director AI
9. Define Director system prompt (personality, structured JSON output format)
10. Implement streaming call to Worker → Claude (Director)
11. Parse Director response: extract dialogue lines + coder prompt
12. Render Director dialogue as speech bubbles, one at a time

### Phase 4: Animal Crossing Audio
13. Implement mumble sound generator using Web Audio API (short randomized vowel sounds, pitch-shifted per character/word)
14. Play mumble audio synced to each speech bubble's text reveal
15. Add typing/keyboard sounds for code streaming

### Phase 5: Coder AI + Execution
16. Define Coder system prompt (structured template, canvas draw space, DOM access awareness)
17. Implement streaming call to Worker → Claude (Coder) with conversation context
18. Stream code characters into the retro monitor display
19. On completion: inject code as `<script>` into main document, unsandboxed
20. The Coder's code runs live — canvas draws, DOM mutations, everything is real

### Phase 6: Retro Monitor Polish
21. CRT scanline effect (CSS overlay)
22. Monitor border / bezel (chunky retro frame, maybe pixel art)
23. Slight phosphor glow effect
24. Code display styled as green-on-black terminal text

### Phase 7: Full Loop Integration
25. Wire the complete flow: mic toggle → transcription → Director → Coder → execute
26. Implement iteration: subsequent voice inputs send follow-up context to Director, Director sends follow-up to Coder with previous code context
27. Test breakout scenarios: direct the Coder (via Director) to modify elements outside the monitor
28. Edge cases: handle mid-stream interrupts, empty transcriptions, API errors

### Phase 8: Final Polish
29. Responsive layout (works on different screen sizes)
30. Loading states and transitions between phases
31. GitHub Actions workflow for auto-deploy to Pages
32. README with demo link
