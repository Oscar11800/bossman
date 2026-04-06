# Bossman: AI Directs AI to Code

A creative web project where you speak to a "Director AI" who interprets your vision and prompts a "Coder AI" to build live programs on a virtual screen.

## Core Loop

```
You (voice) → Director AI (character with personality) → Coder AI (API) → Live program on virtual screen
```

## Concept: "The Studio"

A webpage styled like a retro programmer's desk / film director's set. The Director AI is a character sitting at a desk — they have personality, they talk in speech bubbles, they react to your instructions like a creative collaborator.

You speak via the mic. You say something like "make me a game where fish eat each other." The Director character nods, thinks (visible thought bubble), then starts dictating to the Coder.

The Coder is represented as a second screen within the screen — a terminal/monitor on the desk. Code streams onto it character by character. When the Director says "run it," the code executes in a sandboxed iframe and the result appears on a little TV on the desk.

## What Makes It Cool

### 1. Voice Input
Web Speech API — zero friction, feels magical. You talk, the Director listens, your words appear as a speech bubble above your avatar.

### 2. The Director Has Personality
The Director doesn't just proxy your request — they interpret it. They might say:

> "Hmm, fish eating fish... I'm thinking canvas, simple sprites, bigger fish chase smaller ones. Let me tell the Coder."

They compose a structured prompt for the Coder AI. You see the Director's thinking in speech bubbles, one sentence at a time, like a comic strip.

### 3. The Coder Is a Separate API Call
The Director's prompt goes to a second Claude API call with a system prompt constraining it to output only self-contained HTML/JS. The code streams onto the virtual monitor. The Director watches and commentates:

> "Looking good... okay, they're adding collision detection now..."

### 4. The "Run" Moment Is Theatrical
When the code is done, the Director dramatically hits a button (animated), the virtual TV flickers on, and the code executes in a sandboxed iframe.

### 5. Interrupt and Redirect
Mid-coding, you speak again: "make the background darker" or "add sound effects." The Director stops the Coder, says "hold on, change of plans," and sends a follow-up prompt. This iterative loop is the whole point.

## Architecture

```
┌─────────────────────────────────────────────┐
│  Browser (single HTML page)                 │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ You      │  │ Director │  │ Virtual  │  │
│  │ (mic +   │→ │ (Claude  │→ │ Monitor  │  │
│  │  speech  │  │  call 1) │  │ (iframe) │  │
│  │  bubble) │  │          │  │          │  │
│  └──────────┘  │ Speech   │  │ Code     │  │
│                │ bubbles  │→ │ streams  │  │
│                │ + avatar │  │ in, then │  │
│                └──────────┘  │ executes │  │
│                      ↓       └──────────┘  │
│               Claude call 2                 │
│               (Coder - returns HTML/JS)     │
└─────────────────────────────────────────────┘
```

- **Voice input**: `webkitSpeechRecognition` / `SpeechRecognition` API
- **Director AI**: Claude API call with streaming, persona system prompt
- **Coder AI**: Separate Claude API call, system prompt = "output only a single self-contained HTML file"
- **Execution**: `srcdoc` iframe — just set `iframe.srcdoc = generatedCode`
- **Speech bubbles**: CSS + JS animation, text revealed word by word with typewriter effect

## Constraint: What the Coder Builds

Single-file HTML5 Canvas games/toys. Visual, impressive, self-contained, runs in an iframe with zero dependencies. Fish eating fish, bouncing balls, particle effects, simple platformers.

## MVP (Phase 1)

One HTML file. Two API calls. ~300 lines:

1. Page loads with a "hold to talk" button
2. You speak → transcribed text appears in your bubble
3. Director API call (streaming) → response appears as animated speech bubbles
4. Director's response includes a structured `[CODE_REQUEST]` block
5. That block triggers the Coder API call → code streams onto the virtual monitor
6. "Run" button (or auto-run) → code executes in iframe

## Phase 2: Polish

- Retro desk scene with pixel art or illustrated style
- Director character with idle animations
- Typing sound effects as code streams in
- CRT scanline effect on the virtual monitor
- TV static / flicker on "run"
- Conversation history as stacked speech bubbles

## Phase 3: Advanced

- Claude Code hook integration — Director IS Claude Code, proxied via WebSocket
- Multiple Coder "employees" for different tasks
- Version history of generated programs
- Share/export generated creations
