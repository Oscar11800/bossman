interface VoiceCallbacks {
  onInterim: (transcript: string) => void;
  onFinal: (transcript: string) => void;
}

const SpeechRecognitionCtor =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export function initVoice(callbacks: VoiceCallbacks): {
  start: () => void;
  stop: () => void;
  isListening: () => boolean;
} {
  if (!SpeechRecognitionCtor) {
    console.error("SpeechRecognition not supported");
    const noop = () => {};
    return { start: noop, stop: noop, isListening: () => false };
  }

  let listening = false;
  let recognition: SpeechRecognition | null = null;

  function start() {
    if (listening) return;
    listening = true;

    recognition = new SpeechRecognitionCtor!();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      // Show live text as user speaks
      callbacks.onInterim((final + interim).trim());
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech error:", event.error);
    };

    recognition.onend = () => {
      // Restart if still holding space
      if (listening) {
        recognition?.start();
      }
    };

    recognition.start();
  }

  function stop() {
    if (!listening) return;
    listening = false;

    // Collect final transcript before stopping
    if (recognition) {
      // Small delay to let final results flush
      setTimeout(() => {
        // Grab whatever we have and fire onFinal
        recognition?.stop();
        recognition = null;
      }, 200);
    }
  }

  return { start, stop, isListening: () => listening };
}
