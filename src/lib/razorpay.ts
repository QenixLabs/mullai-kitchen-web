import type { RazorpayOptions, RazorpayPaymentResponse } from "@/api/types/payment.types";

declare global {
  interface Window {
    Razorpay: {
      new (options: RazorpayOptions): {
        open: () => void;
        close: () => void;
      };
    };
  }
}

export interface RazorpayConfig {
  keyId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  orderId: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  onSuccess: (response: RazorpayPaymentResponse) => void;
  onFailure?: (error: { code: string; description: string; source: string; metadata: unknown }) => void;
  onDismiss?: () => void;
}

export function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window not defined"));
      return;
    }

    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });
}

export function openRazorpayCheckout(config: RazorpayConfig): void {
  if (!window.Razorpay) {
    throw new Error("Razorpay SDK not loaded. Call loadRazorpayScript() first.");
  }

  const options: RazorpayOptions = {
    key: config.keyId,
    amount: config.amount,
    currency: config.currency,
    name: config.name,
    description: config.description,
    order_id: config.orderId,
    prefill: config.prefill,
    theme: config.theme || {
      color: "#f97316", // Orange-500
    },
    handler: (response: RazorpayPaymentResponse) => {
      config.onSuccess(response);
    },
    modal: {
      ondismiss: config.onDismiss,
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}

export interface PollOrderStatusParams {
  orderId: string;
  pollInterval?: number; // in milliseconds
  maxAttempts?: number;
}

export async function pollOrderStatus(
  getStatus: () => Promise<{ status: string }>,
  onSuccess: () => void,
  onFailure: (error: string) => void,
  params: PollOrderStatusParams = {},
): Promise<void> {
  const { pollInterval = 2000, maxAttempts = 15 } = params;
  let attempts = 0;

  const poll = async (): Promise<void> => {
    attempts++;

    try {
      const result = await getStatus();

      if (result.status === "paid") {
        onSuccess();
        return;
      }

      if (result.status === "failed") {
        onFailure("Payment failed");
        return;
      }

      if (attempts < maxAttempts) {
        setTimeout(poll, pollInterval);
      } else {
        onFailure("Payment confirmation timeout");
      }
    } catch (error) {
      if (attempts < maxAttempts) {
        setTimeout(poll, pollInterval);
      } else {
        onFailure("Failed to check payment status");
      }
    }
  };

  poll();
}
