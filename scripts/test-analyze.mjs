#!/usr/bin/env node

// Test the new /api/tools/analyze endpoint

const TEST_URLS = [
    'https://runway.ml/',
    'https://elevenlabs.io/',
    'https://pika.art/'
];

async function testAnalyze() {
    console.log('🧪 Testing /api/tools/analyze endpoint\n');

    for (const url of TEST_URLS) {
        console.log(`\n📡 Analyzing: ${url}`);

        try {
            const response = await fetch('http://localhost:3000/api/tools/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Success!`);
                console.log(`   Name: ${data.tool.name}`);
                console.log(`   Description: ${data.tool.description.substring(0, 80)}...`);
                console.log(`   Tags: ${data.tool.tags.join(', ')}`);
                console.log(`   Pricing: ${data.tool.pricing}`);
                console.log(`   Featured: ${data.tool.featured}`);
            } else {
                const error = await response.text();
                console.log(`❌ Failed: ${error}`);
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }

        // Delay between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n\n✨ Test complete!`);
}

testAnalyze().catch(console.error);
