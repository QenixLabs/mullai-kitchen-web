import { MessageCircle } from "lucide-react";
import { CHECKOUT_CONFIG } from "../_hooks/types";

export function HelpChat() {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
          <MessageCircle className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-800">Need help with payment?</p>
          <p className="text-[11px] text-gray-500">Our concierge is available 24/7</p>
        </div>
      </div>
      <a
        href={`mailto:${CHECKOUT_CONFIG.email}?subject=${encodeURIComponent(CHECKOUT_CONFIG.supportEmailSubject)}`}
        className="text-xs font-semibold text-primary underline underline-offset-2 hover:text-foreground"
      >
        Chat
      </a>
    </div>
  );
}
