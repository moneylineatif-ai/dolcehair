"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface Testimonial {
  quote: string;
  author: string;
  role?: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Dolce Hair transformed my look completely. The attention to detail and classic approach to styling is unmatched.",
    author: "Sarah Mitchell",
    role: "Regular Client",
  },
  {
    quote:
      "The most luxurious salon experience I've ever had. Every visit feels like a special occasion.",
    author: "Emily Chen",
    role: "VIP Member",
  },
  {
    quote:
      "Their color work is absolutely stunning. I've never received so many compliments on my hair.",
    author: "Jessica Williams",
    role: "Client",
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section
      id="testimonials"
      ref={ref}
      className="py-24 px-4 sm:px-6 lg:px-8 bg-background"
    >
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl font-serif text-center mb-16 text-text"
        >
          Testimonials
        </motion.h2>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <p className="text-xl sm:text-2xl text-text/90 font-serif italic mb-8 leading-relaxed">
                "{testimonials[currentIndex].quote}"
              </p>
              <div>
                <p className="text-lg text-secondary font-medium">
                  {testimonials[currentIndex].author}
                </p>
                {testimonials[currentIndex].role && (
                  <p className="text-sm text-text/60 mt-1">
                    {testimonials[currentIndex].role}
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-center items-center mt-12 space-x-4">
            <button
              onClick={prevTestimonial}
              className="p-2 border border-secondary/30 text-secondary hover:bg-secondary/10 transition-colors rounded-sm"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1 transition-all ${
                    index === currentIndex
                      ? "w-8 bg-secondary"
                      : "w-1 bg-secondary/30"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextTestimonial}
              className="p-2 border border-secondary/30 text-secondary hover:bg-secondary/10 transition-colors rounded-sm"
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

