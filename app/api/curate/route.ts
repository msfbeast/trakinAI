
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getTools, saveTools, Tool } from "@/lib/data";
import { v4 as uuidv4 } from 'uuid';


export async function POST() {


    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        // @ts-expect-error: Experimental feature not yet in types
        tools: [{ googleSearch: {} }]
    });

    try {
        const currentTools = await getTools();
        const existingNames = new Set(currentTools.map(t => t.name.toLowerCase()));

        // Ask Gemini to find NEW tools specifically
        const prompt = `
            Find 3 top trending AI tools released or updated heavily in late 2025 or 2026.
            Exclude these already known tools: ${Array.from(existingNames).join(', ')}.
            Focus on: 3D Generation, Agents, Video, or Coding.
            
            OUTPUT FORMAT:
            Strict JSON array of objects fitting this schema:
            {
                "name": "Tool Name",
                "description": "Short punchy description (max 100 chars)",
                "tags": ["Tag1", "Tag2"],
                "pricing": "Free" | "Freemium" | "Paid",
                "url": "Project Website URL",
                "repo": "GitHub URL (optional)"
            }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Balanced Bracket Parser to find the FIRST valid JSON array
        let jsonStart = text.indexOf('[');
        let jsonEnd = -1;

        if (jsonStart !== -1) {
            let balance = 0;
            for (let i = jsonStart; i < text.length; i++) {
                if (text[i] === '[') balance++;
                else if (text[i] === ']') balance--;

                if (balance === 0) {
                    jsonEnd = i;
                    break;
                }
            }
        }

        // Logging for profound debugging if this fails
        if (jsonStart === -1 || jsonEnd === -1) {
            console.error("JSON PARSE FATAL: Could not find balanced brackets.");
            console.error("RAW TEXT:", text);
            throw new Error("Invalid output format from Model");
        }

        const jsonStr = text.substring(jsonStart, jsonEnd + 1);
        const newItems = JSON.parse(jsonStr);

        let addedCount = 0;
        const toolsToAdd: Tool[] = [];

        for (const item of newItems) {
            if (!existingNames.has(item.name.toLowerCase())) {
                const platforms = [];
                if (item.url) platforms.push({ type: 'web' as const, url: item.url });
                if (item.repo) platforms.push({ type: 'github' as const, url: item.repo });

                toolsToAdd.push({
                    id: uuidv4(),
                    name: item.name,
                    description: item.description,
                    tags: item.tags,
                    pricing: item.pricing,
                    platforms: platforms,
                    featured: false // Auto-added tools aren't featured by default
                });
                addedCount++;
            }
        }

        if (addedCount > 0) {
            await saveTools([...currentTools, ...toolsToAdd]);
        }

        return NextResponse.json({
            success: true,
            added: addedCount,
            tools: toolsToAdd
        });

    } catch (error) {
        console.error("Curator Critical Failure:", error);
        return NextResponse.json(
            { error: "Failed to curate tools", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
