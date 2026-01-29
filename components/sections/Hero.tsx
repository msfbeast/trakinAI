"use client"

import { Button } from "@/components/ui/button"
import { TextReveal } from "@/components/ui/TextReveal"
import { ArrowRight, ExternalLink } from "lucide-react"

export function Hero() {
    return (
        <header className="relative py-32 lg:py-48 px-6 lg:px-12 flex flex-col items-center justify-center text-center overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-200 rounded-full blur-[120px] opacity-50" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full border border-zinc-200">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">System Online // v2.0.0</span>
                </div>

                <TextReveal
                    text="THE INDEX"
                    className="block text-7xl md:text-9xl font-black tracking-tighter text-zinc-900 leading-[0.9]"
                />

                <p className="text-xl md:text-2xl text-zinc-500 font-medium max-w-2xl mx-auto leading-relaxed">
                    Curated intelligence for the next generation of builders.
                    <span className="block mt-2 text-zinc-400 text-lg">Powered by Gemini 2.0 Flash</span>
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <Button
                        size="lg"
                        className="rounded-full h-14 px-8 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Explore Tools
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="rounded-full h-14 px-8 border-2 border-zinc-200 text-zinc-900 font-bold text-lg hover:bg-zinc-50"
                        onClick={() => window.open('https://github.com/msfbeast/trakinAI', '_blank')}
                    >
                        GitHub
                        <ExternalLink className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </div>

            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </header>
    )
}
