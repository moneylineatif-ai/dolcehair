"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";

const GENERAL_BOOKING_URL = "https://app.squareup.com/appointments/book/9un7b18xp2io78/LT9KFJ1T4MS25/start";

const services = [
  { id: 1, name: "Traditional Sew In", price: "$250", bookingUrl: "https://app.squareup.com/appointments/book/9un7b18xp2io78/LT9KFJ1T4MS25/start" },
  { id: 2, name: "Versatile Sew In", price: "$275", bookingUrl: "https://app.squareup.com/appointments/book/9un7b18xp2io78/LT9KFJ1T4MS25/start" },
  { id: 3, name: "Braidless Sew In", price: "$300", bookingUrl: "https://app.squareup.com/appointments/book/9un7b18xp2io78/LT9KFJ1T4MS25/start" },
  { id: 4, name: "Quick Weave", price: "$175", bookingUrl: "https://app.squareup.com/appointments/book/9un7b18xp2io78/LT9KFJ1T4MS25/start" },
  { id: 5, name: "Wefted Microlinks", price: "$350", bookingUrl: "https://app.squareup.com/appointments/book/9un7b18xp2io78/LT9KFJ1T4MS25/start" },
  { id: 6, name: "Tape Ins", price: "$350", bookingUrl: "https://app.squareup.com/appointments/book/9un7b18xp2io78/LT9KFJ1T4MS25/start" },
  { id: 7, name: "I-Tips", price: "$800", bookingUrl: "https://app.squareup.com/appointments/book/9un7b18xp2io78/LT9KFJ1T4MS25/start" },
  { id: 8, name: "K-Tips", price: "$1,200", bookingUrl: "https://app.squareup.com/appointments/book/9un7b18xp2io78/LT9KFJ1T4MS25/start" },
  { id: 9, name: "Coloring Bundles", price: "$50 per bundle", bookingUrl: "https://app.squareup.com/appointments/book/9un7b18xp2io78/LT9KFJ1T4MS25/start" },
  { id: 10, name: "Virtual Consultation", price: "$25", bookingUrl: "https://app.squareup.com/appointments/book/9un7b18xp2io78/LT9KFJ1T4MS25/start" },
];

export default function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);

  const handleServiceClick = (service: typeof services[0]) => {
    setSelectedService(service.id === selectedService?.id ? null : service);
  };

  const handleBookingClick = () => {
    // Always open the general booking URL regardless of selection
    window.open(GENERAL_BOOKING_URL, "_blank");
  };

  return (
    <section
      id="services"
      ref={ref}
      className="py-24 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-serif text-center mb-16 text-white"
        >
          Services
        </motion.h2>

        {/* Services List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-4 mb-12"
        >
          {/* Mobile: Single Column */}
          <div className="block md:hidden space-y-4">
            {services.map((service, index) => {
              const isSelected = selectedService?.id === service.id;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
                  onClick={() => handleServiceClick(service)}
                  className={`flex items-center justify-between py-3 border-b border-white/20 cursor-pointer transition-all ${
                    isSelected
                      ? "border-l-4 border-white bg-white/5 shadow-[0_0_15px_rgba(114,47,55,0.3)] pl-3"
                      : "hover:border-white/30 hover:bg-white/5 pl-0"
                  }`}
                >
                  <span className="text-base sm:text-lg font-sans text-white/90 pr-3 flex-1">
                    {service.name}
                  </span>
                  <span className={`flex-1 border-t mx-2 min-w-[20px] ${
                    isSelected ? "border-primary/40" : "border-white/20"
                  }`}></span>
                  <span className="text-xl sm:text-2xl font-serif text-white text-right whitespace-nowrap flex-shrink-0">
                    {service.price}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Desktop: 2-Column Grid */}
          <div className="hidden md:grid md:grid-cols-2 md:gap-x-12 md:gap-y-4">
            {services.map((service, index) => {
              const isSelected = selectedService?.id === service.id;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
                  onClick={() => handleServiceClick(service)}
                  className={`flex items-center justify-between py-3 border-b cursor-pointer transition-all ${
                    isSelected
                      ? "border-l-4 border-white bg-white/5 border-primary/60 shadow-[0_0_15px_rgba(114,47,55,0.3)] pl-3"
                      : "border-white/20 group hover:border-white/30 hover:bg-white/5 pl-0"
                  }`}
                >
                  <span className="text-lg font-sans text-white/90 pr-3 flex-1 min-w-0">
                    {service.name}
                  </span>
                  <span className={`flex-1 border-t mx-3 min-w-[30px] ${
                    isSelected ? "border-primary/40" : "border-white/20"
                  }`}></span>
                  <span className="text-xl font-serif text-white text-right whitespace-nowrap flex-shrink-0">
                    {service.price}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Policy Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 mb-8 p-6 rounded-sm border border-primary/40 bg-primary/5"
        >
          <p className="text-sm sm:text-base font-sans text-primary/90 text-center italic">
            Please note: We no longer provide maintenance, take-downs, or relaxer services.
          </p>
        </motion.div>

        {/* Book Appointment Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex justify-center"
        >
          <motion.button
            onClick={handleBookingClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-primary text-white rounded-sm font-medium text-lg hover:bg-primary-light transition-colors font-sans cursor-pointer"
          >
            Book Appointment Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
