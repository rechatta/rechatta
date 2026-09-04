import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const provider = createOpenAICompatible({
  name: process.env.AI_PROVIDER_NAME ?? "openai-compatible",
  baseURL: process.env.AI_BASE_URL ?? "https://api.openai.com/v1",
  apiKey: process.env.AI_API_KEY,
});

export const chatModel = provider(process.env.AI_MODEL ?? "gpt-4o-mini");
