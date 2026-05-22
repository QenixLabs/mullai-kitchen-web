import { useState } from "react";
import { Package, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { IngredientConsumptionProjection } from "@/api/admin-kitchen.api";

interface KitchenIngredientConsumptionProps {
  projections: IngredientConsumptionProjection[] | undefined;
  loading: boolean;
}

export function KitchenIngredientConsumption({
  projections,
  loading,
}: KitchenIngredientConsumptionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Package className="h-4 w-4 text-primary" />
            Ingredient Consumption
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!projections || projections.length === 0) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Package className="h-4 w-4 text-primary" />
            Ingredient Consumption
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No ingredient consumption data available for the selected date.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Package className="h-4 w-4 text-primary" />
          Ingredient Consumption
          <Badge variant="secondary" className="ml-1 text-xs">
            {projections.length} ingredients
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70 bg-muted/50 text-left">
                <th className="px-4 py-2.5 font-medium text-muted-foreground">
                  Ingredient
                </th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">
                  Total Needed
                </th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">
                  Recipes
                </th>
                <th className="w-10 px-2 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {projections.map((proj) => {
                const isOpen = expandedId === proj.ingredient_id;
                return (
                  <>
                    <tr
                      key={proj.ingredient_id}
                      className="cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/30"
                      onClick={() =>
                        setExpandedId(isOpen ? null : proj.ingredient_id)
                      }
                    >
                      <td className="px-4 py-2.5 font-medium text-foreground">
                        {proj.ingredient_name}
                      </td>
                      <td className="px-4 py-2.5 text-foreground">
                        {proj.total_quantity} {proj.unit}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className="text-xs">
                          {proj.recipes.length} recipe
                          {proj.recipes.length > 1 ? "s" : ""}
                        </Badge>
                      </td>
                      <td className="px-2 py-2.5">
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-muted/20">
                        <td colSpan={4} className="px-4 py-3">
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Recipe Breakdown
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              {proj.recipes.map((r) => (
                                <div
                                  key={r.recipe_id}
                                  className="rounded-lg border border-border/60 bg-background p-2.5 text-xs"
                                >
                                  <div className="flex justify-between">
                                    <span className="font-medium text-foreground">
                                      {r.count} orders
                                    </span>
                                    <span className="text-muted-foreground">
                                      {r.quantity_per_recipe} {proj.unit}
                                    </span>
                                  </div>
                                  {r.wastage_factor > 0 && (
                                    <p className="mt-1 text-amber-600">
                                      +{Math.round(r.wastage_factor * 100)}%
                                      wastage
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
