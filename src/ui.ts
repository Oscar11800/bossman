const bubblesContainer = () =>
  document.getElementById("director-bubbles")!;
const userBubble = () => document.getElementById("user-bubble")!;

export function showUserBubble(text: string) {
  const el = userBubble();
  el.textContent = text;
  el.classList.remove("hidden");
}

export function addDirectorBubble(text: string) {
  const bubble = document.createElement("div");
  bubble.className = "speech-bubble";
  bubble.textContent = text;
  const container = bubblesContainer();
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

export function setMonitorText(text: string) {
  const content = document.getElementById("monitor-content")!;
  content.textContent = text;
}

export function appendMonitorChar(char: string) {
  const content = document.getElementById("monitor-content")!;
  // Remove cursor if present
  const cursor = content.querySelector(".cursor");
  if (cursor) cursor.remove();

  content.appendChild(document.createTextNode(char));
  content.scrollTop = content.scrollHeight;
}

export function updateMicButton(listening: boolean) {
  const btn = document.getElementById("mic-btn")!;
  const label = btn.querySelector(".mic-label")!;
  if (listening) {
    btn.classList.add("listening");
    label.textContent = "Listening...";
  } else {
    btn.classList.remove("listening");
    label.textContent = "Click to speak";
  }
}
