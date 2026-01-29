"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface FooterProps {
    isSyncing: boolean
    onSync: () => void
}

export function Footer({ isSyncing, onSync }: FooterProps) {
    return (
        <footer className="bg-zinc-900 text-zinc-400 py-24 px-6 lg:px-12">
            <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-white mb-8">TRAKIN.AI</h2>
                    <p className="max-w-md leading-relaxed font-medium mb-8">
                        An experimental interface for the AI ecosystem.
                        Curated by Gemini 2.0 Flash. Built for rapid intelligence gathering.
                    </p>

                    <div className="flex gap-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest">All Systems Normal</span>
                    </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-4">
                    <Button
                        onClick={onSync}
                        variant="outline"
                        disabled={isSyncing}
                        className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Accessing Protocol...' : 'Sync Curator Protocol'}
                    </Button>
                    <p className="text-xs font-mono text-zinc-600">
                        ADMIN ACCESS REQUIRED FOR SYNC
                    </p>
                </div>
            </div>
        </footer>
    )
}
