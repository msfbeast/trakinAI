"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Scan, Download, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toPng } from 'html-to-image'
import { saveAs } from 'file-saver'
import { BorderBeam } from "@/components/ui/BorderBeam"

export function Deconstructor({ onClose }: { onClose: () => void }) {
    const [state, setState] = useState<"idle" | "scanning" | "complete">("idle")
    const [image, setImage] = useState<string | null>(null)
    const [resultPrompt, setResultPrompt] = useState<string>("")
    const [isExporting, setIsExporting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const node = document.getElementById('export-dossier')
            if (node) {
                const dataUrl = await toPng(node, { quality: 0.95, pixelRatio: 2 })
                saveAs(dataUrl, `TRAKIN_EVIDENCE_${Date.now()}.png`)
            }
        } catch (err) {
            console.error('Export failed', err)
        } finally {
            setIsExporting(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const imageData = e.target?.result as string
                setImage(imageData)
                startScan(imageData)
            }
            reader.readAsDataURL(file)
        }
    }

    const startScan = async (imageData: string) => {
        setState("scanning")

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageData }),
            });

            const data = await response.json();
            if (data.prompt) {
                setResultPrompt(data.prompt);
                setState("complete");
            } else {
                setResultPrompt("// ANALYSIS ERROR");
                setState("complete");
            }
        } catch (error) {
            setResultPrompt("// CONNECTION ERROR");
            setState("complete");
        }
    }

    const triggerFileInput = () => fileInputRef.current?.click()

    return (
        <div className="bg-white flex flex-col h-full w-full relative overflow-hidden font-sans border-0 shadow-2xl rounded-[3rem]">
            {/* Minimal Header */}
            <div className="absolute top-0 inset-x-0 p-8 flex justify-between items-start z-50">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-zinc-900 leading-none">
                        DECONSTRUCTOR
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Gemini 2.0 Flash</span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="rounded-full w-12 h-12 hover:bg-zinc-100"
                >
                    <X className="w-6 h-6 text-zinc-900" />
                </Button>
            </div>

            <div className="flex-grow relative z-10 p-8 flex flex-col items-center justify-center">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                <AnimatePresence mode="wait">
                    {state === "idle" && (
                        <motion.button
                            key="idle"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={triggerFileInput}
                            className="group relative w-full h-[60vh] rounded-[2rem] border-2 border-dashed border-zinc-200 hover:border-zinc-900 transition-colors flex flex-col items-center justify-center gap-6 overflow-hidden bg-zinc-50/50"
                        >
                            {/* Grid Background within button */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                            <div className="relative w-24 h-24 rounded-full bg-zinc-900 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl z-10">
                                <Scan className="w-10 h-10" />
                                <BorderBeam size={120} duration={4} delay={0} />
                            </div>
                            <div className="text-center z-10">
                                <p className="text-2xl font-bold tracking-tight text-zinc-900">Upload Visual Source</p>
                                <p className="text-zinc-400 font-medium mt-1">Drag file or click to browse</p>
                            </div>
                        </motion.button>
                    )}

                    {state === "scanning" && (
                        <motion.div
                            key="scanning"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center"
                        >
                            <div className="relative w-48 h-48 mb-8">
                                {image && <img src={image} className="w-full h-full object-cover rounded-full opacity-50 grayscale" />}
                                <div className="absolute inset-0 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                            </div>
                            <h3 className="text-4xl font-black tracking-tighter text-zinc-900 animate-pulse">ANALYZING</h3>
                        </motion.div>
                    )}

                    {state === "complete" && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col lg:flex-row w-full h-full gap-8 pt-20 pb-4"
                        >
                            <div className="w-full lg:w-1/2 h-[50vh] lg:h-full rounded-[2rem] overflow-hidden relative shadow-2xl">
                                {image && <img src={image} className="w-full h-full object-cover" />}
                                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                                    Source Image
                                </div>
                            </div>

                            <div className="w-full lg:w-1/2 flex flex-col h-full">
                                <div className="flex-grow bg-zinc-50 rounded-[2rem] p-8 overflow-y-auto min-h-0 mb-6 border border-zinc-100 shadow-inner">
                                    <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 sticky top-0 bg-zinc-50 py-2">
                                        Deconstructed Prompt
                                    </div>
                                    <p className="text-lg md:text-xl font-medium text-zinc-900 leading-relaxed whitespace-pre-wrap">
                                        {resultPrompt}
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        onClick={() => navigator.clipboard.writeText(resultPrompt)}
                                        className="flex-1 h-16 rounded-full bg-zinc-900 text-white text-lg font-bold hover:bg-zinc-800"
                                    >
                                        Copy Prompt
                                    </Button>
                                    <Button
                                        onClick={handleExport}
                                        disabled={isExporting}
                                        variant="outline"
                                        className="h-16 w-16 rounded-full border-2 border-zinc-200"
                                    >
                                        <Download className="w-6 h-6" />
                                    </Button>
                                    <Button
                                        onClick={() => { setState("idle"); setImage(null) }}
                                        variant="outline"
                                        className="h-16 w-16 rounded-full border-2 border-zinc-200"
                                    >
                                        <Upload className="w-6 h-6" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Hidden Export Template */}
            <div id="export-dossier" className="fixed top-0 left-0 w-[1200px] h-[800px] bg-white p-12 opacity-0 pointer-events-none z-[-1]">
                <div className="w-full h-full flex gap-12 border-[20px] border-zinc-950 p-12">
                    <div className="w-1/2 h-full bg-zinc-100 relative">
                        {image && <img src={image} className="w-full h-full object-cover grayscale contrast-125 mix-blend-multiply" />}
                    </div>
                    <div className="w-1/2 h-full flex flex-col justify-between">
                        <div>
                            <h1 className="text-8xl font-black tracking-tighter leading-[0.8] mb-8">VISUAL<br />STUDY</h1>
                            <p className="text-2xl font-bold font-mono uppercase text-zinc-400">GEN_ID: {Date.now().toString().slice(-4)}</p>
                        </div>
                        <p className="text-3xl font-medium leading-tight">
                            {resultPrompt.slice(0, 400)}...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
