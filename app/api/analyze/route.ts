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

        const prompt = `You are a Reverse Engineering Expert for Generative AI. 
    Your task is to deconstruct this image into a single, highly technical "Master Prompt" capable of reproducing it exactly in Midjourney v6 or Flux.1.
    
    Focus intensively on these layers:
    1.  **Subject & Action**: Precise description of the core subject, pose, and activity.
    2.  **Visual Style**: Specific artistic medium (e.g., "Cinematic Film Still", "3D Octane Render", "Oil Painting on Canvas").
    3.  **Technical Specs**: Camera (e.g., "Leica M6", "Sony A7R IV"), Lens (e.g., "35mm f/1.4", "85mm Macro"), Film Stock (e.g., "Kodak Portra 400"), or Engine (e.g., "Unreal Engine 5").
    4.  **Lighting & Atmosphere**: Exact lighting setup (e.g., "Rembrandt lighting", "Volumetric god rays", "Neon rim light", "Subsurface scattering").
    5.  **Composition**: Framing and angle (e.g., "Dutch angle", "Wide shot", "Center-weighted", "Bokeh background").
    6.  **Micro-Details**: Texture and imperfections (e.g., "Film grain", "Chromatic aberration", "Dust motes", "Hyper-detailed textures").

    **OUTPUT FORMAT**:
    Return ONLY the raw prompt string. Do not use labels like "Subject:" or bullet points. Connect strict keywords and descriptive sentences with commas. Make it dense, vivid, and technically precise.`;

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
