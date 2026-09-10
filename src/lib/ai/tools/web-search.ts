import { tool } from "ai";
import { tavily } from "@tavily/core";
import { z } from "zod";

export const webSearch = tool({
  description: "Search the live web for current information and return top results with URLs to cite.",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query }) => {
    const client = tavily({ apiKey: process.env.TAVILY_API_KEY! });
    const response = await client.search(query, { includeAnswer: "basic" });
    return {
      answer: response.answer,
      results: response.results.slice(0, 5).map((r) => ({
        title: r.title,
        url: r.url,
        content: r.content,
      })),
    };
  },
});
