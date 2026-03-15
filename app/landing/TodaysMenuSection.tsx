"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "motion/react";
import { Flame, Plus, Clock, Star, Leaf, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer, scaleIn } from "./animations";

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
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80",
    veg: true,
    popular: true
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
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80",
    veg: true,
    popular: true
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
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80",
    veg: false,
    popular: true
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
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80",
    veg: true,
    popular: false
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
    image: "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=400&q=80",
    veg: false,
    popular: false
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
    image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80",
    veg: true,
    popular: false
  }
];

export function TodaysMenuSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredItems = activeCategory === "All" 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <section ref={ref} className="py-20 bg-[#FAF7F2]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.div 
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4A574]/20 text-[#39070F] text-sm font-medium mb-4"
          >
            <Flame className="h-4 w-4" />
            Fresh from Kitchen
          </motion.div>
          
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
          >
            Today&apos;s Menu
          </motion.h2>
          
          <motion.p 
            variants={fadeInUp}
            className="text-lg text-gray-600"
          >
            Handpicked dishes prepared fresh today. Available for immediate delivery.
          </motion.p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === category
                  ? "bg-[#39070F] text-white shadow-lg shadow-[#39070F]/25"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Menu Grid */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {item.popular && (
                      <div className="flex items-center gap-1 bg-[#39070F] text-white text-xs font-medium px-2 py-1 rounded-full">
                        <Flame className="h-3 w-3" />
                        Popular
                      </div>
                    )}
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                      item.veg ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {item.veg ? <Leaf className="h-3 w-3" /> : <Flame className="h-3 w-3" />}
                      {item.veg ? "Veg" : "Non-Veg"}
                    </div>
                  </div>

                  {/* Quick Add Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-[#39070F] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="h-5 w-5" />
                  </motion.button>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold">{item.rating}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.calories}
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      {item.spice}
                    </div>
                    <span>({item.reviews} reviews)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-[#39070F]">₹{item.price}</span>
                      <span className="text-sm text-gray-500">/meal</span>
                    </div>
                    <Button 
                      size="sm" 
                      className="rounded-full bg-[#39070F] hover:bg-[#39070F]/90 text-white"
                    >
                      Order
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* View Full Menu CTA */}
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          className="text-center mt-12"
        >
          <Button 
            variant="outline" 
            size="lg"
            className="rounded-full border-2 border-[#39070F] text-[#39070F] hover:bg-[#39070F] hover:text-white px-8"
          >
            View Full Weekly Menu
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
