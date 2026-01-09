"use client";

import { useMotionValue, motion, useMotionTemplate } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";

export const FlashlightCard = ({
    children,
    className,
    spotlightColor = "rgba(14, 165, 233, 0.15)", // Default cyan hint
}: {
    children: React.ReactNode;
    className?: string;
    spotlightColor?: string;
}) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({
        currentTarget,
        clientX,
        clientY,
    }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();

        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            className={cn(
                "group relative border border-zinc-200 bg-white overflow-hidden rounded-xl",
                className
            )}
            onMouseMove={handleMouseMove}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              ${spotlightColor},
              transparent 80%
            )
          `,
                }}
            />

            {/* Border Highlight */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100 z-10"
                style={{
                    background: useMotionTemplate`
             radial-gradient(
               600px circle at ${mouseX}px ${mouseY}px,
               rgba(0,0,0,0.1),
               transparent 40%
             )
           `,
                }}
            />

            <div className="relative h-full">{children}</div>
        </div>
    );
};
