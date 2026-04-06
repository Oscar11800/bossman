interface VoiceCallbacks {
  onInterim: (transcript: string) => void;
  onFinal: (transcript: string) => void;
}

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export function initVoice(callbacks: VoiceCallbacks): {
  toggle: () => void;
  isListening: () => boolean;
} {
  if (!SpeechRecognition) {
    console.error("SpeechRecognition not supported");
    return {
      toggle: () => alert("Speech recognition not supported in this browser."),
      isListening: () => false,
    };
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  let listening = false;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    // Build full transcript from all results
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

    // Show interim (live as you speak)
    if (interim) {
      callbacks.onInterim(final + interim);
    }

    // Fire final when a segment completes
    if (final) {
      callbacks.onFinal(final.trim());
    }
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    console.error("Speech error:", event.error);
    if (event.error !== "no-speech" && event.error !== "aborted") {
      listening = false;
    }
  };

  recognition.onend = () => {
    // Restart if still supposed to be listening (browser auto-stops sometimes)
    if (listening) {
      recognition.start();
    }
  };

  function toggle() {
    if (listening) {
      listening = false;
      recognition.stop();
    } else {
      listening = true;
      recognition.start();
    }
  }

  return { toggle, isListening: () => listening };
}
