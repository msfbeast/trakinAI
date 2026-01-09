"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Terminal, Sparkles, Sliders, X, ArrowRight } from "lucide-react"

export function Architect({ onClose }: { onClose: () => void }) {
    const [subject, setSubject] = useState("")
    const [vibe, setVibe] = useState("Cinematic")
    const [medium, setMedium] = useState("Photography")
    const [lighting, setLighting] = useState("Golden Hour")
    const [ratio, setRatio] = useState("16:9")
    const [result, setResult] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerate = async () => {
        if (!subject) return
        setIsGenerating(true)
        try {
            const res = await fetch('/api/architect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, vibe, medium, lighting, ratio }),
            })
            const data = await res.json()
            if (data.prompt) {
                setResult(data.prompt)
            } else if (data.error) {
                setResult(`Error: ${data.error}`)
            }
        } catch (e) {
            console.error(e)
            setResult("System Error: Failed to connect to Architect API.")
        } finally {
            setIsGenerating(false)
        }
    }

    const ParameterBtn = ({ label, value, current, setter }: any) => (
        <button
            onClick={() => setter(value)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all ${current === value
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-white text-zinc-400 border-zinc-200 hover:border-zinc-900 hover:text-zinc-900"
                }`}
        >
            {label}
        </button>
    )

    return (
        <div className="bg-white flex flex-col h-full w-full relative overflow-hidden font-sans border-0 shadow-2xl rounded-[3rem]">
            {/* Header */}
            <div className="absolute top-0 inset-x-0 p-8 flex justify-between items-start z-50 pointer-events-none">
                <div className="pointer-events-auto">
                    <h2 className="text-4xl font-black tracking-tighter text-zinc-900 leading-none">
                        THE ARCHITECT
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Gemini 1.5 Pro</span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="rounded-full w-12 h-12 hover:bg-zinc-100 pointer-events-auto"
                >
                    <X className="w-6 h-6 text-zinc-900" />
                </Button>
            </div>

            <div className="flex-grow flex flex-col lg:flex-row h-full pt-24 pb-8 px-8 gap-8">

                {/* Visualizer / Output */}
                <div className="flex-1 rounded-[2rem] bg-zinc-50 border border-zinc-100 p-8 flex flex-col justify-center relative overflow-hidden group">
                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                    <AnimatePresence mode="wait">
                        {result ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative z-10"
                            >
                                <div className="flex items-center gap-2 mb-4 text-zinc-400">
                                    <Terminal className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Architect Output</span>
                                </div>
                                <p className="text-xl md:text-2xl font-medium leading-relaxed text-zinc-900 font-mono">
                                    {result}
                                </p>
                                <div className="mt-8">
                                    <Button
                                        onClick={() => navigator.clipboard.writeText(result)}
                                        className="h-12 px-8 rounded-full bg-zinc-900 text-white font-bold hover:scale-105 transition-transform"
                                    >
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy Prompt
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="relative z-10 text-center opacity-30"
                            >
                                <Sparkles className="w-24 h-24 mx-auto mb-4 text-zinc-900" />
                                <h3 className="text-4xl font-black tracking-tighter text-zinc-900">AWAITING INPUT</h3>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="w-full lg:w-[400px] flex flex-col gap-5 overflow-hidden pr-2">

                    {/* Subject Input */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                            <ArrowRight className="w-3 h-3" /> Subject
                        </label>
                        <Input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g. A cyberpunk samurai..."
                            className="h-12 text-lg font-bold border-zinc-200 focus:border-zinc-900 rounded-xl bg-white"
                        />
                    </div>

                    {/* Vibe Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                            <Sliders className="w-3 h-3" /> Vibe
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {["Cinematic", "Ethereal", "Synthwave", "Minimalist", "Dark"].map((v) => (
                                <ParameterBtn key={v} label={v} value={v} current={vibe} setter={setVibe} />
                            ))}
                        </div>
                    </div>

                    {/* Medium Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                            <Sliders className="w-3 h-3" /> Medium
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {["Photography", "3D Render", "Oil Paint", "Vector", "Polaroid"].map((m) => (
                                <ParameterBtn key={m} label={m} value={m} current={medium} setter={setMedium} />
                            ))}
                        </div>
                    </div>

                    {/* Lighting Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                            <Sliders className="w-3 h-3" /> Lighting
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {["Golden Hour", "Studio", "Neon", "Dark", "Natural"].map((l) => (
                                <ParameterBtn key={l} label={l} value={l} current={lighting} setter={setLighting} />
                            ))}
                        </div>
                    </div>

                    {/* Ratio Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                            <Sliders className="w-3 h-3" /> Aspect Ratio
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {["16:9", "4:3", "1:1", "9:16", "21:9"].map((r) => (
                                <ParameterBtn key={r} label={r} value={r} current={ratio} setter={setRatio} />
                            ))}
                        </div>
                    </div>

                    {/* Action */}
                    <div className="mt-auto">
                        <Button
                            onClick={handleGenerate}
                            disabled={!subject || isGenerating}
                            className="w-full h-14 text-xl font-black uppercase tracking-tighter bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-lg hover:scale-[1.01] transition-transform"
                        >
                            {isGenerating ? "Architecting..." : "Generate Output"}
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    )
}
