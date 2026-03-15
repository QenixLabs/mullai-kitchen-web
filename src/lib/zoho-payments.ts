declare global {
  interface Window {
    ZPayments: {
      new (config: ZohoConfig): ZohoPaymentsInstance;
    };
  }
}

export interface ZohoConfig {
  account_id: string;
  domain?: string;
  otherOptions?: {
    api_key?: string;
  };
}

export interface ZohoPaymentsInstance {
  open(options: ZohoPaymentOptions): void;
}

export interface ZohoPaymentOptions {
  payment_session_id: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  theme?: {
    color?: string;
  };
  onSuccess?: (response: ZohoPaymentResponse) => void;
  onFailure?: (error: ZohoPaymentError) => void;
  onDismiss?: () => void;
}

export interface ZohoPaymentResponse {
  payment_id: string;
  payment_session_id: string;
  status: string;
}

export interface ZohoPaymentError {
  code: string;
  description: string;
}

export function loadZohoPaymentsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window not defined"));
      return;
    }

    if (window.ZPayments) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://static.zohocdn.com/zpay/zpay-js/v1/zpayments.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Zoho Payments script"));
    document.body.appendChild(script);
  });
}

export function openZohoCheckout(config: {
  accountId: string;
  paymentSessionId: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  theme?: {
    color?: string;
  };
  onSuccess: (response: ZohoPaymentResponse) => void;
  onFailure: (error: ZohoPaymentError) => void;
  onDismiss?: () => void;
}): void {
  if (!window.ZPayments) {
    throw new Error("Zoho Payments SDK not loaded. Call loadZohoPaymentsScript() first.");
  }

  // Initialize Zoho Payments with account ID only
  // The payment session is already created server-side with proper authentication
  const zohoInstance = new window.ZPayments({
    account_id: config.accountId,
    domain: 'IN',
  });

  zohoInstance.open({
    payment_session_id: config.paymentSessionId,
    customer: config.customer,
    theme: config.theme || {
      color: "#39070F", // Brand color from design system
    },
    onSuccess: config.onSuccess,
    onFailure: config.onFailure,
    onDismiss: config.onDismiss,
  });
}

export async function pollPaymentStatus(
  getStatus: () => Promise<{ status: string }>,
  onSuccess: () => void,
  onFailure: (error: string) => void,
  params: { pollInterval?: number; maxAttempts?: number } = {},
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
