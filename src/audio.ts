let audioCtx: AudioContext | null = null;
let talkBuffer: AudioBuffer | null = null;
let typeBuffer: AudioBuffer | null = null;
let activeTalkSource: AudioBufferSourceNode | null = null;
let activeTypeSource: AudioBufferSourceNode | null = null;
let audioReady = false;
let initPromise: Promise<void> | null = null;

async function loadBuffer(url: string): Promise<AudioBuffer | null> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioCtx!.decodeAudioData(arrayBuffer);
  } catch (err) {
    console.error("Failed to load audio:", url, err);
    return null;
  }
}

export function initAudio(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    audioCtx = new AudioContext();

    if (audioCtx.state === "suspended") {
      await audioCtx.resume();
    }

    const base = import.meta.env.BASE_URL;
    const [talk, type] = await Promise.all([
      loadBuffer(`${base}assets/animal-crossing-isabelle-voice-clips-no-background-music-youtubemp3free.mp3`),
      loadBuffer(`${base}assets/dragon-studio-keyboard-typing-sound-effect-335503.mp3`),
    ]);

    talkBuffer = talk;
    typeBuffer = type;
    audioReady = true;
    console.log("Audio ready:", { talk: !!talk, type: !!type });
  })();

  return initPromise;
}

export function isAudioReady(): boolean {
  return audioReady;
}

export function playTalkSound() {
  if (!audioCtx || !talkBuffer) {
    console.warn("Talk sound not ready:", { ctx: !!audioCtx, buf: !!talkBuffer });
    return;
  }
  stopTalkSound();

  const source = audioCtx.createBufferSource();
  source.buffer = talkBuffer;
  source.loop = true;
  source.playbackRate.value = 0.9 + Math.random() * 0.3;
  source.connect(audioCtx.destination);
  source.start(0);
  activeTalkSource = source;
}

export function stopTalkSound() {
  if (activeTalkSource) {
    try { activeTalkSource.stop(); } catch { /* already stopped */ }
    activeTalkSource = null;
  }
}

export function playTypeSound() {
  if (!audioCtx || !typeBuffer) {
    console.warn("Type sound not ready:", { ctx: !!audioCtx, buf: !!typeBuffer });
    return;
  }
  stopTypeSound();

  const source = audioCtx.createBufferSource();
  source.buffer = typeBuffer;
  source.loop = true;
  source.connect(audioCtx.destination);
  source.start(0);
  activeTypeSource = source;
}

export function stopTypeSound() {
  if (activeTypeSource) {
    try { activeTypeSource.stop(); } catch { /* already stopped */ }
    activeTypeSource = null;
  }
}
