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

        const prompt = `Analyze this image deeply. I need a robust text-to-image prompt to recreate it exactly.
    Include these specific details:
    1.  **Subject & Action**: What is happening? Who/what is the focus?
    2.  **Camera & Angle**: (e.g., Low angle, wide shot, macro, telephoto, top-down).
    3.  **Lighting**: (e.g., Soft studio light, hard rim light, volumetric fog, neon cyberpunk, golden hour).
    4.  **Style & Medium**: (e.g., 3D Render, Oil Painting, Hyperrealistic Photography, Anime, Sketch).
    5.  **Technical Details**: (e.g., 8k, highly detailed, depth of field, bokeh, f/1.8).
    
    Format the output as a single raw prompt string suitable for Midjourney or Stable Diffusion. Do not include labels like "Subject:" or "Lighting:". Just the comma-separated keywords and sentences.`;

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
