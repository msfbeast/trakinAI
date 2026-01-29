#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ADMIN_SECRET = 'mazera-protocol-alpha';
const API_URL = 'http://localhost:3000/api/tools/create';

async function migrateTools() {
    console.log('🚀 Starting tool migration to Supabase...\n');

    // Read tools from db.json
    const dbPath = join(__dirname, '../lib/db.json');
    const tools = JSON.parse(readFileSync(dbPath, 'utf-8'));

    console.log(`📦 Found ${tools.length} tools in db.json\n`);

    let successCount = 0;
    let failCount = 0;

    for (const tool of tools) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': ADMIN_SECRET
                },
                body: JSON.stringify(tool)
            });

            if (response.ok) {
                console.log(`✅ Migrated: ${tool.name}`);
                successCount++;
            } else {
                const error = await response.text();
                console.log(`❌ Failed: ${tool.name} - ${error}`);
                failCount++;
            }
        } catch (error) {
            console.log(`❌ Error migrating ${tool.name}: ${error.message}`);
            failCount++;
        }

        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n📊 Migration complete!`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
}

migrateTools().catch(console.error);
