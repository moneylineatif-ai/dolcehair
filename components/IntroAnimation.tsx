"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function IntroAnimation() {
  const [shouldRender, setShouldRender] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Check if intro has already been shown in this session
    const introShown = sessionStorage.getItem("dolce-intro-shown");
    
    if (introShown) {
      // Intro already shown, don't render it
      setShouldRender(false);
      return;
    }

    // Mark intro as shown immediately to prevent multiple renders
    sessionStorage.setItem("dolce-intro-shown", "true");

    // After text appears (1.5s) + delay (1s) = 2.5s, then start fade out
    const fadeOutTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2500);

    // After fade out completes (0.8s), unmount component
    const unmountTimer = setTimeout(() => {
      setShouldRender(false);
    }, 3300);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          transition={{
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="fixed inset-0 z-[100] bg-background flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: isExiting ? 0 : 1,
              scale: isExiting ? 1.05 : 1,
            }}
            transition={{
              opacity: {
                duration: isExiting ? 0.8 : 1.5,
                ease: [0.4, 0, 0.2, 1],
              },
              scale: {
                duration: isExiting ? 0.8 : 1.5,
                ease: [0.4, 0, 0.2, 1],
              },
            }}
            className="text-center"
          >
            <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-[12rem] font-serif font-bold text-text tracking-tight">
              DOLCE
            </h1>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

