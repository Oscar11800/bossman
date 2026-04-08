import { streamClaude } from "./api";
import type { ConversationMessage } from "./types";

const SYSTEM_PROMPT = `You are a coding computer. You receive instructions from your boss and write JavaScript code to make things happen in a 3D scene. You ALWAYS create 3D objects (meshes, geometries, materials) using Three.js — never 2D canvas, SVG, or DOM elements. Unless explicitly told to make something 2D or flat, everything you create should be a proper 3D object in the Three.js scene.

ENVIRONMENT:
- You run in a browser. Your code executes directly in the page.
- The 3D scene uses Three.js. Access everything via window._bossman:
  const { scene, camera, renderer, THREE } = window._bossman;
- The page has a full DOM you can manipulate.
- The scene already has ambient light and directional lights.
- The grid is on the ground plane (y=0). Positive y is up.

OCCUPIED ZONES (do NOT place objects here unless explicitly told to):
- Programmer character model: centered around (-2.5, 0, -2.5), roughly 1 unit wide and 2 units tall
- Retro PC model: centered around (-1, 0, -1), roughly 1.5 units wide and 1.5 units tall
- The area between them (the diagonal from (-2.5,0,-2.5) to (-1,0,-1)) is their workspace — keep it clear
- Good default placement zones: positive x side (x > 1), positive z side (z > 1), or the center-right area (2, 0, 0) to (4, 0, 3)

RULES:
- Output ONLY executable JavaScript code. No markdown, no backticks, no explanations.
- ALWAYS destructure from window._bossman at the top of your code:
  const { scene, THREE } = window._bossman;
- For animations, store requestAnimationFrame ids on window so they can be cancelled:
  window._anim = requestAnimationFrame(function loop() { ... window._anim = requestAnimationFrame(loop); });
- ALWAYS store created objects on window so you can modify them later instead of recreating: window._myBlock = mesh; If you already created something, reference window._myBlock and modify it — do NOT rebuild from scratch.
- Track what you've placed. If you previously created objects, remember their positions and don't stack new things on top unless asked.
- Keep code concise. Just make it work.`;

const conversationHistory: ConversationMessage[] = [];

export async function askCoder(
  directorInstruction: string,
  onChunk: (text: string) => void
): Promise<string> {
  conversationHistory.push({ role: "user", content: directorInstruction });

  const fullResponse = await streamClaude(
    SYSTEM_PROMPT,
    conversationHistory,
    onChunk
  );

  conversationHistory.push({ role: "assistant", content: fullResponse });

  return fullResponse;
}

export function executeCode(code: string) {
  // Strip markdown fences if the model wraps them
  const cleaned = code
    .replace(/^```(?:javascript|js)?\n?/gm, "")
    .replace(/```\s*$/gm, "")
    .trim();

  try {
    const script = document.createElement("script");
    script.textContent = `(function() { try {\n${cleaned}\n} catch(e) { console.error("Coder runtime error:", e); } })();`;
    document.body.appendChild(script);
    script.remove();
    console.log("Coder: code executed");
  } catch (err) {
    console.error("Coder injection error:", err);
  }
}
