"use client"

import { useState } from "react"
import { FlashlightCard } from "@/components/ui/FlashlightCard"
import { LayoutGrid, List as ListIcon, MoveUpRight, Zap, GalleryHorizontal } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Tool } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { CircularCarousel } from "@/components/ui/CircularCarousel" // Import new component

interface ToolGridProps {
    tools: Tool[]
    onSelect: (tool: Tool) => void
}

export function ToolGrid({ tools, onSelect }: ToolGridProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'carousel'>('carousel')

    return (
        <section id="collection" className="py-24 px-6 lg:px-12 max-w-[1800px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div>
                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-zinc-900 mb-4">
                        COLLECTION
                    </h2>
                    <p className="text-zinc-500 font-medium text-lg">
                        {tools.length} verified tools available
                    </p>
                </div>

                <div className="flex gap-2 p-1 bg-zinc-100 rounded-lg">
                    <Button
                        onClick={() => setViewMode('carousel')}
                        variant="ghost"
                        size="sm"
                        className={`rounded-md ${viewMode === 'carousel' ? 'bg-white shadow-sm' : 'text-zinc-400'}`}
                    >
                        <GalleryHorizontal className="w-4 h-4" />
                    </Button>
                    <Button
                        onClick={() => setViewMode('grid')}
                        variant="ghost"
                        size="sm"
                        className={`rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-zinc-400'}`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </Button>
                    <Button
                        onClick={() => setViewMode('list')}
                        variant="ghost"
                        size="sm"
                        className={`rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-zinc-400'}`}
                    >
                        <ListIcon className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {viewMode === 'carousel' && (
                <div className="w-full">
                    <CircularCarousel items={tools} onSelect={onSelect} />
                </div>
            )}

            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {tools.map((tool) => (
                            <motion.div
                                key={tool.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={() => onSelect(tool)}
                            >
                                <FlashlightCard className="h-full bg-zinc-50 border border-zinc-200 hover:border-zinc-900 transition-colors p-8 rounded-[2rem] flex flex-col justify-between group cursor-pointer">
                                    <div className="mb-8">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-500">
                                                {/* Fallback Icon logic if no image/icon provided */}
                                                <Zap className="w-6 h-6 text-zinc-900" />
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white p-2 rounded-full -mr-2 -mt-2">
                                                <MoveUpRight className="w-4 h-4" />
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-black tracking-tight text-zinc-900 mb-2">{tool.name}</h3>
                                        <p className="text-zinc-500 font-medium leading-relaxed line-clamp-3">{tool.description}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {tool.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-white border border-zinc-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:border-zinc-300 transition-colors">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </FlashlightCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {viewMode === 'list' && (
                <div className="flex flex-col gap-4">
                    {tools.map((tool) => (
                        <div
                            key={tool.id}
                            onClick={() => onSelect(tool)}
                            className="group flex items-center justify-between p-6 bg-zinc-50 border border-zinc-100 rounded-2xl hover:border-zinc-900 transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <Zap className="w-6 h-6 text-zinc-900" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-900">{tool.name}</h3>
                                    <div className="flex gap-2 mt-1">
                                        {tool.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="text-xs text-zinc-400 uppercase tracking-wider font-medium">#{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="text-zinc-500 font-medium hidden md:block max-w-md truncate">{tool.description}</p>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoveUpRight className="w-5 h-5 text-zinc-900" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}
