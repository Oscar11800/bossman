const WORKER_URL = "https://bossman-proxy.oscar1149412.workers.dev";

export async function streamClaude(
  system: string,
  messages: { role: string; content: string }[],
  onText: (text: string) => void
): Promise<string> {
  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system,
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE format: "event: ...\ndata: ...\n\n"
    // Split on double newline to get complete events
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const event of events) {
      const lines = event.split("\n");
      let data = "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          data = line.slice(6);
        }
      }

      if (!data || data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        if (
          parsed.type === "content_block_delta" &&
          parsed.delta?.type === "text_delta"
        ) {
          fullText += parsed.delta.text;
          onText(parsed.delta.text);
        }
      } catch {
        // skip malformed chunks
      }
    }
  }

  return fullText;
}
