"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { MapPin, Shield, Leaf, Clock, Award, Heart, ChefHat, Star, Users } from "lucide-react";
import { fadeInUp, staggerContainer, scaleIn } from "./animations";

const trustSignals = [
  { icon: Shield, title: "FSSAI Certified", description: "Licensed cloud kitchen following all food safety standards" },
  { icon: Star, title: "4.9★ Rating", description: "Rated excellent by 2000+ happy customers" },
  { icon: Leaf, title: "Eco-Friendly", description: "Sustainable packaging made from plant materials" },
  { icon: Clock, title: "30-Min Delivery", description: "Hot meals delivered to your door in under 30 minutes" },
  { icon: Award, title: "Fresh Daily", description: "Meals prepared fresh every morning, never frozen" },
  { icon: Heart, title: "Made with Love", description: "Home-style cooking with authentic recipes" }
];

const chennaiAreas = [
  "Anna Nagar", "T. Nagar", "Adyar", "Mylapore", "Velachery",
  "Nungambakkam", "Kodambakkam", "Porur", "Guindy", "Chromepet",
  "Pallavaram", "Tambaram", "ECR", "OMR", "Anna Salai"
];

export function TrustSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-[#39070F]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div 
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium mb-4"
          >
            <ChefHat className="h-4 w-4" />
            Chennai&apos;s Trusted Cloud Kitchen
          </motion.div>
          
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            Why Chennai Chooses Mullai Kitchen
          </motion.h2>
          
          <motion.p 
            variants={fadeInUp}
            className="text-lg text-white/70"
          >
            From Anna Nagar to Tambaram, we&apos;re bringing authentic home-style South Indian meals 
            to thousands of Chennai homes every day.
          </motion.p>
        </motion.div>

        {/* Trust Grid */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {trustSignals.map((signal, index) => (
            <motion.div
              key={signal.title}
              variants={scaleIn}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4A574]">
                  <signal.icon className="h-6 w-6 text-[#39070F]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{signal.title}</h3>
                  <p className="text-sm text-white/70">{signal.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Coverage Area */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={fadeInUp}
          className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-[#D4A574]" />
                <h3 className="text-xl font-bold text-white">Delivering Across Chennai</h3>
              </div>
              
              <p className="text-white/70 mb-6">
                We currently serve 15+ neighborhoods across Chennai with same-day delivery. 
                Enter your pincode to check availability in your area.
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {chennaiAreas.map((area) => (
                  <span
                    key={area}
                    className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm"
                  >
                    {area}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#D4A574]" />
                  <span className="text-white"><span className="font-bold">2,000+</span> Happy Customers</span>
                </div>
              </div>
            </div>

            {/* Right: Image */}
            <div className="relative h-64 rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80"
                alt="Chef preparing meal"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#39070F]/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-medium">Professional chefs preparing your meals</p>
                <p className="text-white/70 text-sm">Fresh ingredients, authentic recipes</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
