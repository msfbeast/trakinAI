"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { X, Github, Mail, Zap } from "lucide-react"

export function AuthModal({ onClose }: { onClose: () => void }) {
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleLogin = async (provider: 'google' | 'github') => {
        setLoading(true)
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            if (error) throw error
        } catch (error) {
            console.error('Login error:', error)
            setLoading(false)
        }
    }

    return (
        <div className="bg-white flex flex-col items-center justify-center p-12 text-center rounded-[3rem] relative overflow-hidden font-sans border-0 shadow-2xl max-w-lg mx-auto w-full">
            <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-6 right-6 rounded-full w-10 h-10 hover:bg-zinc-100"
            >
                <X className="w-5 h-5 text-zinc-900" />
            </Button>

            <div className="mb-8 p-4 bg-zinc-900 rounded-full text-white inline-flex">
                <Zap className="w-8 h-8 fill-yellow-400 text-yellow-400" />
            </div>

            <h2 className="text-4xl font-black tracking-tighter text-zinc-900 mb-2">
                AUTHENTICATE
            </h2>
            <p className="text-zinc-500 font-medium mb-10 tracking-tight">
                Join the Intelligence Network to unlock Daily Energy and exclusive Alpha tools.
            </p>

            <div className="flex flex-col gap-4 w-full">
                <Button
                    onClick={() => handleLogin('google')}
                    disabled={loading}
                    className="h-14 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold border border-zinc-200 shadow-sm text-lg flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                    <span>Continue with Google</span>
                </Button>

                <Button
                    onClick={() => handleLogin('github')}
                    disabled={loading}
                    className="h-14 rounded-full bg-black hover:bg-zinc-800 text-white font-bold shadow-lg text-lg flex items-center justify-center gap-3"
                >
                    <Github className="w-6 h-6 fill-white" />
                    <span>Continue with GitHub</span>
                </Button>
            </div>

            <p className="mt-8 text-xs text-zinc-400 font-medium uppercase tracking-widest">
                System Access: Guest
            </p>
        </div>
    )
}
