"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Copy, Terminal, Scan, Loader2, Calendar, Search, Trash2, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"

interface Generation {
    id: string
    tool_id: 'deconstructor' | 'architect'
    input_data: any
    output_text: string
    created_at: string
}

export function VaultModal({ onClose }: { onClose: () => void }) {
    const [generations, setGenerations] = useState<Generation[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [search, setSearch] = useState("")

    useEffect(() => {
        fetch('/api/vault/list')
            .then(res => res.json())
            .then(data => {
                if (data.generations) setGenerations(data.generations)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (!confirm("Delete this memory?")) return

        // Optimistic update
        setGenerations(prev => prev.filter(g => g.id !== id))
        if (selectedId === id) setSelectedId(null)

        try {
            await fetch('/api/vault/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })
        } catch (err) {
            console.error("Delete failed", err)
            // Ideally revert state here on failure
        }
    }

    const filteredGenerations = generations.filter(gen =>
        gen.output_text.toLowerCase().includes(search.toLowerCase()) ||
        gen.tool_id.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="bg-zinc-50 flex flex-col h-full w-full relative overflow-hidden font-sans border-0 shadow-2xl rounded-[3rem]">
            {/* Header */}
            <div className="absolute top-0 inset-x-0 p-8 flex flex-col gap-6 z-50 bg-zinc-50/80 backdrop-blur-xl border-b border-zinc-200">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter text-zinc-900 leading-none">
                            THE VAULT
                        </h2>
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-2">
                            SECURE ARCHIVE // {generations.length} RECORDS
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full w-12 h-12 hover:bg-zinc-200"
                    >
                        <X className="w-6 h-6 text-zinc-900" />
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-400" />
                    <Input
                        placeholder="Search your memories..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-12 h-12 rounded-full border-zinc-200 bg-white text-lg font-medium focus-visible:ring-zinc-900"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-grow pt-48 pb-8 px-8 overflow-y-auto">
                {loading ? (
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
                    </div>
                ) : filteredGenerations.length === 0 ? (
                    <div className="flex flex-col h-full items-center justify-center text-zinc-300">
                        <Terminal className="w-16 h-16 mb-4 opacity-20" />
                        <p className="font-bold tracking-widest uppercase">
                            {search ? "No matches found" : "No Archives Yet"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredGenerations.map((gen, i) => (
                            <motion.div
                                key={gen.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                layoutId={gen.id}
                                onClick={() => setSelectedId(selectedId === gen.id ? null : gen.id)}
                                className={`bg-white rounded-3xl p-6 border transition-all cursor-pointer overflow-hidden flex flex-col gap-4 group ${selectedId === gen.id
                                    ? "border-zinc-900 shadow-xl ring-1 ring-zinc-900 col-span-1 md:col-span-2 row-span-2"
                                    : "border-zinc-100 hover:border-zinc-300 hover:shadow-lg"
                                    }`}
                            >
                                {/* Meta Header */}
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-full ${gen.tool_id === 'deconstructor' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {gen.tool_id === 'deconstructor' ? <Scan className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                            {gen.tool_id}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-300 text-[10px] font-bold uppercase">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(gen.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* Content Preview */}
                                <div className={`font-mono text-sm text-zinc-600 overflow-y-auto ${selectedId === gen.id ? "h-96" : "h-32 line-clamp-4"}`}>
                                    {gen.output_text}
                                </div>

                                {/* Actions (Only visible on hover or select) */}
                                <div className="mt-auto pt-4 border-t border-zinc-50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => handleDelete(e, gen.id)}
                                        className="h-8 rounded-full text-xs font-bold text-red-300 hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={async (e) => {
                                            e.stopPropagation()
                                            try {
                                                const res = await fetch('/api/vault/share', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ id: gen.id })
                                                })
                                                const data = await res.json()
                                                if (data.url) {
                                                    navigator.clipboard.writeText(data.url)
                                                    alert("Public Link Copied!") // Replace with toast later if possible
                                                }
                                            } catch (err) {
                                                console.error("Share failed", err)
                                            }
                                        }}
                                        className="h-8 rounded-full text-xs font-bold hover:bg-zinc-900 hover:text-white"
                                    >
                                        <ExternalLink className="w-3 h-3 mr-2" /> Share
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            navigator.clipboard.writeText(gen.output_text)
                                        }}
                                        className="h-8 rounded-full text-xs font-bold hover:bg-zinc-900 hover:text-white"
                                    >
                                        <Copy className="w-3 h-3 mr-2" /> Copy
                                    </Button>

                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
