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
        <Link className="font-semibold text-primary transition hover:text-primary/80" href={actionHref}>
          {actionLabel}
        </Link>
      </p>
      {secondaryLabel && secondaryHref ? (
        <Link className="text-xs font-medium text-muted-foreground transition hover:text-foreground" href={secondaryHref}>
          {secondaryLabel}
        </Link>
      ) : null}
    </div>
  );
}
