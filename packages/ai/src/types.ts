export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxOutputTokens?: number;
}

export interface ChatResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

export interface EmbedOptions {
  dimensions?: number;
}

export interface EmbedResult {
  embedding: number[];
  inputTokens: number;
  latencyMs: number;
}

export interface AIProvider {
  readonly name: string;
  chat(messages: ChatMessage[], opts?: ChatOptions): Promise<ChatResult>;
  embed(text: string, opts?: EmbedOptions): Promise<EmbedResult>;
  isConfigured(): boolean;
}
