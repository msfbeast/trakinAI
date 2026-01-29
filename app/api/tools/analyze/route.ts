import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { scrapeUrl, extractTextContent, detectPricing } from "@/lib/scraper";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json(
                { error: "URL is required" },
                { status: 400 }
            );
        }

        console.log(`🔍 Analyzing tool: ${url}`);

        // Step 1: Scrape webpage
        const metadata = await scrapeUrl(url);
        const textContent = extractTextContent(metadata.html || '');
        const detectedPricing = detectPricing(metadata.html || '', textContent);

        // Step 2: Use Gemini to analyze and enrich
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const prompt = `
Analyze this AI tool website and provide structured information:

URL: ${url}
Title: ${metadata.title}
Description: ${metadata.description}
Keywords: ${metadata.keywords?.join(', ')}

Content Preview:
${textContent.substring(0, 2000)}

Extract:
1. Tool Name (clean, official name)
2. Concise Description (2-3 sentences, punchy, highlight key features)
3. Tags (3-5 relevant tags like "Image", "Video", "3D", "LLM", "Coding", "Agent", "Real-time", etc.)
4. Pricing Model (Free/Freemium/Paid)
5. Is this a Featured/Trending tool? (true/false)

OUTPUT STRICT JSON:
{
  "name": "...",
  "description": "...",
  "tags": ["...", "..."],
  "pricing": "Free" | "Freemium" | "Paid",
  "featured": true | false
}
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Failed to extract JSON from AI response");
        }

        const aiData = JSON.parse(jsonMatch[0]);

        // Step 3: Build enriched tool object
        const enrichedTool = {
            id: uuidv4(),
            name: aiData.name || metadata.title || 'Unknown Tool',
            description: aiData.description || metadata.description || '',
            tags: aiData.tags || [],
            pricing: aiData.pricing || detectedPricing || 'Paid',
            platforms: [{ type: 'web' as const, url }],
            image: metadata.ogImage,
            featured: aiData.featured || false
        };

        console.log(`✅ Analyzed: ${enrichedTool.name}`);

        return NextResponse.json({
            success: true,
            tool: enrichedTool,
            metadata: {
                scrapedTitle: metadata.title,
                scrapedDescription: metadata.description,
                detectedPricing,
                favicon: metadata.favicon
            }
        });

    } catch (error) {
        console.error("Analysis failed:", error);
        return NextResponse.json(
            {
                error: "Failed to analyze URL",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
