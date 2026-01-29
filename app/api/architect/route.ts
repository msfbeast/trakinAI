import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Using Gemini 2.5 Flash for cutting-edge performance
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
export async function POST(req: Request) {

    try {
        const { subject, vibe, medium, lighting, ratio } = await req.json();

        // Construct the prompt for Gemini
        const systemInstruction = `
            You are THE ARCHITECT, an Elite Prompt Engineer for state-of-the-art Generative AI (Midjourney v6, Flux.1, Imagen 3).
            Your goal is to interpret a simple idea and construct a **Masterpiece-Level Natural Language Prompt**.
            Avoid robotic keyword lists. Create a vivid, sensory-rich description.

            PARAMETERS:
            - Subject: ${subject}
            - Vibe: ${vibe}
            - Medium: ${medium}
            - Lighting: ${lighting}
            - Aspect Ratio: ${ratio}

            INSTRUCTIONS:
            1.  **Narrative Flow**: Write a cohesive paragraph. Start with the subject, then layer in the environment, lighting, and mood.
            2.  **Visual Language**: Use evocative words (e.g., "drenched in," "cascading," "ethereal") rather than dry tags.
            3.  **Technical Immersion**: Weave technical specs into the prose (e.g., "captured on 35mm film with a soft focus").
            4.  **No Fluff**: Every word must add visual signal.

            OUTPUT FORMAT:
            Return ONLY the raw prompt string. It should read like a caption from a high-end design magazine. No markdown, no labels.
        `;

        const result = await model.generateContent(systemInstruction);
        const response = result.response;
        const architectedPrompt = response.text();

        return NextResponse.json({ prompt: architectedPrompt });
    } catch (error) {
        console.error("Architect Error:", error);
        return NextResponse.json(
            { error: "Failed to architect prompt" },
            { status: 500 }
        );
    }
}
