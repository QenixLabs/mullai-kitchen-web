"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "motion/react";
import { Flame, Clock, Star, Leaf, ChevronRight, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer } from "../landing/animations";
import { cn } from "@/lib/utils";

const categories = ["All", "Breakfast", "Lunch", "Dinner", "Snacks"];

const menuItems = [
  {
    id: 1,
    name: "Idli Sambar",
    description: "Steamed fermented rice cakes served with aromatic lentil stew.",
    category: "Breakfast",
    calories: "280 cal",
    spice: "MILD SPICE",
    rating: 4.9,
    price: 120,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80",
    veg: true,
  },
  {
    id: 2,
    name: "Masala Dosa",
    description: "Crispy thin crepe stuffed with tempered mashed potatoes and spices.",
    category: "Breakfast",
    calories: "380 cal",
    spice: "MEDIUM SPICE",
    rating: 4.8,
    price: 180,
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80",
    veg: true,
  },
  {
    id: 3,
    name: "Chicken Biryani",
    description: "Authentic long-grain basmati rice cooked with succulent spice-marinated chicken.",
    category: "Lunch",
    calories: "540 cal",
    spice: "HOT SPICE",
    rating: 5.0,
    price: 320,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80",
    veg: false,
  },
];

export function TodaysMenuSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredItems =
    activeCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  return (
    <section ref={ref} className="relative py-20 sm:py-24 overflow-hidden bg-[#FAF7F2]">
      <div className="relative mx-auto max-w-350 px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10"
        >
          <motion.div variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Fresh from Kitchen
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-tight">
              TODAY&apos;S <span className="text-primary">MENU</span>
            </h2>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  activeCategory === category
                    ? "bg-primary text-white"
                    : "bg-white text-muted-foreground border border-border/50 hover:bg-muted",
                )}
              >
                {category}
              </button>
            ))}
          </motion.div>
        </motion.div>

        {/* Grid */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="group bg-white rounded-2xl border border-border/50 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-foreground text-xs font-semibold px-2 py-1 rounded-full">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {item.rating}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-bold text-primary">{item.name}</h3>
                    <span className="text-lg font-bold text-primary">₹{item.price}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {item.calories}
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5" />
                      {item.spice}
                    </div>
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full h-11">
                    ORDER NOW
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={fadeInUp} initial="initial" animate={isInView ? "animate" : "initial"} className="text-center mt-10">
          <Button
            variant="outline"
            className="h-12 px-8 rounded-full border-border hover:bg-muted font-semibold"
          >
            View Full Weekly Menu
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
