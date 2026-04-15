"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useInView,
  AnimatePresence,
} from "motion/react";
import {
  Flame,
  Plus,
  Clock,
  Star,
  Leaf,
  ChevronRight,
  ChefHat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fadeInUp,
  staggerContainer,
  floatAnimation,
} from "./animations";
import { cn } from "@/lib/utils";

const categories = ["All", "Breakfast", "Lunch", "Dinner", "Snacks"];

const menuItems = [
  {
    id: 1,
    name: "Idli Sambar",
    description: "Soft idlis with flavorful sambar and coconut chutney",
    category: "Breakfast",
    calories: "280 cal",
    spice: "Medium",
    rating: 4.8,
    reviews: 342,
    price: 89,
    image:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80",
    veg: true,
    popular: true,
  },
  {
    id: 2,
    name: "Masala Dosa",
    description: "Crispy dosa stuffed with spiced potato filling",
    category: "Breakfast",
    calories: "350 cal",
    spice: "Medium",
    rating: 4.9,
    reviews: 528,
    price: 129,
    image:
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80",
    veg: true,
    popular: true,
  },
  {
    id: 3,
    name: "Chicken Biryani",
    description: "Aromatic rice with tender chicken and spices",
    category: "Lunch",
    calories: "520 cal",
    spice: "Spicy",
    rating: 4.9,
    reviews: 892,
    price: 199,
    image:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80",
    veg: false,
    popular: true,
  },
  {
    id: 4,
    name: "South Indian Thali",
    description: "Complete meal with rice, sambar, rasam, poriyal & more",
    category: "Lunch",
    calories: "650 cal",
    spice: "Medium",
    rating: 4.7,
    reviews: 412,
    price: 169,
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80",
    veg: true,
    popular: false,
  },
  {
    id: 5,
    name: "Chettinad Curry",
    description: "Fiery Chettinad style curry with authentic spices",
    category: "Dinner",
    calories: "450 cal",
    spice: "Hot",
    rating: 4.6,
    reviews: 234,
    price: 189,
    image:
      "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=400&q=80",
    veg: false,
    popular: false,
  },
  {
    id: 6,
    name: "Pongal",
    description: "Creamy rice & lentil dish with pepper and ghee",
    category: "Breakfast",
    calories: "320 cal",
    spice: "Mild",
    rating: 4.5,
    reviews: 198,
    price: 79,
    image:
      "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80",
    veg: true,
    popular: false,
  },
];

// Counter animation hook
import { useCounter } from "@/hooks/use-counter";

export function TodaysMenuSection({
  corporate = false,
}: {
  corporate?: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeCategory, setActiveCategory] = useState("All");
  const { ref: counterRef, displayValue: itemCount } = useCounter(24);

  const filteredItems =
    activeCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      {/* Premium Dark Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0509] via-[#0d0205] to-[#1a0509]" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glow Orbs */}
        <motion.div
          animate={floatAnimation}
          className="absolute top-0 left-1/3"
        >
          <div className="w-96 h-96 bg-skin/5 rounded-full blur-[120px]" />
        </motion.div>
        <motion.div
          animate={{
            ...floatAnimation,
            transition: { ...floatAnimation.transition, delay: 3 },
          }}
          className="absolute bottom-0 right-1/4"
        >
          <div className="w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
        </motion.div>

        {/* Subtle Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(212, 165, 116, 0.5) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="text-center mb-8 sm:mb-12"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-[#5a0f1a] border border-skin/20 mb-6"
          >
            <ChefHat className="h-4 w-4 text-skin" />
            <span className="text-sm font-semibold text-white tracking-wide">
              Fresh from Kitchen
            </span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight"
          >
            Today&apos;s{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-skin to-skin-light">
              Menu
            </span>
          </motion.h2>

          <motion.p variants={fadeInUp} className="text-lg text-white/60">
            Handpicked dishes prepared fresh today.{" "}
            <span ref={counterRef} className="text-skin font-semibold">
              {itemCount}
            </span>{" "}
            items available for immediate delivery.
          </motion.p>
        </motion.div>

        {/* Premium Category Tabs */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          className="flex flex-nowrap justify-start sm:justify-center gap-2 sm:gap-3 mb-8 sm:mb-12 overflow-x-auto pb-2 scrollbar-hide"
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0",
                activeCategory === category
                  ? "text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5",
              )}
            >
              {activeCategory === category && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-gradient-to-r from-primary to-[#5a0f1a] rounded-full shadow-lg shadow-primary/30"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{category}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Premium Menu Grid */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group"
              >
                <motion.div
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="relative h-full"
                >
                  {/* Glow Effect on Hover */}
                  <div
                    className={cn(
                      "absolute -inset-1 bg-gradient-to-r from-skin/20 to-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    )}
                  />

                  <div className="relative h-full bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 hover:border-skin/30 transition-all duration-300">
                    {/* Gradient Top Border */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-skin to-primary opacity-80" />

                    {/* Image */}
                    <div className="relative h-48 sm:h-52 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0205] via-transparent to-transparent" />

                      {/* Premium Badges */}
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-1.5 sm:gap-2">
                        {item.popular && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1 bg-gradient-to-r from-primary to-[#5a0f1a] text-white text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg shadow-primary/30"
                          >
                            <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-skin" />
                            <span className="hidden sm:inline">Popular</span>
                            <span className="sm:hidden">Hot</span>
                          </motion.div>
                        )}
                        <div
                          className={cn(
                            "flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-sm",
                            item.veg
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30",
                          )}
                        >
                          {item.veg ? (
                            <Leaf className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          ) : (
                            <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          )}
                          {item.veg ? "Veg" : "Non-Veg"}
                        </div>
                      </div>

                      {/* Quick Add Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary to-[#5a0f1a] rounded-full shadow-lg shadow-primary/30 flex items-center justify-center text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:shadow-xl"
                      >
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                      </motion.button>

                      {/* Rating Badge */}
                      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                        <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-amber-400 text-amber-400" />
                        {item.rating}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5">
                      <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">
                        {item.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/60 mb-3 sm:mb-4 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-white/50 mb-3 sm:mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-skin/70" />
                          {item.calories}
                        </div>
                        <div className="flex items-center gap-1">
                          <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-skin/70" />
                          {item.spice}
                        </div>
                        <span className="text-white/40 hidden sm:inline">
                          ({item.reviews})
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        {!corporate && (
                          <>
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl sm:text-2xl font-bold text-white">
                                ₹{item.price}
                              </span>
                              <span className="text-xs sm:text-sm text-white/50">
                                /meal
                              </span>
                            </div>
                            <Button
                              size="sm"
                              className="rounded-full bg-gradient-to-r from-skin to-skin-mid hover:from-skin-light hover:to-skin text-primary text-xs sm:text-sm font-semibold shadow-lg shadow-skin/20 transition-all hover:scale-[1.02] active:scale-[0.98] px-3 sm:px-4 py-1 sm:py-2 h-auto"
                            >
                              Order
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Premium View Full Menu CTA */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            className="h-14 px-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold hover:bg-white/20 hover:border-skin/30 transition-all group"
          >
            View Full Weekly Menu
            <ChevronRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
