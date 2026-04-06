export interface DirectorResponse {
  dialogue: string[];
  coderPrompt: string | null;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}
