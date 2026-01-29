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
            console.error("FATAL: GEMINI_API_KEY is missing in server environment");
            return NextResponse.json(
                { error: "API Key not configured" },
                { status: 500 }
            );
        }

        // Remove the data URL prefix to get just the base64 string
        const base64Data = image.split(",")[1];
        console.log("Analyze Request Received. Image Payload Size:", base64Data.length);

        const prompt = `You are an Elite Reverse Engineer for High-End AI Image Generation (Imagen 3 / Gemini Ultra).
    Your task is to deconstruct this image into a **Masterpiece-Level Natural Language Prompt**.
    "Basic" is failure. We need extreme depth, nuance, and visual richness.

    **Instructions:**
    1.  **Macro to Micro**: Start with the scene, then zoom into textures, lighting, and tiny details.
    2.  **Sensory Language**: Describe the *feeling* of the light, the *weight* of the materials.
    3.  **Technical & Artistic Fusion**: Combine artistic terms with technical specs.
    4.  **No Hallucinations**: Be precise about what is actually there.

    **OUTPUT FORMAT**:
    A rich, multi-paragraph text block. Do not use labels. Make it dense, evocative, and exhaustive.`;

        let text = "";

        try {
            // ATTEMPT 1: Bleeding Edge (Gemini 2.5 Flash)
            console.log("Attempting Analysis with Gemini 2.5 Flash...");
            const model25 = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model25.generateContent([
                prompt,
                { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
            ]);
            text = result.response.text();

        } catch (error) {
            console.warn("Gemini 2.5 Failed. Details:", error);
            // @ts-expect-error: error is unknown
            if (error.response) console.warn("Gemini 2.5 API Response:", await error.response.text());

            // ATTEMPT 2: Stable-ish (Gemini 2.0 Flash)
            console.log("Attempting Fallback to Gemini 2.0 Flash...");
            try {
                const model20 = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                const result = await model20.generateContent([
                    prompt,
                    { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
                ]);
                text = result.response.text();
            } catch (fallbackError) {
                console.error("Gemini 2.0 Fallback Failed. Details:", fallbackError);
                // @ts-expect-error: error is unknown
                if (fallbackError.response) console.error("Gemini 2.0 API Response:", await fallbackError.response.text());
                throw fallbackError; // Re-throw to be caught by outer handler
            }
        }

        return NextResponse.json({ prompt: text });
    } catch (error) {
        console.error("Analysis CRITICAL FAILURE:", error);
        return NextResponse.json(
            { error: "Failed to analyze image", details: String(error) },
            { status: 500 }
        );
    }
}
