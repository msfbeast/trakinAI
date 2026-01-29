"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"

interface Concept {
    name: string
    description: string
    id: string
    tags: string[]
}

export function Runway() {
    const [concepts, setConcepts] = useState<Concept[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/runway')
            .then(res => res.json())
            .then(data => {
                setConcepts(data.concepts)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    return (
        <section className="py-24 bg-zinc-900 text-white overflow-hidden">
            <div className="px-6 lg:px-12 mb-12 flex justify-between items-end">
                <div>
                    <h2 className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-4">
                        THE RUNWAY
                    </h2>
                    <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest max-w-md">
                        Trending Hardware // Curated by Gemini 2.5 Flash
                    </p>
                </div>
                <div className="hidden md:block">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse inline-block mr-2" />
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Live Feed</span>
                </div>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="flex gap-6 overflow-x-auto pb-12 px-6 lg:px-12 no-scrollbar snap-x snap-mandatory">
                {loading ? (
                    // Skeletons
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="min-w-[300px] md:min-w-[400px] h-[500px] bg-zinc-800 rounded-[2rem] animate-pulse" />
                    ))
                ) : (
                    concepts.map((concept, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="snap-center relative min-w-[300px] md:min-w-[400px] h-[500px] bg-zinc-800 rounded-[2rem] p-8 flex flex-col justify-between group cursor-pointer hover:bg-zinc-100 hover:text-zinc-900 transition-colors duration-500 border border-zinc-700 hover:border-white"
                        >
                            <div className="flex justify-between items-start">
                                <span className="font-mono text-xs opacity-50 border border-current px-2 py-1 rounded-full uppercase tracking-widest">
                                    {concept.id}
                                </span>
                                <ArrowUpRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <div className="mt-auto">
                                <div className="flex flex-wrap gap-2 mb-6 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                                    {concept.tags.map(tag => (
                                        <span key={tag} className="text-[10px] font-bold uppercase tracking-widest bg-black/5 px-2 py-1 rounded">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                <h3 className="text-5xl font-black tracking-tight leading-[0.9] mb-4 break-words">
                                    {concept.name}
                                </h3>
                                <div className="h-px w-12 bg-current mb-4" />
                                <p className="font-medium text-lg leading-tight opacity-60 group-hover:opacity-100 transition-opacity">
                                    {concept.description}
                                </p>
                            </div>

                            {/* Hover Abstract Blur */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />
                        </motion.div>
                    ))
                )}

                {/* End Cap */}
                <div className="min-w-[200px] flex items-center justify-center text-zinc-700 font-black text-6xl tracking-tighter opacity-20 select-none">
                    END OF<br />STREAM
                </div>
            </div>
        </section>
    )
}
