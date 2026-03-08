import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaPiggyBank } from "react-icons/fa";
import { AddressFormStep } from "@/components/customer/onboarding/AddressFormStep";
import { OptOutDateSelector } from "@/components/customer/checkout/OptOutDateSelector";
import { addDays } from "date-fns";
import type { CreateAddressDto } from "@/api/types/customer.types";


interface CheckoutDialogsProps {
  showAddressDialog: boolean;
  showWalletInfo: boolean;
  showOptOutDialog: boolean;
  startDate: Date;
  subscriptionDays: number;
  optOutDates: Date[];
  maxOptOutDays: number;
  perDayPrice: number;
  createAddressMutation: {
    mutateAsync: (address: CreateAddressDto) => Promise<unknown>;
  };
  onToggleAddressDialog: (show?: boolean) => void;
  onToggleWalletInfo: (show?: boolean) => void;
  onToggleOptOutDialog: (show?: boolean) => void;
  onOptOutDatesChange: (dates: Date[]) => void;
}

export function CheckoutDialogs({
  showAddressDialog,
  showWalletInfo,
  showOptOutDialog,
  startDate,
  subscriptionDays,
  optOutDates,
  maxOptOutDays,
  perDayPrice,
  createAddressMutation,
  onToggleAddressDialog,
  onToggleWalletInfo,
  onToggleOptOutDialog,
  onOptOutDatesChange,
}: CheckoutDialogsProps) {
  const handleAddAddress = async (address: CreateAddressDto) => {
    await createAddressMutation.mutateAsync(address);
    onToggleAddressDialog(false);
  };

  return (
    <>
      {/* Address Dialog */}
      <Dialog open={showAddressDialog} onOpenChange={onToggleAddressDialog}>
        <DialogContent className="max-w-lg sm:min-w-120 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          <AddressFormStep
            hideList
            hideHeader
            onAddAddress={handleAddAddress}
          />
        </DialogContent>
      </Dialog>

      {/* Wallet Info Dialog */}
      <Dialog open={showWalletInfo} onOpenChange={onToggleWalletInfo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>How Two-Phase Wallet Works</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold text-gray-900">Phase 1: Reservation</p>
              <p>
                When you subscribe, funds are first reserved from your wallet
                to guarantee your subscription slot.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Phase 2: Deduction</p>
              <p>
                Actual deductions happen only when meals are delivered and
                confirmed. Any reserved but unused funds remain in your
                wallet.
              </p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-foreground">
                <strong>Benefit:</strong> Your balance stays secure even
                before delivery starts.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Opt-Out Date Selector Dialog */}
      <Dialog open={showOptOutDialog} onOpenChange={onToggleOptOutDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FaPiggyBank className="h-5 w-5 text-primary" />
              Select Days to Skip
            </DialogTitle>
          </DialogHeader>
          <OptOutDateSelector
            startDate={startDate}
            endDate={addDays(startDate, subscriptionDays)}
            selectedDates={optOutDates}
            onChange={onOptOutDatesChange}
            maxOptOutDays={maxOptOutDays}
            perDayPrice={perDayPrice}
            mealsRemaining={subscriptionDays - optOutDates.length}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => onToggleOptOutDialog(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
