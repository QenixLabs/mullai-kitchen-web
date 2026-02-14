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
    <div className="flex flex-col gap-2 text-sm text-gray-500">
      <p>
        {prompt}{" "}
        <Link
          className="font-semibold text-[#FF6B35] transition-colors hover:text-[#E85A25]"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      </p>
      {secondaryLabel && secondaryHref ? (
        <Link
          className="text-xs font-medium text-gray-400 transition-colors hover:text-gray-600"
          href={secondaryHref}
        >
          {secondaryLabel}
        </Link>
      ) : null}
    </div>
  );
}
