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
        "mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6",
        className,
      )}
    >
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gold to-gold/80">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-bold uppercase tracking-widest text-gold">
            Corporate
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
          {title}
        </h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      {action && (
        <Button
          onClick={action.onClick}
          size="lg"
          className="gap-2 bg-primary hover:bg-primary/80 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl active:scale-[0.98]"
        >
          {action.icon && <action.icon className="h-5 w-5" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}
