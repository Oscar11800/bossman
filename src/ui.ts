import { getProgrammerScreenPos } from "./scene";
import { playTalkSound, stopTalkSound, playTypeSound, stopTypeSound } from "./audio";

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

// --- Director bubble with typewriter + talk sound ---

let directorQueue: string[] = [];
let directorBuffer = "";
let directorTyping = false;
let directorBubbleEl: HTMLElement | null = null;

export function resetDirectorBubble() {
  const container = bubblesContainer();
  container.innerHTML = "";
  directorBubbleEl = null;
  directorBuffer = "";
  directorQueue = [];
  directorTyping = false;
  stopTalkSound();
}

export function addDirectorBubbleStreaming(chunk: string) {
  directorBuffer += chunk;

  if (!directorTyping) {
    drainDirectorBuffer();
  }
}

export function finishDirectorStreaming(): Promise<void> {
  // Wait until the typewriter finishes all buffered text
  return new Promise((resolve) => {
    const check = () => {
      if (!directorTyping && directorQueue.length === 0) {
        stopTalkSound();
        resolve();
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  });
}

function drainDirectorBuffer() {
  if (directorBuffer.length === 0) {
    directorTyping = false;
    stopTalkSound();
    return;
  }

  directorTyping = true;
  const container = bubblesContainer();

  if (!directorBubbleEl) {
    directorBubbleEl = document.createElement("div");
    directorBubbleEl.className = "speech-bubble";
    directorBubbleEl.textContent = "";
    container.appendChild(directorBubbleEl);
    playTalkSound();
  }

  const char = directorBuffer[0];
  directorBuffer = directorBuffer.slice(1);
  directorBubbleEl.textContent += char;
  container.scrollTop = container.scrollHeight;

  setTimeout(drainDirectorBuffer, 40);
}

// --- Monitor (code display) with typewriter + type sound ---

export function resetMonitor() {
  monitorContent().textContent = "";
  monitorStarted = false;
  stopTypeSound();
}

let monitorStarted = false;

export function appendMonitorStreaming(chunk: string) {
  const el = monitorContent();

  if (!monitorStarted) {
    monitorStarted = true;
    playTypeSound();
  }

  el.textContent += chunk;
  el.scrollTop = el.scrollHeight;
}

export function finishMonitorStreaming(): Promise<void> {
  stopTypeSound();
  monitorStarted = false;
  return Promise.resolve();
}

// --- Mic button ---

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

// --- Position bubbles near programmer ---

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
