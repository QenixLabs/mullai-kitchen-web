import { motion } from "motion/react";
import { ClipboardList, Settings, Utensils, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

interface HowItWorksSectionProps {
  className?: string;
}

export function HowItWorksSection({ className = "" }: HowItWorksSectionProps) {
  const steps = [
    {
      number: "01",
      icon: ClipboardList,
      title: "Choose Your Plan",
      description: "Select from our Basic, Premium, or Executive plans based on your appetite and lifestyle.",
    },
    {
      number: "02",
      icon: Settings,
      title: "Build Your Own",
      description: "Create a personalized plan. Choose delivery days, timing, and portions that fit your schedule.",
    },
    {
      number: "03",
      icon: Utensils,
      title: "Customize Menu",
      description: "Browse our weekly menu and pick the meals that suit your taste preferences perfectly.",
    },
    {
      number: "04",
      icon: Smile,
      title: "Enjoy Fresh Meals",
      description: "Sit back and relax as we deliver freshly prepared meals to your doorstep every single day.",
    },
  ];

  return (
    <section className={cn("relative py-24 overflow-hidden", className)}>
      {/* Premium Dark Background */}
      <div className="absolute inset-0 bg-linear-to-b from-[#0d0205] via-[#1a0509] to-[#0d0205]" />
      
      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(212, 165, 116, 0.5) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(212, 165, 116, 0.5) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 text-3xl sm:text-4xl font-bold tracking-tight text-white"
          >
            Simple, Healthy, & <span className="text-transparent bg-clip-text bg-linear-to-r from-[#D4A574] to-[#e8c4a0]">Consistent</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-2xl text-lg text-white/60"
          >
            Skip the grocery shopping and cooking. We bring the taste of home
            to your doorstep every single day.
          </motion.p>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative flex flex-col h-full bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 transition-all duration-300"
            >
              {/* Subtle Top Border */}
              <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#D4A574]/50 to-transparent opacity-80" />

              {/* Icon Container */}
              <div className="mb-8 flex items-center justify-center">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D4A574]/10 border border-[#D4A574]/20 group-hover:bg-[#D4A574]/20 transition-colors">
                  <step.icon className="h-8 w-8 text-[#D4A574]" />
                  
                  {/* Step Number Badge */}
                  <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#39070F] border border-[#D4A574]/30 text-[10px] font-bold text-[#D4A574] shadow-lg">
                    {step.number}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className="mb-3 text-xl font-bold text-white tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/50">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
