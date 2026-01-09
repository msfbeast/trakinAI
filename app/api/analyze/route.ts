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

        const prompt = `You are optimizing for "Gemini Nano" (Code: Banana).
    Your task is to create a **Punchy, Dense, and Vivid** image description.
    Small models need clarity, not length.

    **Instructions:**
    1.  **Direct & Action-Oriented**: Start immediately with the subject (e.g., "A cyberpunk samurai drawing a neon katana...").
    2.  **Visual Keywords**: Pack lines with adjectives (e.g., "iridescent," "gritty," "volumetric").
    3.  **No Fluff**: Remove "The image shows..." or "In this scene...".
    4.  **Structure**: Subject + Action + Environment + Lighting + Style.

    **OUTPUT FORMAT**:
    A single, highly descriptive paragraph. Maximum impact, minimum words.`;

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
