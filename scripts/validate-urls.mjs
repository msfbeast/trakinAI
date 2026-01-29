#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ozbsbtbqoahdgnnkxyji.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_3A0JuR2SZPtlY_ntfHHWfg_083Xh2N8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function validateUrl(url, timeout = 5000) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; TrakinAI URL Validator/1.0)'
            }
        });

        clearTimeout(timeoutId);

        return {
            url,
            status: response.status,
            ok: response.ok,
            redirected: response.redirected,
            finalUrl: response.url,
            error: null
        };
    } catch (error) {
        return {
            url,
            status: 0,
            ok: false,
            redirected: false,
            finalUrl: url,
            error: error.message
        };
    }
}

async function validateTools() {
    console.log('🔍 Starting URL validation...\n');

    // Fetch all tools
    const { data: tools, error } = await supabase
        .from('tools')
        .select('*');

    if (error) {
        console.error('❌ Failed to fetch tools:', error);
        return;
    }

    console.log(`📦 Found ${tools.length} tools to validate\n`);

    const results = {
        total: 0,
        valid: 0,
        broken: 0,
        redirected: 0,
        timeout: 0,
        brokenTools: []
    };

    for (const tool of tools) {
        console.log(`\n🔧 ${tool.name}`);

        for (const platform of tool.platforms || []) {
            results.total++;
            const result = await validateUrl(platform.url);

            if (result.ok) {
                results.valid++;
                if (result.redirected) {
                    results.redirected++;
                    console.log(`  ⚠️  ${platform.type}: ${result.status} (redirected)`);
                    console.log(`      ${platform.url} → ${result.finalUrl}`);
                } else {
                    console.log(`  ✅ ${platform.type}: ${result.status}`);
                }
            } else {
                results.broken++;
                results.brokenTools.push({
                    name: tool.name,
                    id: tool.id,
                    platform: platform.type,
                    url: platform.url,
                    error: result.error || `HTTP ${result.status}`
                });
                console.log(`  ❌ ${platform.type}: ${result.error || result.status}`);
                console.log(`      ${platform.url}`);
            }

            // Small delay to be respectful
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    // Summary
    console.log(`\n\n📊 Validation Summary`);
    console.log(`   Total URLs: ${results.total}`);
    console.log(`   ✅ Valid: ${results.valid}`);
    console.log(`   ❌ Broken: ${results.broken}`);
    console.log(`   ⚠️  Redirected: ${results.redirected}`);

    if (results.brokenTools.length > 0) {
        console.log(`\n\n🚨 Broken Links Report:`);
        console.log(`   The following tools have broken links:\n`);
        for (const broken of results.brokenTools) {
            console.log(`   • ${broken.name} (${broken.platform})`);
            console.log(`     URL: ${broken.url}`);
            console.log(`     Error: ${broken.error}\n`);
        }
    } else {
        console.log(`\n✨ All URLs are healthy!`);
    }
}

validateTools().catch(console.error);
