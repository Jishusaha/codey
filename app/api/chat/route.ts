import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are an expert full-stack developer assistant specialized in building modern portfolio and showcase websites for students.

## Your Role
You help users build complete, production-ready websites by generating and modifying project files. You work with React (using JSX, no build step needed) and plain HTML/CSS/JS.

## Key Rules
1. Generate COMPLETE, WORKING code — never use placeholders like "// rest of code here" or "...".
2. Use modern, responsive designs with clean CSS. Prefer CSS variables for theming.
3. The preview environment runs React directly in the browser via Babel transformation. Use these import patterns:
   - import React from "react" (or rely on automatic JSX runtime)
   - export default function App() { ... }
   - Use inline styles or a separate styles.css file — Tailwind is NOT available in the preview.
4. For React projects, always provide:
   - /App.js or /App.jsx — the main component (must export default)
   - /styles.css — all styling
5. For static projects, provide:
   - /index.html — complete HTML with inline or linked CSS
   - /styles.css — styles
   - /script.js — any JavaScript
6. Make designs look professional: use good spacing, readable fonts, sensible color palettes, and mobile-responsive layouts.
7. Include realistic placeholder content (names, project titles, descriptions) that a student would use.
8. When modifying existing files, return the COMPLETE file content, not just the changed parts.

## Design Guidelines
- Use modern color schemes (dark themes work well for portfolios)
- Ensure good contrast and readability
- Add hover states and transitions for interactive elements
- Use CSS Grid or Flexbox for layouts
- Include sections like: hero, about, projects/skills, contact
- Make it responsive: mobile-first, with breakpoints for larger screens

## Error Fixing
When asked to fix errors or when the user reports something isn't working:
- Analyze the error message carefully
- Fix the root cause, not just symptoms
- Return all affected files with complete corrected content
- Explain what was wrong and how you fixed it`;

export async function POST(req: Request) {
  try {
    const { messages, currentFiles } = await req.json();

    const provider = (process.env.AI_PROVIDER || "google").toLowerCase();
    const hasProviderKey =
      provider === "google"
        ? Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY)
        : provider === "openai"
          ? Boolean(process.env.OPENAI_API_KEY)
          : false;

    if (!hasProviderKey) {
      return Response.json(
        {
          error:
            provider === "google"
              ? "Missing GOOGLE_GENERATIVE_AI_API_KEY. Add a Gemini API key to .env.local, or set AI_PROVIDER=openai to use OpenAI."
              : "Missing OPENAI_API_KEY. Add an OpenAI API key to .env.local, or set AI_PROVIDER=google to use Gemini.",
        },
        { status: 500 },
      );
    }

    if (provider !== "google" && provider !== "openai") {
      return Response.json(
        { error: "Unsupported AI_PROVIDER. Use google or openai." },
        { status: 500 },
      );
    }

    const fileSchema = z.object({
      explanation: z
        .string()
        .describe("Brief description of the changes made and why."),
      files: z.array(
        z.object({
          path: z
            .string()
            .describe("Relative file path, e.g., /App.js, /styles.css, /index.html"),
          content: z
            .string()
            .describe("Complete content of the file — no placeholders or truncation"),
        }),
      ),
    });

    const googleModel = process.env.GOOGLE_MODEL || "gemini-3.6-flash";
    const model =
      provider === "google"
        ? google(googleModel)
        : openai("gpt-4o");

    const result = await generateObject({
      model,
      system: `${SYSTEM_PROMPT}\n\n## Current Project Files\n${JSON.stringify(currentFiles, null, 2)}`,
      messages,
      schema: fileSchema,
    });

    return Response.json(result.object);
  } catch (error: any) {
    const message = error?.message || "Failed to generate the project files.";
    const isBillingError = /credits|billing|quota|insufficient|resource exhausted/i.test(
      message,
    );
    const provider = (process.env.AI_PROVIDER || "google").toLowerCase();
    return Response.json(
      {
        error: isBillingError
          ? `${provider === "google" ? "Gemini" : "OpenAI"} has no available quota for this key. Add credits or replace the provider key, then try again.`
          : message,
      },
      { status: isBillingError ? 503 : 500 },
    );
  }
}
