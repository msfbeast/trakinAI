"use client"

import * as React from "react"
import { Moon, Sun, Zap } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <Button variant="outline" size="icon" className="w-10 h-10 border-2 border-black rounded-none opacity-0" />
    }

    return (
        <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_white] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all bg-[var(--pop-yellow)] dark:bg-black dark:text-white"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            {theme === "dark" ? (
                <Zap className="h-6 w-6 text-[var(--pop-cyan)] fill-current" />
            ) : (
                <Zap className="h-6 w-6 text-black" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
