import { FaPlusCircle } from "react-icons/fa";

interface AddNewAddressCardProps {
  onClick: () => void;
}

export function AddNewAddressCard({ onClick }: AddNewAddressCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center transition-all hover:border-border hover:bg-muted/40"
    >
      <FaPlusCircle className="h-6 w-6 text-muted-foreground" />
      <span className="text-sm font-medium text-gray-500">Add New Address</span>
    </button>
  );
}
