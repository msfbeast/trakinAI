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

        const prompt = `You are optimizing for "Gemini Flash" Image Generation.
    Your task is to create a **Balanced, High-Fidelity** image description.
    Flash models excel with clear, structured instructions that are neither too vague nor too verbose.

    **Instructions:**
    1.  **Medium First**: Start with the art style/medium (e.g., "A photorealistic close-up...", "A stylized 3D render...").
    2.  **Subject Clarity**: Clearly define the subject's pose and action in the first sentence.
    3.  **Visual Anchors**: Describe key colors, lighting, and textures explicitly.
    4.  **No Ambiguity**: Avoid poetic metaphors; use concrete visual terms.

    **OUTPUT FORMAT**:
    A single, crystal-clear paragraph (approx 2-3 sentences). Precise, descriptive, and ready for high-speed generation.`;

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
