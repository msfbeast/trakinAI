"use client"

import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { User } from "@supabase/supabase-js"

interface HeaderProps {
    user: User | null
    profile: any
    onOpenArchitect: () => void
    onOpenDeconstructor: () => void
    onOpenVault: () => void
    onOpenAuth: () => void
    showFilters: boolean
    setShowFilters: (show: boolean) => void
    setSearch: (term: string) => void
    categories: string[]
}

export function Header({
    user,
    profile,
    onOpenArchitect,
    onOpenDeconstructor,
    onOpenVault,
    onOpenAuth,
    showFilters,
    setShowFilters,
    setSearch,
    categories
}: HeaderProps) {
    return (
        <>
            <nav className="fixed z-50 top-0 inset-x-0 h-20 border-b border-zinc-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-12">
                <div className="text-xl font-black tracking-tighter" role="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    TRAKIN.AI
                </div>

                <div className="hidden md:flex items-center p-1 bg-zinc-100/80 backdrop-blur-md rounded-full border border-zinc-200/50">
                    <a href="#featured" className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 hover:bg-white hover:shadow-sm transition-all">Featured</a>
                    <a href="#runway" className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 hover:bg-white hover:shadow-sm transition-all">Runway</a>
                    <a href="#collection" className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 hover:bg-white hover:shadow-sm transition-all">Collection</a>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        onClick={onOpenArchitect}
                        variant="ghost"
                        className="hidden sm:flex text-xs font-bold uppercase tracking-widest hover:bg-transparent hover:text-blue-600 transition-colors gap-2"
                    >
                        [ Architect ]
                    </Button>
                    <Button
                        onClick={onOpenDeconstructor}
                        variant="ghost"
                        className="hidden sm:flex text-xs font-bold uppercase tracking-widest hover:bg-transparent hover:text-green-600 transition-colors gap-2"
                    >
                        [ Deconstructor ]
                    </Button>

                    {/* Auth / Energy Status */}
                    {user ? (
                        <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-zinc-200">
                            <Button
                                onClick={onOpenVault}
                                variant="ghost"
                                className="h-8 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full"
                            >
                                View Vault
                            </Button>

                            <div className="flex flex-col items-end leading-none">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Energy</span>
                                <span className={`text-xs font-black font-mono ${profile?.energy_credits === 0 ? 'text-red-500' : 'text-zinc-900'}`}>
                                    {profile?.energy_credits ?? '-'}/{profile?.max_energy ?? '-'}
                                </span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
                                {user.email?.[0].toUpperCase()}
                            </div>
                        </div>
                    ) : (
                        <Button
                            onClick={onOpenAuth}
                            className="hidden sm:flex h-8 rounded-full bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest px-4 hover:bg-zinc-800"
                        >
                            Connect
                        </Button>
                    )}

                    <Button
                        size="icon"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`rounded-full transition-colors ${showFilters ? 'bg-zinc-200 text-zinc-900' : 'bg-zinc-900 text-white hover:bg-zinc-700'}`}
                    >
                        {showFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
                    </Button>
                </div>
            </nav>

            {/* Filter Overlay */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-20 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-100 py-8 px-6 lg:px-12 shadow-lg"
                    >
                        <div className="max-w-[1600px] mx-auto">
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Filter by Category</p>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            setSearch(cat);
                                            setShowFilters(false);
                                            document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="px-4 py-2 rounded-full border border-zinc-200 bg-zinc-50 text-xs font-bold uppercase tracking-widest hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all"
                                    >
                                        {cat}
                                    </button>
                                ))}
                                <button
                                    onClick={() => { setSearch(""); setShowFilters(false); }}
                                    className="px-4 py-2 rounded-full border border-red-100 bg-red-50 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all ml-auto"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
