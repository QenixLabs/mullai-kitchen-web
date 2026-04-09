"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AddOnCard,
  CategoryTabs,
  type AddOnCategoryTab,
  ViewCartButton,
  ActiveAddOnsSection,
  CheckoutSummaryDialog,
} from "@/components/customer/add-ons";
import { useSubscriptions } from "@/api/hooks/use-subscription";
import { useAvailableAddOns } from "@/api/hooks/useAddons";
import { FaExclamationCircle, FaShoppingBag, FaCalendarAlt } from "react-icons/fa";
import type { MealType, AddOnCategory } from "@/api/types/addons.types";

interface CartItem {
  item_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  meal_type: MealType;
  max_quantity: number;
  image?: string;
}

const categoryMapping: Record<AddOnCategoryTab, AddOnCategory[]> = {
  ALL: [],
  MEALS: ["Extra Main", "Dessert"],
  SNACKS: ["Side Dish"],
  BEVERAGES: ["Beverage"],
};

export default function AddOnsPage() {
  const router = useRouter();

  // State
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<AddOnCategoryTab>("ALL");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState<string>("");

  // Fetch user's subscriptions
  const { data: subscriptionsData, isLoading: isLoadingSubscriptions, error: subscriptionsError } =
    useSubscriptions();

  const subscriptions = subscriptionsData?.subscriptions ?? [];

  // Get active subscriptions (only 'active' status - backend requirement)
  const activeSubscriptions = useMemo(() => {
    return subscriptions.filter(
      (s) => s.status === "active"
    );
  }, [subscriptions]);


  // Set default subscription and delivery date
  useEffect(() => {
    if (activeSubscriptions.length > 0 && !selectedSubscriptionId) {
      setSelectedSubscriptionId(activeSubscriptions[0]._id);
      // Set default delivery date to today
      const today = new Date();
      setDeliveryDate(today.toISOString().split("T")[0]);
    }
  }, [activeSubscriptions, selectedSubscriptionId]);

  // Fetch available add-ons
  const { data: addOnsData, isLoading: isLoadingAddOns, error: addOnsError } =
    useAvailableAddOns(selectedSubscriptionId, {
      delivery_date: deliveryDate,
    });

  const selectedSubscription = useMemo(() => {
    return subscriptions.find((s) => s._id === selectedSubscriptionId);
  }, [subscriptions, selectedSubscriptionId]);

  const subscriptionMealTypes = selectedSubscription?.meals_included ?? [];

  const maxDeliveryDate = useMemo(() => {
    const end = selectedSubscription?.end_date;
    if (!end) return undefined;
    const d = new Date(end);
    return d.toISOString().split("T")[0];
  }, [selectedSubscription?.end_date]);

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (!addOnsData?.items) return [];

    if (activeCategory === "ALL") {
      return addOnsData.items;
    }

    const allowedCategories = categoryMapping[activeCategory];
    return addOnsData.items.filter((item) =>
      allowedCategories.includes(item.category)
    );
  }, [addOnsData?.items, activeCategory]);

  // Helper to determine the best meal type for an item based on subscription
  const resolveMealType = (itemMealTypes?: MealType[]): MealType => {
    const types = itemMealTypes ?? subscriptionMealTypes;
    if (types.length === 0) return "LUNCH";
    // Prefer meal types that match the subscription
    const intersection = types.filter((mt) => subscriptionMealTypes.includes(mt));
    return intersection[0] ?? types[0];
  };

  // Cart operations
  const updateCartItem = (itemId: string, quantity: number) => {
    const item = addOnsData?.items.find((i) => i._id === itemId);
    if (!item) return;

    // Determine the meal type for this item
    const targetMealType = resolveMealType(item.meal_type);

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (ci) => ci.item_id === itemId && ci.meal_type === targetMealType
      );

      if (existingIndex >= 0) {
        if (quantity <= 0) {
          return prev.filter((_, i) => i !== existingIndex);
        }
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity };
        return updated;
      }

      if (quantity > 0) {
        return [
          ...prev,
          {
            item_id: itemId,
            name: item.name,
            quantity,
            unit_price: item.price,
            meal_type: targetMealType,
            max_quantity: item.max_quantity_per_order ?? 10,
            image: item.image,
          },
        ];
      }

      return prev;
    });
  };

  const getCartQuantity = (itemId: string): number => {
    return cart
      .filter((ci) => ci.item_id === itemId)
      .reduce((sum, ci) => sum + ci.quantity, 0);
  };

  const handleAddToCart = (itemId: string) => {
    const quantity = getCartQuantity(itemId);
    if (quantity > 0) {
      toast.success("Added to cart", {
        description: cart.find((ci) => ci.item_id === itemId)?.name,
      });
    }
  };

  const handleOrderSuccess = () => {
    setCart([]);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Loading state
  if (isLoadingSubscriptions) {
    return (
      <div className="container mx-auto max-w-7xl p-4 sm:p-6 md:p-8">
        <div className="mb-6 sm:mb-8">
          <Skeleton className="h-8 sm:h-10 w-48 sm:w-64 mb-4" />
          <Skeleton className="h-4 w-64 sm:w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (subscriptionsError) {
    return (
      <div className="container mx-auto flex min-h-[75vh] max-w-7xl flex-col items-center justify-center p-4 sm:p-6">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-6">
          <FaExclamationCircle className="h-8 w-8 sm:h-10 sm:w-10" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-center">
          Error Loading Subscriptions
        </h2>
        <p className="text-muted-foreground mb-8 text-center text-sm sm:text-base px-4">
          {subscriptionsError instanceof Error
            ? subscriptionsError.message
            : "Failed to load subscriptions. Please check your connection and try again."}
        </p>
        <Button size="lg" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  // No active subscriptions state
  if (activeSubscriptions.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[75vh] max-w-7xl flex-col items-center justify-center p-4 sm:p-6">
        <div className="p-4 sm:p-5 rounded-full bg-muted mb-6">
          <FaShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-center">
          No Active Subscriptions
        </h2>
        <p className="text-muted-foreground mb-8 text-center text-sm sm:text-base max-w-md px-4">
          You need an active subscription to order add-ons. Explore our meal plans to get started!
        </p>
        <Button
          size="lg"
          onClick={() => router.push("/plans")}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <FaShoppingBag className="h-4 w-4" />
          Browse Plans
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="mb-1 text-[28px] font-black uppercase leading-none tracking-tight text-[#3A1018] sm:text-[32px] lg:text-[34px]">
              ADD-ONS
            </h1>
            <p className="text-sm text-[#3B3336] sm:text-base">
              Enhance your meals with delicious add-ons delivered with your subscription.
            </p>
          </div>
          <ViewCartButton
            itemCount={cartItemCount}
            onClick={() => setIsCheckoutOpen(true)}
            disabled={cartItemCount === 0}
          />
        </div>

        {/* Subscription Selector */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Select
            value={selectedSubscriptionId}
            onValueChange={setSelectedSubscriptionId}
          >
            <SelectTrigger className="w-full sm:w-[320px] rounded-full bg-white border border-border">
              <SelectValue placeholder="Select a subscription" />
            </SelectTrigger>
            <SelectContent position="popper" className="w-[320px] z-50">
              {activeSubscriptions.map((sub) => (
                <SelectItem key={sub._id} value={sub._id}>
                  {sub.plan_name} ({sub.meals_included.join(" + ")})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Selector */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted/50">
            <FaCalendarAlt className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              max={maxDeliveryDate}
              className="bg-transparent border-none outline-none text-sm text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Active Add-ons Section */}
      {selectedSubscriptionId && (
        <div className="mb-8">
          <ActiveAddOnsSection subscriptionId={selectedSubscriptionId} />
        </div>
      )}

      {/* Category Tabs */}
      <div className="mb-6">
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          subscriptionMealTypes={subscriptionMealTypes}
        />
      </div>

      {/* Add-ons Grid */}
      {isLoadingAddOns ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      ) : addOnsError ? (
        <div className="py-16 text-center">
          <FaExclamationCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Add-ons</h3>
          <p className="text-muted-foreground mb-4">
            {addOnsError instanceof Error
              ? addOnsError.message
              : "Please try again later."}
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-border rounded-2xl bg-muted/30">
          <FaShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Add-ons Available</h3>
          <p className="text-muted-foreground max-w-md mx-auto px-4">
            {activeCategory === "ALL"
              ? "There are no add-ons available for the selected date and subscription."
              : `No ${activeCategory.toLowerCase()} items available. Try a different category.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <AddOnCard
              key={item._id}
              item={item}
              quantity={getCartQuantity(item._id)}
              onQuantityChange={(qty) => updateCartItem(item._id, qty)}
              onAddToCart={() => handleAddToCart(item._id)}
              disabled={!item.is_available}
            />
          ))}
        </div>
      )}

      {/* Checkout Dialog */}
      <CheckoutSummaryDialog
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        subscriptionId={selectedSubscriptionId}
        deliveryDate={deliveryDate}
        onDeliveryDateChange={setDeliveryDate}
        maxDeliveryDate={maxDeliveryDate}
        onOrderSuccess={handleOrderSuccess}
      />
    </div>
  );
}
