import { tool } from "ai";
import { z } from "zod";

// Additional kinds (chart, image, html, docx, quiz) land in a later stage —
// the tool-output extraction on the client doesn't change when they're added.
export const createArtifact = tool({
  description:
    "Produce a rich, user-facing document artifact (rendered separately from your reply text) instead of putting long-form content inline in the chat.",
  inputSchema: z.object({
    kind: z.enum(["markdown"]).describe("The artifact type"),
    title: z.string().describe("Short title shown above the artifact"),
    content: z.string().describe("The markdown content of the artifact"),
  }),
  execute: async ({ kind, title, content }) => {
    return { kind, title, content };
  },
});
