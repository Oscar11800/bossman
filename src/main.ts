import { initScene } from "./scene";
import { initVoice } from "./voice";
import { askDirector } from "./director";
import { askCoder, executeCode } from "./coder";
import {
  showUserBubble,
  hideUserBubble,
  addDirectorBubbleStreaming,
  setMonitorText,
  appendMonitorText,
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
          // Step 1: Director interprets and speaks to the computer
          const directorResponse = await askDirector(
            transcript,
            (chunk) => {
              addDirectorBubbleStreaming(chunk);
            }
          );

          // Step 2: Coder receives Director's words and writes code
          setMonitorText("");
          const code = await askCoder(
            directorResponse,
            (chunk) => {
              appendMonitorText(chunk);
            }
          );

          // Step 3: Execute the code
          executeCode(code);
        } catch (err) {
          console.error("Pipeline error:", err);
          addDirectorBubbleStreaming("Ugh, something broke. Not my fault.");
        }

        isProcessing = false;
      }, 500);
    }
  });
}

init();
