import { tool } from "ai";
import { z } from "zod";

// Additional kinds (chart, image, docx, quiz) land in a later stage — the
// tool-output extraction on the client doesn't change when they're added.
export const createArtifact = tool({
  description:
    "Produce a rich, user-facing document artifact (rendered separately from your reply text) instead of putting long-form content inline in the chat. Use kind \"markdown\" for written content, and kind \"html\" for a webpage/landing-page/UI design — content is then the full self-contained HTML document, rendered live in a sandboxed preview.",
  inputSchema: z.object({
    kind: z.enum(["markdown", "html"]).describe("The artifact type"),
    title: z.string().describe("Short title shown above the artifact"),
    content: z.string().describe("The markdown content, or a full self-contained HTML document when kind is \"html\""),
  }),
  execute: async ({ kind, title, content }) => {
    return { kind, title, content };
  },
});
