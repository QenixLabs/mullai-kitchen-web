"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer } from "../../landing/animations";
import { ArrowRight, Phone, Mail } from "lucide-react";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-16 lg:py-20 overflow-hidden bg-[#0d0205]">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-skin/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="relative bg-gradient-to-br from-primary to-[#5a0f1a] rounded-3xl p-8 sm:p-12 lg:p-16 overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-skin/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-[60px]" />

          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <motion.h2
                variants={fadeInUp}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight"
              >
                Ready to Transform Your{" "}
                <span className="text-skin">
                  Corporate Dining?
                </span>
              </motion.h2>

              <motion.p variants={fadeInUp} className="text-base text-white/70 max-w-lg">
                Join hundreds of companies already enjoying our premium corporate meal services.
                Get in touch for a customized quote.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <Link href="/auth/corporate-signup">
                  <Button className="h-12 px-6 bg-skin hover:bg-skin/90 text-primary font-semibold rounded-full shadow-lg shadow-skin/30">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    className="h-12 px-6 border-white/30 text-white hover:bg-white/10 font-semibold rounded-full"
                  >
                    Contact Us
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right Content - Contact Info */}
            <motion.div
              variants={fadeInUp}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
            >
              <h3 className="text-lg font-bold text-white mb-4">Contact Our Team</h3>
              <div className="space-y-4">
                <a
                  href="tel:+919876543210"
                  className="flex items-center gap-3 text-white/80 hover:text-skin transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Phone</p>
                    <p className="text-sm font-medium">+91 98765 43210</p>
                  </div>
                </a>
                <a
                  href="mailto:corporate@mullaikitchen.com"
                  className="flex items-center gap-3 text-white/80 hover:text-skin transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Email</p>
                    <p className="text-sm font-medium">corporate@mullaikitchen.com</p>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
