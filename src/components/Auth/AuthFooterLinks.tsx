import Link from "next/link";

interface AuthFooterLinksProps {
  prompt: string;
  actionLabel: string;
  actionHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function AuthFooterLinks({
  prompt,
  actionLabel,
  actionHref,
  secondaryLabel,
  secondaryHref,
}: AuthFooterLinksProps) {
  return (
    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
      <p>
        {prompt}{" "}
        <Link
          className="font-semibold text-primary transition-colors hover:text-primary/90"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      </p>
      {secondaryLabel && secondaryHref ? (
        <Link
          className="text-xs font-medium text-muted-foreground/70 transition-colors hover:text-foreground"
          href={secondaryHref}
        >
          {secondaryLabel}
        </Link>
      ) : null}
    </div>
  );
}
