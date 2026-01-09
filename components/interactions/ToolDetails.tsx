"use client"

import { Tool } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Github, Globe, ExternalLink, ArrowRight } from "lucide-react"
import Link from "next/link"

export function ToolDetails({ tool }: { tool: Tool }) {
    return (
        <div className="flex flex-col h-full bg-white text-zinc-900 font-sans">
            {/* Header / Featured Image Placeholder */}
            <div className="h-64 bg-zinc-100 relative overflow-hidden flex items-center justify-center p-8 border-b border-zinc-200">
                <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-multiply" />

                {/* Scaled Text - Responsive and Contained */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mix-blend-difference tracking-tighter leading-none opacity-20 select-none text-center max-w-full break-normal">
                    {tool.name}
                </h1>

                <div className="absolute bottom-4 left-6 flex items-center gap-3">
                    {tool.featured && (
                        <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold uppercase tracking-widest rounded-full">
                            Featured
                        </span>
                    )}
                    <span className="px-3 py-1 bg-white/50 backdrop-blur text-zinc-900 text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/20">
                        {tool.pricing}
                    </span>
                </div>
            </div>

            <div className="p-8 flex-grow overflow-y-auto">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                    <div>
                        <h2 className="text-4xl font-bold tracking-tighter mb-2">{tool.name}</h2>
                        <div className="flex gap-2 text-zinc-400">
                            {tool.tags.map(tag => (
                                <span key={tag} className="text-xs font-bold uppercase tracking-widest">#{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="md:col-span-2">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">About</h3>
                        <p className="text-xl leading-relaxed font-medium text-zinc-600">
                            {tool.description}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">Access</h3>
                        {tool.platforms.map((platform, idx) => (
                            <Link key={idx} href={platform.url} target="_blank" className="block group">
                                <Button variant="outline" className="w-full justify-start gap-4 h-14 px-4 rounded-xl border-zinc-200 text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all group-hover:scale-105">
                                    {/* Icon Container */}
                                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 group-hover:bg-zinc-800 transition-colors">
                                        <PlatformIcon type={platform.type} />
                                    </div>
                                    <span className="font-bold uppercase tracking-wide text-xs flex-grow text-left truncate min-w-0">
                                        {platform.type === 'huggingface' ? 'HuggingFace' : platform.type}
                                    </span>
                                    <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 flex-shrink-0" />
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function PlatformIcon({ type }: { type: string }) {
    switch (type) {
        case 'github':
            return <Github className="w-5 h-5" />;
        case 'huggingface': // Custom Emoji/SVG for HuggingFace
            return <span className="text-lg leading-none">🤗</span>;
        case 'web':
            return <Globe className="w-5 h-5" />;
        default:
            return <ExternalLink className="w-5 h-5" />;
    }
}

