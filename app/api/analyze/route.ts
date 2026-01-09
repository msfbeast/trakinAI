import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "API Key not configured" },
                { status: 500 }
            );
        }

        // Remove the data URL prefix to get just the base64 string
        const base64Data = image.split(",")[1];

        // Using Gemini 2.0 Flash Experimental/Preview for cutting-edge performance
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const prompt = `You are an Elite Reverse Engineer for High-End AI Image Generation (Imagen 3 / Gemini Ultra).
    Your task is to deconstruct this image into a **Masterpiece-Level Natural Language Prompt**.
    "Basic" is failure. We need extreme depth, nuance, and visual richness.

    **Instructions:**
    1.  **Macro to Micro**: Start with the scene, then zoom into textures, lighting, and tiny details.
    2.  **Sensory Language**: Don't just see it; describe the *feeling* of the light, the *weight* of the materials.
    3.  **Technical & Artistic Fusion**: Combine artistic terms (e.g., "chiaroscuro", "impasto") with technical specs (e.g., "85mm focal length", "volumetric fog").
    4.  **No Hallucinations**: Be precise about what is actually there, but describe it beautifully.

    **Structure:**
    - **Paragraph 1 (The Core)**: Subject, Action, and immediate surroundings.
    - **Paragraph 2 (The Atmosphere)**: Lighting, Color Palette, Mood, and Camera nuance.
    - **Paragraph 3 (The Texture)**: Imperfections, surface details, and fine-grain focus.

    **OUTPUT FORMAT**:
    A rich, multi-paragraph text block. Do not use labels. Make it dense, evocative, and exhaustive.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg",
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ prompt: text });
    } catch (error) {
        console.error("Analysis failed:", error);
        return NextResponse.json(
            { error: "Failed to analyze image", details: String(error) },
            { status: 500 }
        );
    }
}
