"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Navbar from "@/components/Navbar";

const interiorImages = [
  "/images/interior-1.jpg",
  "/images/interior-2.jpg",
  "/images/interior-3.jpg",
];

export default function SpacePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Horizontal Scroll Gallery */}
      <section className="relative h-screen bg-[#0a0a0a] flex flex-col md:flex-row">
        {/* Title Section - Left Side */}
        <div className="flex-shrink-0 w-full md:w-1/3 lg:w-1/4 flex items-center justify-center md:justify-start px-8 md:px-12 lg:px-16 z-10 pt-20 md:pt-0">
          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-white"
          >
            The Space
          </motion.h1>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="flex-1 overflow-x-scroll scrollbar-hide snap-x snap-mandatory">
          <div className="flex gap-4 md:gap-6 lg:gap-8 px-4 md:px-6 lg:px-8 h-full items-center">
            {interiorImages.map((imageSrc, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative flex-shrink-0 w-[85vw] sm:w-[70vw] md:w-[60vw] lg:w-[50vw] h-[70vh] md:h-[85vh] snap-center"
              >
                <div className="relative w-full h-full rounded-sm overflow-hidden group">
                  <Image
                    src={imageSrc}
                    alt={`Salon interior ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 85vw, (max-width: 1024px) 60vw, 50vw"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
