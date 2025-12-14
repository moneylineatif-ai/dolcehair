"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface SplashCursorProps {
  isLoading: boolean;
  onComplete: () => void;
}

export default function SplashCursor({ isLoading, onComplete }: SplashCursorProps) {
  const [phase, setPhase] = useState<"enter" | "exit">("enter");

  // Scroll locking: Prevent body scroll while intro is visible
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) return;

    // Phase 1: Text enters (0s - 5s)
    // Hold for 2 seconds, then transition to Phase 2
    const phase2Timer = setTimeout(() => {
      setPhase("exit");
    }, 7000); // 5s animation + 2s hold

    return () => clearTimeout(phase2Timer);
  }, [isLoading]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{
            opacity: phase === "exit" ? 0 : 1,
            y: phase === "exit" ? "-100%" : 0,
          }}
          exit={{
            opacity: 0,
            y: "-100%",
          }}
          transition={{
            duration: 2.5,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="fixed inset-0 h-[100dvh] z-[9999] bg-[#0a0a0a] flex items-center justify-center overflow-hidden"
        >
          {/* Phase 1: Text enters with fade-in and subtle scale (0.9 to 1.0) */}
          {/* Phase 2: Text scales aggressively (to 2x) while fading out */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: phase === "exit" ? 0 : 1,
              scale: phase === "exit" ? 2 : 1,
            }}
            transition={{
              opacity: {
                duration: phase === "exit" ? 2.5 : 5,
                ease: phase === "exit" ? [0.4, 0, 0.2, 1] : [0.16, 1, 0.3, 1],
              },
              scale: {
                duration: phase === "exit" ? 2.5 : 5,
                ease: phase === "exit" ? [0.4, 0, 0.2, 1] : [0.16, 1, 0.3, 1],
              },
            }}
            className="text-center"
          >
            <h1 className="text-6xl md:text-9xl lg:text-[12rem] font-serif font-bold text-text tracking-tight whitespace-nowrap">
              DOLCE
            </h1>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

