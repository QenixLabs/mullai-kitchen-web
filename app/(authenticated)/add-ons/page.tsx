"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AddOnCard,
  CategoryTabs,
  type AddOnCategoryTab,
  ViewCartButton,
  CheckoutSummaryDialog,
} from "@/components/customer/add-ons";
import {
  useAvailableAddOnsIndependent,
  useMealTypes,
} from "@/api/hooks/useAddons";
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
  // State
  const [activeCategory, setActiveCategory] = useState<AddOnCategoryTab>("ALL");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Fetch ALL available add-ons (no subscription filter)
  const { data: addOnsData, isLoading: isLoadingAddOns, error: addOnsError } =
    useAvailableAddOnsIndependent({
      delivery_date: deliveryDate,
    });

  // Fetch meal types from user's active subscriptions (for checkout)
  const { data: mealTypesData } = useMealTypes();
  const mealTypes = mealTypesData?.mealTypes ?? [];

  // Filter items by category
  const filteredItems = useMemo(() => {
    const items = addOnsData?.items;
    if (!items) return [];

    if (activeCategory === "ALL") {
      return items;
    }

    const allowedCategories = categoryMapping[activeCategory];
    return items.filter((item) =>
      allowedCategories.includes(item.category)
    );
  }, [addOnsData, activeCategory]);

  // Cart operations - meal_type is assigned a default; user picks final meal type at checkout
  const resolveMealType = (itemMealTypes?: MealType[]): MealType => {
    if (itemMealTypes && itemMealTypes.length > 0) return itemMealTypes[0];
    if (mealTypes.length > 0) return mealTypes[0];
    return "Lunch";
  };

  const updateCartItem = (itemId: string, quantity: number) => {
    const item = addOnsData?.items.find((i) => i._id === itemId);
    if (!item) return;

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
  if (isLoadingAddOns && !addOnsData) {
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
  if (addOnsError) {
    return (
      <div className="container mx-auto flex min-h-[75vh] max-w-7xl flex-col items-center justify-center p-4 sm:p-6">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-6">
          <FaExclamationCircle className="h-8 w-8 sm:h-10 sm:w-10" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-center">
          Error Loading Add-ons
        </h2>
        <p className="text-muted-foreground mb-8 text-center text-sm sm:text-base px-4">
          {addOnsError instanceof Error
            ? addOnsError.message
            : "Failed to load add-ons. Please check your connection and try again."}
        </p>
        <Button size="lg" onClick={() => window.location.reload()}>
          Try Again
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
          <div className="flex items-center gap-2">
            <Link
              href="/add-ons/orders"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-muted/50 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <FaShoppingBag className="h-3.5 w-3.5" />
              Order History
            </Link>
            <ViewCartButton
              itemCount={cartItemCount}
              onClick={() => setIsCheckoutOpen(true)}
              disabled={cartItemCount === 0}
            />
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted/50 w-fit">
          <FaCalendarAlt className="h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="bg-transparent border-none outline-none text-sm text-foreground"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-6">
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          _subscriptionMealTypes={mealTypes}
        />
      </div>

      {/* Add-ons Grid */}
      {isLoadingAddOns ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-border rounded-2xl bg-muted/30">
          <FaShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Add-ons Available</h3>
          <p className="text-muted-foreground max-w-md mx-auto px-4">
            {activeCategory === "ALL"
              ? "There are no add-ons available for the selected date."
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
        deliveryDate={deliveryDate}
        onDeliveryDateChange={setDeliveryDate}
        mealTypes={mealTypes}
        onOrderSuccess={handleOrderSuccess}
      />
    </div>
  );
}
