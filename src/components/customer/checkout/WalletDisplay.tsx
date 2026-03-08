import { FaSpinner, FaTimesCircle, FaWallet, FaTimes } from "react-icons/fa";

interface WalletDisplayProps {
  walletBalance: number | null;
  walletLoading: boolean;
  walletError: Error | null;
  applyWallet: boolean;
  walletReservation: number;
  onRetry: () => void;
  onToggleApply: (apply: boolean) => void;
}

export function WalletDisplay({
  walletBalance,
  walletLoading,
  walletError,
  applyWallet,
  walletReservation,
  onRetry,
  onToggleApply,
}: WalletDisplayProps) {
  if (walletLoading) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
        <FaSpinner className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm text-gray-600">Loading wallet balance...</span>
      </div>
    );
  }

  if (walletError) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
        <FaTimesCircle className="h-4 w-4 text-red-600" />
        <span className="text-sm text-red-900">Failed to load wallet balance</span>
        <button
          type="button"
          onClick={onRetry}
          className="ml-auto text-sm font-semibold text-red-700 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between rounded-xl bg-primary p-4 shadow-sm shadow-primary/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <FaWallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Wallet Balance</p>
            <p className="text-xs text-white/70">Available funds</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-white">
            ₹{walletBalance?.toFixed(2) || "0.00"}
          </p>
        </div>
      </div>

      {walletBalance !== null && walletBalance > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="apply-wallet"
              checked={applyWallet}
              onChange={(e) => onToggleApply(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div>
              <label
                htmlFor="apply-wallet"
                className="text-sm font-semibold text-gray-900"
              >
                Apply Wallet Balance
              </label>
              <p className="text-xs text-gray-500">
                Reserve ₹{walletReservation.toFixed(2)} from wallet
              </p>
            </div>
          </div>
          {applyWallet && (
            <button
              type="button"
              onClick={() => onToggleApply(false)}
              className="text-muted-foreground hover:text-gray-600"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
