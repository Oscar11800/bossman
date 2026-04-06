import { getProgrammerScreenPos } from "./scene";

const bubblesContainer = () =>
  document.getElementById("director-bubbles")!;
const userBubble = () => document.getElementById("user-bubble")!;

export function showUserBubble(text: string) {
  const el = userBubble();
  el.textContent = text;
  el.classList.remove("hidden");
}

export function hideUserBubble() {
  const el = userBubble();
  el.classList.add("hidden");
}

let currentTypewriter: number | null = null;

export function addDirectorBubble(text: string): Promise<void> {
  return new Promise((resolve) => {
    // Cancel any ongoing typewriter
    if (currentTypewriter !== null) {
      clearInterval(currentTypewriter);
      currentTypewriter = null;
    }

    const bubble = document.createElement("div");
    bubble.className = "speech-bubble";
    bubble.textContent = "";

    const container = bubblesContainer();
    container.appendChild(bubble);

    // Position near the programmer
    updateBubblePosition();

    // Typewriter effect — 30ms per character
    let i = 0;
    currentTypewriter = window.setInterval(() => {
      if (i < text.length) {
        bubble.textContent += text[i];
        i++;
        container.scrollTop = container.scrollHeight;
      } else {
        clearInterval(currentTypewriter!);
        currentTypewriter = null;
        resolve();
      }
    }, 30);
  });
}

function updateBubblePosition() {
  const container = bubblesContainer();
  const pos = getProgrammerScreenPos();
  if (pos) {
    container.style.position = "absolute";
    container.style.left = `${pos.x}px`;
    container.style.bottom = `${window.innerHeight - pos.y}px`;
  }
}

// Update bubble position each frame (camera might move)
function positionLoop() {
  updateBubblePosition();
  requestAnimationFrame(positionLoop);
}
requestAnimationFrame(positionLoop);

export function updateMicButton(listening: boolean) {
  const btn = document.getElementById("mic-btn")!;
  const label = btn.querySelector(".mic-label")!;
  if (listening) {
    btn.classList.add("listening");
    label.textContent = "Listening...";
  } else {
    btn.classList.remove("listening");
    label.textContent = "Hold SPACE to speak";
  }
}
