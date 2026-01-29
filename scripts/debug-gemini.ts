
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

// Load env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testGemini() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Checking API Key:", key ? `Found (${key.slice(0, 5)}...)` : "MISSING");

    if (!key) {
        console.error("❌ API Key missing. Aborting.");
        return;
    }

    const genAI = new GoogleGenerativeAI(key);

    // Test 1: Gemini 2.5 Flash (Bleeding Edge)
    console.log("\n--- Testing Gemini 2.5 Flash ---");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Hello, world! response in json");
        console.log("✅ Success! Response:", result.response.text());
    } catch (error: any) {
        console.error("❌ Failed:", error.message);
    }

    // Test 2: Gemini 2.0 Flash (Stable)
    console.log("\n--- Testing Gemini 2.0 Flash ---");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Hello, world! response in json");
        console.log("✅ Success! Response:", result.response.text());
    } catch (error: any) {
        console.error("❌ Failed:", error.message);
    }
}

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return;

    console.log("\n--- Listing Available Models ---");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        if (data.models) {
            console.log("Available Models:");
            data.models.forEach((m: any) => console.log(`- ${m.name} (${m.displayName})`));
        } else {
            console.error("No models found or error:", data);
        }
    } catch (error: any) {
        console.error("List Models Failed:", error.message);
    }
}

async function main() {
    await testGemini();
    await listModels();
}

main();
