import { initScene } from "./scene";
import { initVoice } from "./voice";
import {
  showUserBubble,
  addDirectorBubble,
  updateMicButton,
} from "./ui";

function init() {
  // Init 3D scene
  const sceneContainer = document.getElementById("scene-container")!;
  initScene(sceneContainer);

  // Track accumulated transcript during a hold session
  let currentTranscript = "";

  // Init voice
  const voice = initVoice({
    onInterim: (transcript) => {
      currentTranscript = transcript;
      showUserBubble(transcript);
    },
    onFinal: (_transcript) => {
      // Not used — we fire on keyup instead
    },
  });

  // Hold space to talk
  const heldKeys = new Set<string>();

  window.addEventListener("keydown", (e) => {
    if (e.code !== "Space") return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    e.preventDefault();

    if (heldKeys.has("Space")) return; // Already held
    heldKeys.add("Space");

    currentTranscript = "";
    voice.start();
    updateMicButton(true);
  });

  window.addEventListener("keyup", (e) => {
    if (e.code !== "Space") return;
    e.preventDefault();

    heldKeys.delete("Space");
    voice.stop();
    updateMicButton(false);

    // Fire the director response on release (falling edge)
    if (currentTranscript) {
      const transcript = currentTranscript;
      currentTranscript = "";
      // Placeholder: Director will handle this in Phase 3
      addDirectorBubble(`Hmm, you said: "${transcript}"... Let me think about that.`);
    }
  });
}

init();
