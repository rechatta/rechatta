import { tool } from "ai";
import { z } from "zod";
import { Sandbox } from "@e2b/code-interpreter";
import { createClient } from "@/lib/supabase/server";
import type { AttachmentPointer } from "@/lib/mock-data";

// One sandbox per call, killed in `finally` — no persisted/idle sandboxes,
// so cost is proportional to actual compute, not wall-clock idle time.
// timeoutMs leaves headroom under route.ts's maxDuration = 60 for the rest
// of the agent loop (the model's next step after seeing this result).
const SANDBOX_TIMEOUT_MS = 25_000;

// Takes the session's known attachments (resolved server-side from message
// history in route.ts) so the model only ever has to pass a plain filename —
// never the opaque storage path. Earlier versions asked the model to copy the
// storage path verbatim from a "[Attached file: ... (path: ...)]" pointer,
// but a small model reliably mangled it (e.g. prepending the sandbox
// destination "/home/user/" onto it). Resolving by filename server-side
// removes that failure mode entirely.
export function createRunCodeTool(attachments: AttachmentPointer[]) {
  return tool({
    description:
      "Execute Python code in a sandboxed environment (pandas/numpy/matplotlib available) and return stdout/stderr/results. Use this for calculations, data analysis, or processing an attached file — do not attempt these by reasoning alone. If a file was attached earlier in this conversation, set fileName to its exact name (e.g. \"report.csv\") and your code can then read it from /home/user/<that name>.",
    inputSchema: z.object({
      code: z.string().describe("Python code to execute. If fileName is set, read the file from /home/user/<fileName>."),
      fileName: z.string().optional().describe("Exact filename of a previously attached file to make available, e.g. \"report.csv\""),
    }),
    execute: async ({ code, fileName }) => {
      const sbx = await Sandbox.create({ apiKey: process.env.E2B_API_KEY, timeoutMs: SANDBOX_TIMEOUT_MS });
      try {
        if (fileName) {
          const attachment = attachments.find((a) => a.name === fileName);
          if (attachment) {
            const supabase = await createClient();
            const { data } = await supabase.storage.from("chat-attachments").download(attachment.path);
            if (data) await sbx.files.write(`/home/user/${attachment.name}`, await data.arrayBuffer());
          }
        }

        const execution = await sbx.runCode(code, { timeoutMs: SANDBOX_TIMEOUT_MS });
        return {
          stdout: execution.logs.stdout.join("\n"),
          stderr: execution.logs.stderr.join("\n"),
          result: execution.text ?? null,
          error: execution.error ? `${execution.error.name}: ${execution.error.value}` : null,
          images: execution.results.filter((r) => r.png).map((r) => r.png as string),
        };
      } finally {
        await sbx.kill();
      }
    },
  });
}
