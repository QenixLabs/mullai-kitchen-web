import { UtensilsCrossed, RefreshCw, Truck, Flame } from "lucide-react";

const FEATURES = [
  {
    icon: Flame,
    title: "Fresh meals, daily",
    description: "Order from our rotating menu of home-style dishes prepared fresh every morning.",
  },
  {
    icon: RefreshCw,
    title: "Flexible subscriptions",
    description: "Pause, skip, or modify your deliveries anytime with full wallet balance control.",
  },
  {
    icon: Truck,
    title: "Reliable delivery",
    description: "Track your orders in real-time and get timely updates from kitchen to doorstep.",
  },
];

export function AuthHighlights() {
  return (
    <div className="space-y-10">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-white/20 backdrop-blur-sm">
          <UtensilsCrossed className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Mullai Kitchen</h3>
          <p className="text-sm text-white/80">Fresh homestyle meals, delivered daily</p>
        </div>
      </div>

      {/* Value Proposition */}
      <div>
        <p className="text-lg leading-relaxed text-white/95">
          Transform your daily meals with our rotating menu of home-style dishes. Fresh ingredients,
          authentic recipes, and reliable delivery to your doorstep.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="space-y-5">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-white/15 backdrop-blur-sm">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white">{feature.title}</h4>
                <p className="mt-0.5 text-sm leading-relaxed text-white/80">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
