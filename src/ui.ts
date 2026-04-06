import { getProgrammerScreenPos } from "./scene";

const bubblesContainer = () =>
  document.getElementById("director-bubbles")!;
const userBubble = () => document.getElementById("user-bubble")!;
const monitorContent = () => document.getElementById("monitor-content")!;

export function showUserBubble(text: string) {
  const el = userBubble();
  el.textContent = text;
  el.classList.remove("hidden");
}

export function hideUserBubble() {
  userBubble().classList.add("hidden");
}

// Streaming Director bubble — appends chunks as they arrive
let activeBubble: HTMLElement | null = null;

export function addDirectorBubbleStreaming(chunk: string) {
  const container = bubblesContainer();

  if (!activeBubble) {
    activeBubble = document.createElement("div");
    activeBubble.className = "speech-bubble";
    activeBubble.textContent = "";
    container.appendChild(activeBubble);
  }

  activeBubble.textContent += chunk;
  container.scrollTop = container.scrollHeight;
}

export function finishDirectorBubble() {
  activeBubble = null;
}

export function clearDirectorBubbles() {
  const container = bubblesContainer();
  container.innerHTML = "";
  activeBubble = null;
}

// Monitor (code display)
export function setMonitorText(text: string) {
  monitorContent().textContent = text;
}

export function appendMonitorText(text: string) {
  const el = monitorContent();
  el.textContent += text;
  el.scrollTop = el.scrollHeight;
}

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

// Position bubbles near the programmer model
function updateBubblePosition() {
  const container = bubblesContainer();
  const pos = getProgrammerScreenPos();
  if (pos) {
    container.style.position = "absolute";
    container.style.left = `${pos.x}px`;
    container.style.bottom = `${window.innerHeight - pos.y}px`;
  }
}

function positionLoop() {
  updateBubblePosition();
  requestAnimationFrame(positionLoop);
}
requestAnimationFrame(positionLoop);
