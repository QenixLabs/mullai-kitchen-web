/**
 * Zoho Payments JS SDK Integration
 * Documentation: https://www.zoho.com/us/payments/api/v1/widget
 */

declare global {
  interface Window {
    ZPayments: {
      new (config: ZohoConfig): ZohoPaymentsInstance;
    };
  }
}

export interface ZohoConfig {
  account_id?: string;
  accountId?: string; // SDK accepts both formats
  domain?: string;
  otherOptions?: {
    api_key?: string;
  };
}

export interface ZohoPaymentsInstance {
  open?(options: ZohoPaymentOptions): void;
  requestPaymentMethod(
    options: ZohoPaymentOptions,
  ): Promise<ZohoPaymentResponse>;
  close?(): Promise<void>;
}

export interface ZohoPaymentOptions {
  amount: string;
  transaction_type?: "payment" | "refund";
  currency_code: string;
  payments_session_id: string; // Note: with 's' - payments_session_id
  currency_symbol?: string;
  business?: string;
  description?: string;
  invoice_number?: string;
  reference_number?: string;
  address?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface ZohoPaymentResponse {
  payment_id: string;
  payments_session_id: string;
  status: string;
}

export interface ZohoPaymentError {
  code: string;
  message: string;
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
    script.onerror = () =>
      reject(new Error("Failed to load Zoho Payments script"));
    document.body.appendChild(script);
  });
}

export async function openZohoCheckout(config: {
  accountId: string;
  paymentSessionId: string;
  amount: number;
  currency: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  description?: string;
  invoiceNumber?: string;
  onSuccess: (response: ZohoPaymentResponse) => void;
  onFailure: (error: ZohoPaymentError) => void;
}): Promise<void> {
  if (!window.ZPayments) {
    throw new Error(
      "Zoho Payments SDK not loaded. Call loadZohoPaymentsScript() first.",
    );
  }

  console.log("[Zoho] Initializing ZPayments...");
  console.log("[Zoho] Account ID:", config.accountId);
  console.log("[Zoho] Payment Session ID:", config.paymentSessionId);

  // Initialize Zoho Payments with account_id, domain, and API key (required for India)
  const zohoConfig: ZohoConfig = {
    account_id: config.accountId,
    domain: "IN",
  };

  // Add API key if available in environment
  const apiKey = process.env.NEXT_PUBLIC_ZOHO_API_KEY;
  if (apiKey) {
    zohoConfig.otherOptions = {
      api_key: apiKey,
    };
  }

  console.log("[Zoho] Zoho config:", { ...zohoConfig, otherOptions: apiKey ? "***" : undefined });

  const instance = new window.ZPayments(zohoConfig);

  console.log("[Zoho] Instance created:", instance);

  try {
    // Build options matching Zoho India documentation format
    const options: ZohoPaymentOptions = {
      amount: String(config.amount),
      currency_code: config.currency,
      payments_session_id: config.paymentSessionId,
      currency_symbol: "₹",
      business: "MullaiKitchen",
      description: config.description || "Payment for subscription",
      reference_number: config.invoiceNumber || config.paymentSessionId,
      address: {
        name: config.customer?.name || "Customer",
        email: config.customer?.email || "customer@mullaikitchen.com",
        phone: config.customer?.phone || "9999999999",
      },
    };

    console.log("[Zoho] Calling requestPaymentMethod with:", options);

    const result = await instance.requestPaymentMethod(options);

    console.log("[Zoho] Payment result:", result);
    config.onSuccess(result);
  } catch (_error) {
    const err = _error instanceof Error ? _error : new Error(String(_error));
    console.error("[Zoho] Error:", err);

    const code = "code" in err && typeof err.code === "string" ? err.code : "PAYMENT_ERROR";
    if (code === "widget_closed") {
      return;
    }
    config.onFailure({
      code,
      message: err.message || "Payment failed",
    });
  } finally {
    try {
      if (typeof instance.close === "function") {
        await instance.close();
      }
    } catch {
      // Ignore close errors
    }
  }
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
    } catch {
      if (attempts < maxAttempts) {
        setTimeout(poll, pollInterval);
      } else {
        onFailure("Failed to check payment status");
      }
    }
  };

  poll();
}
