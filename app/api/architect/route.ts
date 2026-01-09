import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Using Gemini 2.0 Flash Experimental/Preview for cutting-edge performance
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
export async function POST(req: Request) {

    try {
        const { subject, vibe, medium, lighting, ratio } = await req.json();

        // Construct the prompt for Gemini
        const systemInstruction = `
            You are THE ARCHITECT, an advanced AI prompt engineer for high-end generative models like Midjourney v6 and Flux.1.
            Your goal is to take a simple subject and a set of parameters, and construct a highly detailed, professional-grade image prompt.

            PARAMETERS:
            - Subject: ${subject}
            - Vibe: ${vibe}
            - Medium: ${medium}
            - Lighting: ${lighting}
            - Aspect Ratio: ${ratio}

            INSTRUCTIONS:
            1. Expand the subject with rich visual details matching the vibe.
            2. Describe the medium (e.g., "shot on Kodak Portra 400", "oil painting with heavy impasto").
            3. Describe the lighting setup meticulously (e.g., "volumetric god rays", "neon rim lighting").
            4. Add technical keywords for quality (e.g., "8k", "hyper-realistic", "unreal engine 5 render").
            5. Append the aspect ratio flag (e.g., "--ar 16:9").

            OUTPUT FORMAT:
            Provide ONLY the raw prompt. Do not add "Here is the prompt" or markdown code blocks.
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
