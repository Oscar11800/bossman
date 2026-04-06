import { streamClaude } from "./api";
import type { ConversationMessage } from "./types";

const SYSTEM_PROMPT = `You are a coding computer. You receive instructions from your boss and write JavaScript code to make things happen in a 3D scene.

ENVIRONMENT:
- You run in a browser. Your code executes directly in the page via eval().
- The 3D scene uses Three.js. The following are available on window._bossman:
  - scene: THREE.Scene — the main scene, add objects here
  - camera: THREE.PerspectiveCamera — the camera
  - renderer: THREE.WebGLRenderer — the renderer
  - THREE: the full Three.js library
- The page has a full DOM you can manipulate if asked.
- There is a programmer character model at roughly (-2.5, 0, -2.5) and a retro PC at (-1, 0, -1).
- The grid is on the ground plane (y=0). Positive y is up.

RULES:
- Output ONLY executable JavaScript code. No markdown, no backticks, no explanations, no comments unless they help readability.
- Use window._bossman to access scene, camera, renderer, THREE. Example:
  const { scene, THREE } = window._bossman;
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
  );
  box.position.set(2, 0.5, 0);
  scene.add(box);
- For animations, use requestAnimationFrame and store the id on window so it can be cancelled later.
- You can create lights, meshes, geometries, materials, particle systems — anything Three.js supports.
- You can also manipulate the DOM (document.body, createElement, etc.) if instructed.
- If asked to modify something you previously created, reference it by storing it on window (e.g. window._myBlock = mesh).
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
  // Strip markdown fences if the model wraps them anyway
  const cleaned = code
    .replace(/^```(?:javascript|js)?\n?/gm, "")
    .replace(/```$/gm, "")
    .trim();

  try {
    const fn = new Function(cleaned);
    fn();
    console.log("Coder: code executed");
  } catch (err) {
    console.error("Coder execution error:", err);
  }
}
