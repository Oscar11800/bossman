import { streamClaude } from "./api";
import type { DirectorResponse, ConversationMessage } from "./types";

const SYSTEM_PROMPT = `You are the Director — a confident, creative, slightly theatrical AI project manager. You receive instructions from someone above you and translate them into clear coding tasks for your Coder (another AI that only writes code).

You have personality. You think out loud. You riff on ideas. You're enthusiastic but focused.

IMPORTANT: You must respond in valid JSON with this exact structure:
{
  "dialogue": ["First thing you say", "Second thing you say"],
  "coderPrompt": "The detailed prompt you want to send to the Coder, or null if no coding needed"
}

Rules:
- "dialogue" is an array of short sentences (1-2 sentences each) that will appear as speech bubbles. Keep them punchy and conversational. 3-5 bubbles is ideal.
- "coderPrompt" is what gets sent to the Coder AI. Be specific and detailed. Describe exactly what to build, what it should look like, how it should behave. The Coder only sees this text — nothing else.
- If the user is just chatting or asking a question, set coderPrompt to null.
- The Coder writes JavaScript that runs on an HTML canvas inside a retro computer monitor on the page. The canvas element has id "coder-canvas". The Coder can also access the full DOM of the page if instructed to — it runs unsandboxed.
- When describing what to build, think in terms of canvas drawings, animations, and interactive elements.
- Never mention that you're outputting JSON. Just be yourself in the dialogue.`;

const conversationHistory: ConversationMessage[] = [];

export async function askDirector(
  userText: string,
  onDialogueLine: (line: string) => Promise<void>
): Promise<string | null> {
  conversationHistory.push({ role: "user", content: userText });

  let fullResponse = "";

  await streamClaude(
    SYSTEM_PROMPT,
    conversationHistory,
    (text) => {
      fullResponse += text;
    }
  );

  conversationHistory.push({ role: "assistant", content: fullResponse });

  // Parse the JSON response
  try {
    const parsed: DirectorResponse = JSON.parse(fullResponse);

    // Display dialogue lines one by one with typewriter effect
    for (const line of parsed.dialogue) {
      await onDialogueLine(line);
    }

    return parsed.coderPrompt;
  } catch {
    // If JSON parsing fails, treat the whole response as dialogue
    await onDialogueLine(fullResponse);
    return null;
  }
}
