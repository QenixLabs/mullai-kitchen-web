const FEATURES = [
  {
    icon: "🍽️",
    title: "Fresh meals, daily",
    description: "Order from our rotating menu of home-style dishes prepared fresh every morning.",
  },
  {
    icon: "🔄",
    title: "Flexible subscriptions",
    description: "Pause, skip, or modify your deliveries anytime with full wallet balance control.",
  },
  {
    icon: "🚚",
    title: "Reliable delivery",
    description: "Track your orders in real-time and get timely updates from kitchen to doorstep.",
  },
];

export function AuthHighlights() {
  return (
    <div className="space-y-10">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <span className="text-2xl">🍲</span>
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
      <div className="space-y-6">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="flex gap-4">
            <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
              <span className="text-lg">{feature.icon}</span>
            </div>
            <div>
              <h4 className="font-semibold text-white">{feature.title}</h4>
              <p className="mt-1 text-sm text-white/80 leading-relaxed">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
