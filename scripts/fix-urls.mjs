#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ozbsbtbqoahdgnnkxyji.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_3A0JuR2SZPtlY_ntfHHWfg_083Xh2N8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Manual fixes for known broken URLs
const URL_FIXES = {
    'Claude 3.5 Sonnet': {
        platforms: [
            { type: 'web', url: 'https://www.anthropic.com/claude' },
            { type: 'other', url: 'https://docs.anthropic.com/en/docs/about-claude/models' }
        ]
    },
    'Sora 2': {
        platforms: [
            { type: 'web', url: 'https://openai.com/sora' }
        ]
    },
    'Midjourney v7': {
        platforms: [
            { type: 'web', url: 'https://www.midjourney.com/home' }
        ]
    },
    'ReAct Agent v3': null, // Remove - doesn't exist
    'VideoFusion Pro': null, // Remove - doesn't exist
    'Moltbot': {
        platforms: [
            { type: 'web', url: 'https://github.com/topics/ai-agent' }
        ],
        description: 'Self-hosted AI agent framework (early stage, no public release yet)'
    }
};

// Update redirected URLs to final destinations
const REDIRECT_FIXES = {
    'Flux.1': {
        platforms: [
            { type: 'huggingface', url: 'https://huggingface.co/black-forest-labs/FLUX.1-dev' },
            { type: 'web', url: 'https://bfl.ai/' }
        ]
    },
    'Llama 3.2': {
        platforms: [
            { type: 'huggingface', url: 'https://huggingface.co/meta-llama/Llama-3.2-90B-Vision' },
            { type: 'web', url: 'https://www.llama.com/' }
        ]
    },
    'Cursor': {
        platforms: [
            { type: 'web', url: 'https://cursor.com/' }
        ]
    },
    'Masterpiece X': {
        platforms: [
            { type: 'web', url: 'https://www.masterpiecex.com/' }
        ]
    },
    'Google DeepMind Genie 3': {
        platforms: [
            { type: 'web', url: 'https://labs.google/' }
        ]
    }
};

async function fixUrls() {
    console.log('🔧 Starting URL fixes...\n');

    // 1. Remove broken tools
    const toRemove = Object.entries(URL_FIXES)
        .filter(([_, fix]) => fix === null)
        .map(([name]) => name);

    if (toRemove.length > 0) {
        console.log('🗑️  Removing broken tools:');
        for (const name of toRemove) {
            const { error } = await supabase
                .from('tools')
                .delete()
                .eq('name', name);

            if (error) {
                console.log(`  ❌ Failed to remove ${name}: ${error.message}`);
            } else {
                console.log(`  ✅ Removed: ${name}`);
            }
        }
        console.log();
    }

    // 2. Fix broken URLs
    const toFix = Object.entries(URL_FIXES)
        .filter(([_, fix]) => fix !== null);

    if (toFix.length > 0) {
        console.log('🔧 Fixing broken URLs:');
        for (const [name, fix] of toFix) {
            const updateData = {};
            if (fix.platforms) updateData.platforms = fix.platforms;
            if (fix.description) updateData.description = fix.description;

            const { error } = await supabase
                .from('tools')
                .update(updateData)
                .eq('name', name);

            if (error) {
                console.log(`  ❌ Failed to fix ${name}: ${error.message}`);
            } else {
                console.log(`  ✅ Fixed: ${name}`);
            }
        }
        console.log();
    }

    // 3. Update redirected URLs
    console.log('⚡ Updating redirected URLs:');
    for (const [name, fix] of Object.entries(REDIRECT_FIXES)) {
        const { error } = await supabase
            .from('tools')
            .update({ platforms: fix.platforms })
            .eq('name', name);

        if (error) {
            console.log(`  ❌ Failed to update ${name}: ${error.message}`);
        } else {
            console.log(`  ✅ Updated: ${name}`);
        }
    }

    console.log('\n✨ URL cleanup complete!');
}

fixUrls().catch(console.error);
