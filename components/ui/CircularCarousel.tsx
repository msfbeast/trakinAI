"use client"

import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { Tool } from "@/lib/data"
import { FlashlightCard } from "@/components/ui/FlashlightCard"
import { Zap, MoveUpRight } from "lucide-react"

interface CircularCarouselProps {
    items: Tool[]
    onSelect: (tool: Tool) => void
}

const CARD_GAP = 20

export function CircularCarousel({ items, onSelect }: CircularCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [cardWidth, setCardWidth] = useState(300)
    const [cardHeight, setCardHeight] = useState(450)
    const [windowWidth, setWindowWidth] = useState(1000) // Default to match SSR
    const containerRef = useRef<HTMLDivElement>(null)
    const x = useMotionValue(0)

    // Calculate constraints
    const maxIndex = items.length - 1

    // Initialize responsive values
    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth
            setWindowWidth(w)

            const isMobile = w < 768
            setCardWidth(isMobile ? w * 0.75 : 300)
            setCardHeight(isMobile ? 400 : 450)
        }

        handleResize() // Set initial
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Handle Drag End to snap to nearest card
    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const velocity = info.velocity.x
        const offset = info.offset.x

        let newIndex = currentIndex

        // Threshold for swipe
        if (Math.abs(velocity) > 400 || Math.abs(offset) > cardWidth / 3) {
            if (velocity < 0 || offset < 0) {
                newIndex = Math.min(currentIndex + 1, maxIndex)
            } else {
                newIndex = Math.max(currentIndex - 1, 0)
            }
        }

        setCurrentIndex(newIndex)
    }

    // Animate to the specific index when it changes
    useEffect(() => {
        // Recalculate based on current cardWidth
        const targetX = (windowWidth / 2 - cardWidth / 2) - currentIndex * (cardWidth + CARD_GAP)

        animate(x, targetX, {
            type: "spring",
            stiffness: 260, // Slightly softer spring for premium feel
            damping: 30, // Higher damping for less wobble
            mass: 0.8
        })
    }, [currentIndex, x, maxIndex, cardWidth, windowWidth])

    return (
        <div className="relative w-full h-[550px] md:h-[600px] overflow-hidden flex items-center bg-zinc-50 border-y border-zinc-100" ref={containerRef}>

            {/* Background Radial Gradient to giving a "Spotlight" feel to the center */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,white_0%,transparent_70%)] pointer-events-none" />

            <div
                className="absolute inset-x-0 h-full flex items-center"
                style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
            >
                <motion.div
                    style={{ x }}
                    drag="x"
                    dragConstraints={{
                        left: (typeof window !== 'undefined' ? windowWidth / 2 - cardWidth / 2 : 0) - ((items.length - 1) * (cardWidth + CARD_GAP)),
                        right: (typeof window !== 'undefined' ? windowWidth / 2 - cardWidth / 2 : 0)
                    }}
                    onDragEnd={handleDragEnd}
                    className="flex gap-5 px-4 items-center cursor-grab active:cursor-grabbing"
                >
                    {items.map((tool, i) => (
                        <Card
                            key={tool.id}
                            tool={tool}
                            index={i}
                            onSelect={onSelect}
                            x={x}
                            cardWidth={cardWidth}
                            cardHeight={cardHeight}
                            windowWidth={windowWidth}
                        />
                    ))}
                </motion.div>
            </div>

            {/* Pagination Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {items.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`transition-all duration-300 ${i === currentIndex
                            ? 'bg-zinc-900 w-8 h-2 rounded-full'
                            : 'bg-zinc-300 w-2 h-2 rounded-full hover:bg-zinc-400'
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}

function Card({ tool, index, onSelect, x, cardWidth, cardHeight, windowWidth }: { tool: Tool, index: number, onSelect: (tool: Tool) => void, x: any, cardWidth: number, cardHeight: number, windowWidth: number }) {
    // 3D Coverflow Logic
    // We transform based on the card's position relative to the center of the screen
    // screenCenter = window.innerWidth / 2
    // cardCenter = x.get() + index * (W+G) + W/2
    // distance = cardCenter - screenCenter

    // BUT we need to do this reactively with useTransform.
    // x is the variable.
    // cardWorldX = x + index * (CARD_WIDTH + CARD_GAP)
    // distanceFromCenter = cardWorldX + CARD_WIDTH/2 - window.innerWidth/2

    // We map `x` values where this card is centered vs neighbors
    // Center X value for this card: X_c = (window.innerWidth/2 - CARD_WIDTH/2) - index * (W+G)
    // Left neighbor X value: X_l = X_c + (W+G)
    // Right neighbor X value: X_r = X_c - (W+G)

    const w = windowWidth // Use consistent width directly
    const centerVals = (w / 2 - cardWidth / 2) - index * (cardWidth + CARD_GAP)

    // Range of X where this card is visible/interacting
    const range = [centerVals + (cardWidth + CARD_GAP) * 2, centerVals, centerVals - (cardWidth + CARD_GAP) * 2]

    const scale = useTransform(x, range, [0.85, 1, 0.85])
    const rotateY = useTransform(x, range, [-45, 0, 45])
    const opacity = useTransform(x, range, [0.3, 1, 0.3])
    const zIndex = useTransform(x, range, [0, 10, 0])

    // Glassmorphism shine
    const shineOpacity = useTransform(x, [centerVals + 50, centerVals, centerVals - 50], [0, 0.8, 0])

    return (
        <motion.div
            style={{
                scale,
                rotateY,
                opacity,
                zIndex, // Ensure stacking is correct (center on top)
                width: cardWidth,
                height: cardHeight,
            }}
            // transition={{ type: "spring", stiffness: 300, damping: 30 }} // Removed as useTransform handles continuous animation
            onClick={() => onSelect(tool)}
            className="flex-shrink-0 rounded-[2rem] bg-white border border-zinc-200 shadow-2xl overflow-hidden relative group transform-gpu"
        >
            {/* Dynamic Shine Effect */}
            <motion.div
                style={{ opacity: shineOpacity }}
                className="absolute inset-0 bg-gradient-to-tr from-white/80 via-transparent to-transparent z-50 pointer-events-none"
            />

            <FlashlightCard className="w-full h-full p-8 flex flex-col justify-between bg-white relative">
                <div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-zinc-50 rounded-2xl group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoveUpRight className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black tracking-tight text-zinc-900 mb-2">{tool.name}</h3>
                    <p className="text-zinc-500 font-medium leading-relaxed line-clamp-4">{tool.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {tool.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-3 py-1 bg-zinc-50 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                            {tag}
                        </span>
                    ))}
                </div>
            </FlashlightCard>
        </motion.div>
    )
}
