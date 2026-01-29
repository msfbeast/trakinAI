"use client"

import { InfiniteMarquee } from "@/components/ui/InfiniteMarquee"

export function Featured() {
    return (
        <section id="featured" className="py-12 border-y border-zinc-100 bg-zinc-50/50">
            <div className="mb-8 px-6 lg:px-12 text-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Featured Ecosystems</h3>
            </div>
            <InfiniteMarquee speed="fast">
                {['Anthropic', 'OpenAI', 'Google DeepMind', 'Midjourney', 'Stability AI', 'Mistral', 'Hugging Face', 'Replicate', 'Vercel', 'Supabase'].map((brand) => (
                    <div key={brand} className="mx-8 text-4xl font-black text-zinc-200 uppercase tracking-tighter select-none">
                        {brand}
                    </div>
                ))}
            </InfiniteMarquee>
        </section>
    )
}
