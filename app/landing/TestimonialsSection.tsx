"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence, useMotionValue, useTransform, animate } from "motion/react";
import { Star, Quote, ChevronLeft, ChevronRight, BadgeCheck, Sparkles, Users, ChefHat, Heart } from "lucide-react";
import { fadeInUp, staggerContainer, scaleIn, floatAnimation } from "./animations";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Working Professional",
    location: "Anna Nagar",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    rating: 5,
    content: "Mullai Kitchen has been a lifesaver! After long work days, I don't have to worry about cooking. The food tastes just like home - fresh, flavorful, and perfectly spiced.",
    ordered: "Daily Meals - Monthly Plan",
    verified: true
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    role: "Business Owner",
    location: "T. Nagar",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    rating: 5,
    content: "The quality and consistency are amazing. I've been subscribing for 6 months now and have never been disappointed. The biryani is outstanding and the thali options are perfect for family dinners.",
    ordered: "Executive Plus - Family Plan",
    verified: true
  },
  {
    id: 3,
    name: "Anita Patel",
    role: "Homemaker",
    location: "Adyar",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    rating: 5,
    content: "Even though I cook, sometimes I need a break. Mullai Kitchen's meals are so authentic and delicious. My family loves the variety and the portions are generous. Highly recommend!",
    ordered: "Basic Tiffin - Weekly Plan",
    verified: true
  },
  {
    id: 4,
    name: "Venkatesh Iyer",
    role: "IT Professional",
    location: "Velachery",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    rating: 5,
    content: "As someone who stays alone, this service has made my life so much easier. The app is intuitive, delivery is always on time, and the food quality never drops. Worth every rupee!",
    ordered: "Daily Meals - Monthly Plan",
    verified: true
  }
];

// Counter animation hook
function useCounter(target: number, duration: number = 2) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, target, {
        duration,
        ease: "easeOut",
        onUpdate: (latest) => setDisplayValue(Math.round(latest))
      });
      return controls.stop;
    }
  }, [isInView, target, duration]);

  return { ref, displayValue };
}

// Animated Stat Component
function AnimatedStat({ value, suffix = "", label, icon: Icon }: {
  value: number;
  suffix?: string;
  label: string;
  icon: React.ElementType;
}) {
  const { ref, displayValue } = useCounter(value);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-col items-center text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#D4A574]/20 to-[#39070F]/20 mb-3">
        <Icon className="h-5 w-5 text-[#D4A574]" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white">
          {displayValue}
        </span>
        {suffix && <span className="text-xl font-semibold text-[#D4A574]">{suffix}</span>}
      </div>
      <p className="text-sm text-white/50 mt-1">{label}</p>
    </motion.div>
  );
}

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      {/* Premium Dark Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0205] via-[#1a0509] to-[#0d0205]" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glow Orbs */}
        <motion.div
          animate={floatAnimation}
          className="absolute top-1/4 left-1/4"
        >
          <div className="w-80 h-80 bg-[#D4A574]/5 rounded-full blur-[100px]" />
        </motion.div>
        <motion.div
          animate={{ ...floatAnimation, transition: { ...floatAnimation.transition, delay: 2 } }}
          className="absolute bottom-1/4 right-1/4"
        >
          <div className="w-96 h-96 bg-[#39070F]/10 rounded-full blur-[120px]" />
        </motion.div>

        {/* Decorative Quote Marks */}
        <div className="absolute top-20 left-10 text-[#D4A574]/5 text-[200px] font-serif leading-none select-none">
          "
        </div>
        <div className="absolute bottom-20 right-10 text-[#D4A574]/5 text-[200px] font-serif leading-none select-none rotate-180">
          "
        </div>
      </div>

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#39070F] to-[#5a0f1a] border border-[#D4A574]/20 mb-6"
          >
            <Heart className="h-4 w-4 text-[#D4A574]" />
            <span className="text-sm font-semibold text-white tracking-wide">Customer Love</span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight"
          >
            What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A574] to-[#e8c4a0]">Customers Say</span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-lg text-white/60"
          >
            Join 2,000+ happy customers enjoying fresh, home-style meals every day.
          </motion.p>
        </motion.div>

        {/* Premium Testimonials Carousel */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={scaleIn}
          className="relative max-w-[1000px] mx-auto"
        >
          {/* Glow Effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#D4A574]/10 to-[#39070F]/10 rounded-[2rem] blur-2xl" />

          {/* Main Card */}
          <div className="relative h-[420px] overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="absolute inset-0"
              >
                <div className="relative h-full bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                  {/* Gradient Top Border */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#39070F] via-[#D4A574] to-[#39070F] rounded-t-3xl" />

                  <div className="flex flex-col h-full">
                    {/* Premium Quote Icon */}
                    <div className="mb-6">
                      <Quote className="h-12 w-12 text-[#D4A574]" />
                    </div>

                    {/* Content */}
                    <p className="text-xl text-white/90 leading-relaxed flex-grow font-medium">
                      "{testimonials[currentIndex].content}"
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-[#D4A574]/30">
                          <Image
                            src={testimonials[currentIndex].image}
                            alt={testimonials[currentIndex].name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-lg">
                              {testimonials[currentIndex].name}
                            </h4>
                            {testimonials[currentIndex].verified && (
                              <BadgeCheck className="h-5 w-5 text-[#D4A574]" />
                            )}
                          </div>
                          <p className="text-sm text-white/50">
                            {testimonials[currentIndex].role} • {testimonials[currentIndex].location}
                          </p>
                          <p className="text-xs text-[#D4A574] mt-1 font-medium">
                            {testimonials[currentIndex].ordered}
                          </p>
                        </div>
                      </div>

                      {/* Premium Rating */}
                      <div className="flex items-center gap-1 bg-gradient-to-r from-[#39070F] to-[#5a0f1a] px-4 py-2 rounded-full">
                        {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-[#D4A574] text-[#D4A574]" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Premium Navigation */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="rounded-full h-12 w-12 bg-white/5 border-white/20 hover:bg-[#39070F] hover:text-white hover:border-[#39070F] text-white transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Premium Dots */}
            <div className="flex items-center gap-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-300",
                    index === currentIndex
                      ? "bg-gradient-to-r from-[#D4A574] to-[#39070F] w-10"
                      : "bg-white/20 hover:bg-white/40 w-2.5"
                  )}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="rounded-full h-12 w-12 bg-white/5 border-white/20 hover:bg-[#39070F] hover:text-white hover:border-[#39070F] text-white transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        {/* Premium Trust Stats */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={fadeInUp}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-12 border-t border-white/10"
        >
          <AnimatedStat
            value={4.9}
            suffix="★"
            label="Average Rating"
            icon={Star}
          />
          <AnimatedStat
            value={2000}
            suffix="+"
            label="Happy Customers"
            icon={Users}
          />
          <AnimatedStat
            value={50000}
            suffix="+"
            label="Meals Delivered"
            icon={ChefHat}
          />
          <AnimatedStat
            value={98}
            suffix="%"
            label="Would Recommend"
            icon={Heart}
          />
        </motion.div>
      </div>
    </section>
  );
}
