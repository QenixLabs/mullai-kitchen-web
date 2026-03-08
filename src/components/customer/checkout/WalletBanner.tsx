import { FaInfoCircle } from "react-icons/fa";

interface WalletBannerProps {
  onLearnMore: () => void;
}

export function WalletBanner({ onLearnMore }: WalletBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted p-4 sm:p-5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
        <FaInfoCircle className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">
          Two-Phase Wallet Reservation
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-gray-600">
          Funds are first reserved in your Mullai Wallet to secure your
          subscription. Deductions from your actual balance occur only
          upon delivery confirmation.{" "}
          <button
            type="button"
            onClick={onLearnMore}
            className="font-medium text-primary hover:underline"
          >
            Learn more about how it works.
          </button>
        </p>
      </div>
    </div>
  );
}
