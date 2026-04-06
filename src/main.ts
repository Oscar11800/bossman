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

  // Init voice
  const micBtn = document.getElementById("mic-btn")!;

  const voice = initVoice({
    onInterim: (transcript) => {
      showUserBubble(transcript);
    },
    onFinal: (transcript) => {
      showUserBubble(transcript);
      addDirectorBubble(`Hmm, you said: "${transcript}"... Let me think about that.`);
    },
  });

  micBtn.addEventListener("click", () => {
    voice.toggle();
    updateMicButton(voice.isListening());
  });
}

init();
