"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";
import SplashCursor from "@/components/SplashCursor";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Check if splash has already been shown in this session
    const splashShown = sessionStorage.getItem("dolce-splash-shown");
    
    if (splashShown) {
      // Splash already shown, skip it
      setIsLoading(false);
      setShowContent(true);
      return;
    }

    // Mark splash as shown immediately
    sessionStorage.setItem("dolce-splash-shown", "true");

    // After Phase 1 (5s) + Hold (2s) + Phase 2 (2.5s) = 9.5s total, start showing content
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Small delay before showing content to ensure smooth transition
      setTimeout(() => {
        setShowContent(true);
      }, 100);
    }, 9500);

    return () => clearTimeout(timer);
  }, []);

  // Additional scroll lock safeguard
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

  const handleSplashComplete = () => {
    setShowContent(true);
  };

  return (
    <main className="min-h-screen">
      <SplashCursor isLoading={isLoading} onComplete={handleSplashComplete} />
      
      {showContent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <Navbar />
          <Hero />
          <Services />
          <Gallery />
          <Testimonials />
          <Footer />
          <FloatingCTA />
        </motion.div>
      )}
    </main>
  );
}

