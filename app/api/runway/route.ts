import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Use generation-config to force JSON response if supported, but prompt engineering usually works.
// Enabling googleSearchRetrieval tool for real-time data.
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    // @ts-expect-error: Experimental feature
    tools: [{ googleSearch: {} }]
});

export async function GET() {
    try {
        const systemInstruction = `
            You are a Trend Analyst using Google Search to find the latest data.
            Find 5 NEW Tech Hardware products released or trending in the last 30 days.
            Focus on: AI Gadgets, VR/AR, Smart Wearables, or Robotics.
            
            OUTPUT FORMAT:
            Return ONLY a raw JSON array of objects. No markdown.
            
            Structure:
            [
                {
                    "name": "Product Name",
                    "description": "Editorial description of why it's trending.",
                    "id": "DROP_00X",
                    "tags": ["Tag1", "Tag2"]
                }
            ]
        `;

        const result = await model.generateContent(systemInstruction);
        const response = result.response;
        const text = response.text();

        // Robust JSON extraction
        const jsonStart = text.indexOf('[');
        const jsonEnd = text.lastIndexOf(']');

        let concepts = [];
        if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonStr = text.substring(jsonStart, jsonEnd + 1);
            concepts = JSON.parse(jsonStr);
        } else {
            concepts = JSON.parse(text);
        }

        return NextResponse.json({ concepts });
    } catch (error) {
        console.error("Runway Error:", error);
        // Fallback data if API fails
        return NextResponse.json({
            concepts: [
                { name: "APPLE VISION PRO", description: "Spatial computing enters the mainstream.", id: "DROP_001", tags: ["Spatial", "VR"] },
                { name: "RABBIT R1", description: "The pocket companion that skips the app store.", id: "DROP_002", tags: ["AI", "Assistant"] },
                { name: "RAY-BAN META", description: "Multimodal intelligence in a classic frame.", id: "DROP_003", tags: ["Wearable", "Audio"] }
            ]
        });
    }
}
