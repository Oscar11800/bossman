import { initScene } from "./scene";
import { initVoice } from "./voice";
import { askDirector } from "./director";
import {
  showUserBubble,
  hideUserBubble,
  addDirectorBubble,
  updateMicButton,
} from "./ui";

function init() {
  const sceneContainer = document.getElementById("scene-container")!;
  initScene(sceneContainer);

  let currentTranscript = "";
  let isProcessing = false;

  const voice = initVoice({
    onInterim: (transcript) => {
      currentTranscript = transcript;
      showUserBubble(transcript);
    },
    onFinal: () => {},
  });

  const heldKeys = new Set<string>();

  window.addEventListener("keydown", (e) => {
    if (e.code !== "Space") return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    e.preventDefault();

    if (heldKeys.has("Space") || isProcessing) return;
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

    if (currentTranscript && !isProcessing) {
      const transcript = currentTranscript;
      currentTranscript = "";
      isProcessing = true;

      setTimeout(async () => {
        hideUserBubble();

        try {
          const coderPrompt = await askDirector(transcript, async (line) => {
            await addDirectorBubble(line);
          });

          if (coderPrompt) {
            // TODO Phase 5: Send to Coder AI
            console.log("Coder prompt ready:", coderPrompt);
          }
        } catch (err) {
          console.error("Director error:", err);
          await addDirectorBubble("Hmm, something went wrong. Try again?");
        }

        isProcessing = false;
      }, 500);
    }
  });
}

init();
