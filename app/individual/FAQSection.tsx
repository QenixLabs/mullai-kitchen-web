"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { HelpCircle, Plus, Minus, LayoutGrid, UtensilsCrossed, Truck, CreditCard } from "lucide-react";
import { fadeInUp, staggerContainer } from "../landing/animations";
import { cn } from "@/lib/utils";

const faqCategories = [
  { id: "all", name: "All", icon: LayoutGrid },
  { id: "orders", name: "Orders", icon: UtensilsCrossed },
  { id: "delivery", name: "Delivery", icon: Truck },
  { id: "payment", name: "Payment", icon: CreditCard },
];

const faqs = [
  {
    question: "How do I pause or cancel my subscription?",
    answer: "You can pause or cancel your subscription anytime from your dashboard before 9 PM the previous day. Just go to your subscription settings and select the dates you want to pause. No questions asked!",
    category: "orders",
  },
  {
    question: "What areas do you deliver to?",
    answer: "We currently deliver to most areas in Chennai including Anna Nagar, T. Nagar, Adyar, Mylapore, Velachery, Nungambakkam, and 10+ more neighborhoods.",
    category: "delivery",
  },
  {
    question: "Can I customize my meals?",
    answer: "Yes! You can customize spice levels, portion sizes, and dietary preferences. Our Executive Plus plan offers advanced customization options.",
    category: "orders",
  },
  {
    question: "How fresh is the food?",
    answer: "All meals are prepared fresh daily using high-quality ingredients sourced from local markets. We use temperature-controlled packaging to ensure your food stays hot and fresh during delivery.",
    category: "orders",
  },
];

export function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeCategory, setActiveCategory] = useState("all");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = activeCategory === "all" ? faqs : faqs.filter((faq) => faq.category === activeCategory);

  return (
    <section ref={ref} className="relative py-20 sm:py-24 overflow-hidden bg-[#FAF7F2]">
      <div className="relative mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="text-center mb-10"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white mb-5"
          >
            <HelpCircle className="h-4 w-4 text-white" />
            <span className="text-xs font-semibold tracking-wide uppercase">Got Questions?</span>
          </motion.div>

          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-tight">
            FREQUENTLY ASKED QUESTIONS
          </motion.h2>

          <motion.p variants={fadeInUp} className="individual-copy-mauve mt-4 text-lg">
            Everything you need to know about Mullai Elite&apos;s culinary concierge service.
          </motion.p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {faqCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                setOpenIndex(null);
              }}
              className={cn(
                "relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all border",
                activeCategory === category.id
                  ? "bg-primary text-white border-primary shadow-md"
                  : "bg-white text-muted-foreground border-border/60 hover:bg-muted",
              )}
            >
              <category.icon className="h-4 w-4" />
              <span>{category.name}</span>
            </button>
          ))}
        </motion.div>

        <motion.div initial="initial" animate={isInView ? "animate" : "initial"} variants={staggerContainer} className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <motion.div key={`${activeCategory}-${index}`} variants={fadeInUp}>
              <div className="relative rounded-[1.75rem] overflow-hidden bg-[#F5F1EC]">
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 sm:p-7 text-left transition-colors"
                >
                  <span className="text-base sm:text-lg font-bold text-primary pr-4">{faq.question}</span>
                  <div
                    className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all",
                      openIndex === index ? "bg-[#F5C5C5] text-primary" : "bg-[#E8E3DD] text-primary",
                    )}
                  >
                    {openIndex === index ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </div>
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 sm:px-7 pb-6 sm:pb-7">
                        <p className="text-muted-foreground leading-relaxed text-base">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
