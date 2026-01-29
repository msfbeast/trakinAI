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
                const dataUrl = await toPng(node, {
                    quality: 0.95,
                    pixelRatio: 2,
                    backgroundColor: '#ffffff',
                    style: { opacity: '1', visibility: 'visible' }
                })
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

                // AUTO-SAVE TO VAULT
                fetch('/api/vault/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tool_id: 'deconstructor',
                        input_data: { image_preview: imageData.slice(0, 100) + '...' }, // Don't save full base64 to DB to save space, or maybe save to Storage in Phase 3
                        output_text: data.prompt
                    })
                }).catch(err => console.error("Auto-save failed", err));

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

            <div className="flex-grow relative z-10 p-8 flex flex-col items-center justify-center h-full overflow-hidden">
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
                            className="flex flex-col items-center justify-center h-full w-full"
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
                            className="flex flex-col lg:flex-row w-full h-full pt-24 pb-8 px-8 gap-8 overflow-hidden relative z-20 pointer-events-auto"
                        >
                            {/* Left Col: Image */}
                            <div className="w-full lg:w-1/2 h-1/3 lg:h-full rounded-[2rem] overflow-hidden relative shadow-2xl flex-shrink-0">
                                {image && <img src={image} className="w-full h-full object-cover" />}
                                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                                    Source Image
                                </div>
                            </div>

                            {/* Right Col: Text & Actions - strict flex column */}
                            <div className="w-full lg:w-1/2 flex flex-col h-2/3 lg:h-full min-h-0">
                                {/* Scrollable Text Area */}
                                <div className="flex-1 bg-zinc-50 rounded-[2rem] p-8 overflow-y-auto min-h-0 mb-6 border border-zinc-100 shadow-inner relative z-30 pointer-events-auto">
                                    <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 sticky top-0 bg-zinc-50 py-2">
                                        Deconstructed Prompt
                                    </div>
                                    <p className="text-lg md:text-xl font-medium text-zinc-900 leading-relaxed whitespace-pre-wrap">
                                        {resultPrompt}
                                    </p>
                                </div>

                                {/* Fixed Height Actions */}
                                <div className="flex gap-4 flex-shrink-0 h-16 relative z-30 pointer-events-auto">
                                    <Button
                                        onClick={() => navigator.clipboard.writeText(resultPrompt)}
                                        className="flex-1 h-full rounded-full bg-zinc-900 text-white text-lg font-bold hover:bg-zinc-800"
                                    >
                                        Copy Prompt
                                    </Button>
                                    <Button
                                        onClick={handleExport}
                                        disabled={isExporting}
                                        variant="outline"
                                        className="h-full w-16 rounded-full border-2 border-zinc-200"
                                    >
                                        <Download className="w-6 h-6" />
                                    </Button>
                                    <Button
                                        onClick={() => { setState("idle"); setImage(null) }}
                                        variant="outline"
                                        className="h-full w-16 rounded-full border-2 border-zinc-200"
                                    >
                                        <Upload className="w-6 h-6" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Hidden Export Template - Uses style override to capture at full opacity */}
            <div id="export-dossier" className="fixed top-0 left-0 w-[1200px] h-[800px] bg-white pointer-events-none z-[-50] opacity-0 font-sans text-zinc-900">
                <div className="w-full h-full flex">
                    {/* Left Col: Full Color Image */}
                    <div className="w-[60%] h-full relative">
                        {image && <img src={image} className="w-full h-full object-cover" />}
                        {/* Overlay Gradient for text readability if needed, but here we separate text */}
                    </div>

                    {/* Right Col: Typography & Details */}
                    <div className="w-[40%] h-full flex flex-col justify-between p-16 bg-white border-l border-zinc-100">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500" />
                                <span className="text-sm font-bold tracking-widest uppercase text-zinc-400">Trakin.AI Deconstructor</span>
                            </div>
                            <h1 className="text-7xl font-black tracking-tighter leading-none mb-8 text-black">
                                VISUAL<br />STUDY
                            </h1>
                            <div className="h-1 w-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mb-8" />

                            <p className="text-sm font-bold font-mono text-zinc-400 mb-2">GEN_ID</p>
                            <p className="text-4xl font-mono text-zinc-900 mb-8">{Date.now().toString().slice(-6)}</p>
                        </div>

                        <div className="flex-grow overflow-hidden relative">
                            {/* Fading text container */}
                            <p className="text-2xl font-medium leading-relaxed text-zinc-600 pb-12">
                                {resultPrompt.slice(0, 500)}
                                {resultPrompt.length > 500 && "..."}
                            </p>
                            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent" />
                        </div>

                        <div className="pt-8 border-t border-zinc-200 flex justify-between items-end">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Model</p>
                                <p className="text-lg font-bold">Gemini 2.5 Flash</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Date</p>
                                <p className="text-lg font-bold">{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
