"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { HelpCircle, Plus, Minus, UtensilsCrossed, Truck, CreditCard, MessageCircle } from "lucide-react";
import { fadeInUp, staggerContainer } from "./animations";

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
    <section ref={ref} className="py-20 bg-white">
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.div 
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#39070F]/10 text-[#39070F] text-sm font-medium mb-4"
          >
            <HelpCircle className="h-4 w-4" />
            Got Questions?
          </motion.div>
          
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
          >
            Frequently Asked Questions
          </motion.h2>
          
          <motion.p 
            variants={fadeInUp}
            className="text-lg text-gray-600"
          >
            Everything you need to know about Mullai Kitchen.
          </motion.p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {faqCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                setOpenIndex(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category.id
                  ? "bg-[#39070F] text-white shadow-lg shadow-[#39070F]/25"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <category.icon className="h-4 w-4" />
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* FAQ Accordion */}
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
              className="border border-gray-200 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</span>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  openIndex === index ? "bg-[#39070F] text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  {openIndex === index ? (
                    <Minus className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
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
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Support CTA */}
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 mb-4">Still have questions? We're here to help!</p>
          <a 
            href="https://wa.me/919876543210" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-full font-medium hover:bg-emerald-600 transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            Chat on WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}
