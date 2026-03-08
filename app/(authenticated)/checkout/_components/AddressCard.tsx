import { FaCheckCircle, FaEdit } from "react-icons/fa";
import { cn } from "@/lib/utils";

interface AddressCardProps {
  address: {
    _id: string;
    type: string;
    full_address: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    is_default: boolean;
  };
  selected: boolean;
  onClick: () => void;
}

export function AddressCard({ address, selected, onClick }: AddressCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex w-full flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all",
        selected
          ? "border-border bg-muted shadow-sm"
          : "border-gray-200 bg-white hover:border-border hover:bg-muted/40",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
          {address.type}
          {address.is_default && selected && (
            <FaCheckCircle className="h-3.5 w-3.5 text-primary" />
          )}
        </span>
        <FaEdit className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <p className="text-xs text-gray-600">{address.full_address}</p>
      <p className="text-xs text-gray-600">
        {address.area}, {address.city}
      </p>
      <p className="text-xs text-gray-500">
        {address.state} - {address.pincode}
      </p>
    </button>
  );
}
