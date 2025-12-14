"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Instagram, Facebook, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-secondary/20 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-start space-x-4">
              <MapPin className="text-secondary mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="text-lg font-serif text-text mb-2">Location</h3>
                <p className="text-text/70 font-sans">
                  109 E Crystal Lake Ave Ste 109
                  <br />
                  Lake Mary, FL 32746-3251
                </p>
              </div>
            </div>
          </motion.div>

          {/* Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-start space-x-4">
              <Clock className="text-secondary mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="text-lg font-serif text-text mb-2">Hours</h3>
                <div className="text-text/70 font-sans space-y-1">
                  <p>Tue - Fri: 9:00 AM - 5:00 PM</p>
                  <p>Mon: Closed</p>
                  <p>Sat: Closed</p>
                  <p>Sun: Closed</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-lg font-serif text-text mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-secondary hover:text-secondary-light transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-secondary hover:text-secondary-light transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={24} />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-secondary hover:text-secondary-light transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={24} />
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        <div className="border-t border-secondary/20 pt-8 text-center">
          <p className="text-text/60 font-sans text-sm">
            © {new Date().getFullYear()} Dolce Hair. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

