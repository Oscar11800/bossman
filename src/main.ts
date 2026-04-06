import { initScene } from "./scene";
import { initVoice } from "./voice";
import { initAudio } from "./audio";
import { askDirector, getDirectorReaction } from "./director";
import { askCoder, executeCode } from "./coder";
import {
  showUserBubble,
  hideUserBubble,
  resetDirectorBubble,
  addDirectorBubbleStreaming,
  finishDirectorStreaming,
  resetMonitor,
  appendMonitorStreaming,
  finishMonitorStreaming,
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

    // Start loading audio on first gesture (don't await — let it load while user speaks)
    initAudio();

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
        resetDirectorBubble();
        resetMonitor();

        // Ensure audio is fully loaded before Director talks
        await initAudio();

        try {
          // Step 1: Director speaks to the computer
          const directorResponse = await askDirector(
            transcript,
            (chunk) => {
              addDirectorBubbleStreaming(chunk);
            }
          );

          await finishDirectorStreaming();

          // Step 2: Coder writes code
          const code = await askCoder(
            directorResponse,
            (chunk) => {
              appendMonitorStreaming(chunk);
            }
          );

          await finishMonitorStreaming();

          // Step 3: Execute the code in the page
          executeCode(code);

          // Step 4: Director reacts with a snide remark
          resetDirectorBubble();
          await getDirectorReaction((chunk) => {
            addDirectorBubbleStreaming(chunk);
          });
          await finishDirectorStreaming();
        } catch (err) {
          console.error("Pipeline error:", err);
          resetDirectorBubble();
          addDirectorBubbleStreaming("Ugh, something broke. Not my fault.");
        }

        isProcessing = false;
      }, 500);
    }
  });
}

init();
