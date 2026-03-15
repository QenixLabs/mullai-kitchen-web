"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { HelpCircle, Plus, Minus, UtensilsCrossed, Truck, CreditCard, MessageCircle, Sparkles } from "lucide-react";
import { fadeInUp, staggerContainer, floatAnimation } from "./animations";
import { cn } from "@/lib/utils";

const faqCategories = [
  { id: "all", name: "All", icon: HelpCircle },
  { id: "orders", name: "Orders", icon: UtensilsCrossed },
  { id: "delivery", name: "Delivery", icon: Truck },
  { id: "payment", name: "Payment", icon: CreditCard }
];

const faqs = [
  {
    question: "How do I pause or cancel my subscription?",
    answer: "You can pause or cancel your subscription anytime from your dashboard before 9 PM the previous day. Just go to your subscription settings and select the dates you want to pause. No questions asked!",
    category: "orders"
  },
  {
    question: "What areas do you deliver to?",
    answer: "We currently deliver to most areas in Chennai including Anna Nagar, T. Nagar, Adyar, Mylapore, Velachery, Nungambakkam, and 10+ more neighborhoods. Enter your pincode on our homepage to check availability in your area.",
    category: "delivery"
  },
  {
    question: "Can I customize my meals?",
    answer: "Yes! You can customize spice levels, portion sizes, and dietary preferences. Our Executive Plus plan offers advanced customization options including specific dish preferences and ingredient exclusions.",
    category: "orders"
  },
  {
    question: "How fresh is the food?",
    answer: "All meals are prepared fresh daily using high-quality ingredients sourced from local markets. We use temperature-controlled packaging to ensure your food stays hot and fresh during delivery. No preservatives or frozen items ever!",
    category: "orders"
  },
  {
    question: "What is your delivery timing?",
    answer: "We offer delivery slots for Breakfast (7-9 AM), Lunch (12-2 PM), and Dinner (7-9 PM). You can choose your preferred slot when setting up your subscription. We guarantee delivery within the selected time window.",
    category: "delivery"
  },
  {
    question: "How does the payment work?",
    answer: "We offer secure payment through Razorpay. You can pay via UPI, credit/debit cards, or net banking. For subscriptions, we use a wallet system where we reserve the amount and only charge after successful delivery confirmation.",
    category: "payment"
  },
  {
    question: "What if I'm not home during delivery?",
    answer: "If you're not home, our delivery partner will try to contact you. We can leave the meal with security or a neighbor if instructed. For gated communities, we can coordinate with security. The meal stays fresh for up to 2 hours in our insulated packaging.",
    category: "delivery"
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes! If you cancel before the 9 PM cutoff, you get full credit to your wallet. For any quality issues, contact our support within 24 hours of delivery and we'll process a refund or replacement immediately.",
    category: "payment"
  }
];

export function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeCategory, setActiveCategory] = useState("all");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = activeCategory === "all"
    ? faqs
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      {/* Premium Dark Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0205] via-[#1a0509] to-[#0d0205]" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glow Orbs */}
        <motion.div
          animate={floatAnimation}
          className="absolute top-1/4 right-1/4"
        >
          <div className="w-80 h-80 bg-[#D4A574]/5 rounded-full blur-[100px]" />
        </motion.div>
        <motion.div
          animate={{ ...floatAnimation, transition: { ...floatAnimation.transition, delay: 2 } }}
          className="absolute bottom-1/4 left-1/4"
        >
          <div className="w-96 h-96 bg-[#39070F]/10 rounded-full blur-[120px]" />
        </motion.div>

        {/* Subtle Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(212, 165, 116, 0.5) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#39070F] to-[#5a0f1a] border border-[#D4A574]/20 mb-6"
          >
            <HelpCircle className="h-4 w-4 text-[#D4A574]" />
            <span className="text-sm font-semibold text-white tracking-wide">Got Questions?</span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight px-2 sm:px-0"
          >
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A574] to-[#e8c4a0]">Questions</span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-lg text-white/60"
          >
            Everything you need to know about Mullai Kitchen.
          </motion.p>
        </motion.div>

        {/* Premium Category Tabs */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {faqCategories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                setOpenIndex(null);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all",
                activeCategory === category.id
                  ? "text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              {activeCategory === category.id && (
                <motion.div
                  layoutId="activeFAQCategory"
                  className="absolute inset-0 bg-gradient-to-r from-[#39070F] to-[#5a0f1a] rounded-full shadow-lg shadow-[#39070F]/30"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <category.icon className="h-4 w-4 relative z-10" />
              <span className="relative z-10">{category.name}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Premium FAQ Accordion */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="space-y-4"
        >
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={`${activeCategory}-${index}`}
              variants={fadeInUp}
              className="relative group"
            >
              {/* Glow Effect on Open */}
              <div className={cn(
                "absolute -inset-1 bg-gradient-to-r from-[#D4A574]/20 to-[#39070F]/20 rounded-2xl blur-xl opacity-0 transition-opacity duration-300",
                openIndex === index && "opacity-100"
              )} />

              <div className={cn(
                "relative border rounded-2xl overflow-hidden transition-all duration-300",
                openIndex === index
                  ? "bg-white/10 border-[#D4A574]/30"
                  : "bg-white/5 border-white/10 hover:border-white/20"
              )}>
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 sm:p-6 text-left transition-colors"
                >
                  <span className="text-base sm:text-lg font-semibold text-white pr-3 sm:pr-4">{faq.question}</span>
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                    openIndex === index
                      ? "bg-gradient-to-r from-[#D4A574] to-[#c49a6a] shadow-lg shadow-[#D4A574]/30"
                      : "bg-white/10 group-hover:bg-white/20"
                  )}>
                    {openIndex === index ? (
                      <Minus className="h-5 w-5 text-[#39070F]" />
                    ) : (
                      <Plus className="h-5 w-5 text-white/70" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <p className="text-white/70 leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Premium Support CTA */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          className="mt-12 text-center"
        >
          <div className="inline-flex flex-col items-center p-8 rounded-3xl bg-white/5 border border-white/10">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#39070F] to-[#5a0f1a] mb-4">
              <Sparkles className="h-6 w-6 text-[#D4A574]" />
            </div>
            <p className="text-white/70 mb-4 text-lg">Still have questions? We&apos;re here to help!</p>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <MessageCircle className="h-5 w-5" />
              Chat on WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
