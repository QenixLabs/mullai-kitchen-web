import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CorporatePageHeaderProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ElementType;
  };
  className?: string;
}

export function CorporatePageHeader({
  icon: Icon,
  title,
  subtitle,
  action,
  className,
}: CorporatePageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 pb-10 border-b border-border/50",
        className,
      )}
    >
      <div className="flex items-center gap-6">
        <motion.div 
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          className="hidden sm:flex items-center justify-center w-14 h-14 rounded-[1.25rem] bg-linear-to-br from-primary to-primary/80 text-white shadow-xl shadow-primary/20"
        >
          <Icon className="h-7 w-7" />
        </motion.div>
        <div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-[#44151C] mb-1">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm font-bold text-muted-foreground sm:text-base opacity-70">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {action && (
        <Button
          onClick={action.onClick}
          className="group relative gap-3 rounded-full bg-primary px-8 h-12 text-xs font-black uppercase tracking-widest text-primary-foreground shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all outline-none overflow-hidden"
        >
           <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
           {action.icon && <action.icon className="h-4 w-4 relative z-10" />}
           <span className="relative z-10">{action.label}</span>
        </Button>
      )}
    </div>
  );
}
