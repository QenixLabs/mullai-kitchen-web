"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "motion/react";
import { Star, Quote, ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";
import { fadeInUp, staggerContainer, scaleIn } from "./animations";
import { Button } from "@/components/ui/button";

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

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

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
    <section ref={ref} className="py-20 bg-[#FAF7F2]">
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#39070F]/10 text-[#39070F] text-sm font-medium mb-4"
          >
            <Star className="h-4 w-4 fill-[#39070F]" />
            Customer Love
          </motion.div>
          
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
          >
            What Our Customers Say
          </motion.h2>
          
          <motion.p 
            variants={fadeInUp}
            className="text-lg text-gray-600"
          >
            Join 2,000+ happy customers enjoying fresh, home-style meals every day.
          </motion.p>
        </motion.div>

        {/* Testimonials Carousel */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={scaleIn}
          className="relative max-w-[1000px] mx-auto"
        >
          {/* Main Card */}
          <div className="relative h-[400px] overflow-hidden">
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
                <div className="bg-white rounded-3xl p-8 shadow-xl h-full">
                  <div className="flex flex-col h-full">
                    {/* Quote Icon */}
                    <Quote className="h-10 w-10 text-[#D4A574] mb-6" />

                    {/* Content */}
                    <p className="text-xl text-gray-700 leading-relaxed flex-grow">
                      "{testimonials[currentIndex].content}"
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden">
                          <Image
                            src={testimonials[currentIndex].image}
                            alt={testimonials[currentIndex].name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900">
                              {testimonials[currentIndex].name}
                            </h4>
                            {testimonials[currentIndex].verified && (
                              <BadgeCheck className="h-4 w-4 text-emerald-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {testimonials[currentIndex].role} • {testimonials[currentIndex].location}
                          </p>
                          <p className="text-xs text-[#39070F] mt-1">
                            Ordered: {testimonials[currentIndex].ordered}
                          </p>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="rounded-full h-12 w-12 border-gray-200 hover:bg-[#39070F] hover:text-white hover:border-[#39070F]"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-[#39070F] w-8"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="rounded-full h-12 w-12 border-gray-200 hover:bg-[#39070F] hover:text-white hover:border-[#39070F]"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        {/* Trust Stats */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={fadeInUp}
          className="flex flex-wrap justify-center gap-12 mt-16"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-[#39070F]">4.9</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-1">Average Rating</p>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-[#39070F]">2,000+</div>
            <p className="text-sm text-gray-600 mt-2">Happy Customers</p>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-[#39070F]">50,000+</div>
            <p className="text-sm text-gray-600 mt-2">Meals Delivered</p>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-[#39070F]">98%</div>
            <p className="text-sm text-gray-600 mt-2">Would Recommend</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
