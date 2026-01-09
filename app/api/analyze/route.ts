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

        const prompt = `You are an Expert Prompt Engineer for Gemini (Imagen 3).
    Your task is to deconstruct this image into a fluid, descriptive, and highly detailed natural language prompt.
    Unlike Midjourney, Gemini prefers complete sentences and rich context over keyword soup.

    **Structure your response as a single, cohesive paragraph covering:**
    1.  **Subject**: Start with a clear sentence describing the main subject and action.
    2.  **Setting & Context**: Describe the environment, background, and atmosphere naturally.
    3.  **Artistic Style**: Integrate the style (e.g., "photorealistic," "3D render") into the sentences (e.g., "Rendered in a hyper-realistic 3D style...").
    4.  **Lighting & Color**: Describe the lighting mood (e.g., "bathed in soft, golden hour sunlight").
    5.  **Technical Nuances**: Weave technical details into the description (e.g., "captured with a shallow depth of field focusing sharply on the subject").

    **OUTPUT FORMAT**:
    Return ONLY the raw prompt string. It should read like a vivid story or a detailed caption from a high-end photography magazine. Do not use bullet points or labels.`;

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
