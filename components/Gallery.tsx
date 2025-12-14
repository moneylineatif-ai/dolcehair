"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";

const galleryImages = [
  { src: "/images/IMG_9185.jpg", type: "human", alt: "Gallery image" },
  { src: "/images/IMG_9186.jpg", type: "human", alt: "Gallery image" },
  { src: "/images/IMG_9188.jpg", type: "human", alt: "Gallery image" },
  { src: "/images/IMG_9189.jpg", type: "human", alt: "Gallery image" },
  { src: "/images/IMG_9190.jpg", type: "human", alt: "Gallery image" },
  { src: "/images/IMG_9191.jpg", type: "human", alt: "Gallery image" },
  { src: "/images/IMG_9193.jpg", type: "detail", alt: "Gallery image" },
  { src: "/images/IMG_9194.jpg", type: "detail", alt: "Gallery image" },
  { src: "/images/IMG_9195.jpg", type: "human", alt: "Gallery image" },
  { src: "/images/IMG_9196.jpg", type: "detail", alt: "Gallery image" },
  { src: "/images/IMG_9197.jpg", type: "human", alt: "Gallery image" },
  { src: "/images/IMG_9198.jpg", type: "detail", alt: "Gallery image" },
];

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Gallery() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [shuffledImages, setShuffledImages] = useState(galleryImages);

  // Smart shuffle: humans first, then details (both groups randomized)
  useEffect(() => {
    // Separate images by type
    const humans = galleryImages.filter((img) => img.type === "human");
    const details = galleryImages.filter((img) => img.type === "detail");

    // Shuffle each group separately
    const shuffledHumans = shuffleArray(humans);
    const shuffledDetails = shuffleArray(details);

    // Combine: humans first, then details
    const sortedImages = [...shuffledHumans, ...shuffledDetails];

    setShuffledImages(sortedImages);
  }, []);

  return (
    <section
      id="gallery"
      ref={ref}
      className="py-24 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-serif text-center mb-16 text-white"
        >
          The Lookbook
        </motion.h2>

        {/* Masonry/Mosaic Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="columns-1 md:columns-3 gap-0.5 md:gap-0.5"
        >
          {shuffledImages.map((image, index) => (
            <motion.div
              key={image.src}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="mb-0.5 break-inside-avoid group cursor-pointer"
            >
              <div className="relative w-full overflow-hidden">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={800}
                  height={1200}
                  className="w-full h-auto object-cover group-hover:scale-105 group-hover:opacity-90 transition-all duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
