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
        "mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4",
        className,
      )}
    >
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <Button
          onClick={action.onClick}
          className="gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
        >
          {action.icon && <action.icon className="h-4 w-4" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}
