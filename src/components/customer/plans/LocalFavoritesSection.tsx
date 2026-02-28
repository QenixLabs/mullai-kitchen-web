import { Clock, Headphones, Leaf, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

interface LocalFavoritesSectionProps {
  className?: string;
}

// Static trust badges data
const trustBadges = [
  {
    icon: ShieldCheck,
    title: "FSSAI Certified",
    description: "Food safety certified kitchens",
  },
  {
    icon: Leaf,
    title: "Eco-friendly Packaging",
    description: "Sustainable & biodegradable materials",
  },
  {
    icon: Clock,
    title: "Always On-time",
    description: "Reliable delivery you can count on",
  },
  {
    icon: Headphones,
    title: "24/7 Local Support",
    description: "Help whenever you need it",
  },
];

// Server Component - no interactivity, renders on server for better SEO and initial load
export function LocalFavoritesSection({ className }: LocalFavoritesSectionProps) {
  return (
    <section className={cn("bg-white py-14 sm:py-16", className)}>
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            Your Local Favorite
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            We understand the authentic taste of Chennai because we are from Chennai. From the spice levels of
            your Sambar to the crispiness of the Medu Vada, we ensure every meal feels like it was cooked in
            your own kitchen.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left Column - Chennai Map Image */}
          <div className="flex items-center justify-center">
            <div className="relative h-80 w-full overflow-hidden rounded-lg sm:h-96">
              <img
                src="https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80"
                alt="Authentic South Indian cuisine - Chennai local favorites"
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              {/* Fallback placeholder if image fails to load */}
              <div className="hidden h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-gradient-to-br from-accent to-accent/50 p-8">
                <div className="mb-4 rounded-full bg-primary/10 p-6">
                  <svg
                    className="h-12 w-12 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <p className="text-center text-3xl font-black tracking-widest text-primary sm:text-4xl">
                  CHENNAI
                </p>
                <p className="mt-3 text-sm font-medium text-muted-foreground">Proudly Local • Authentically Yours</p>
              </div>
            </div>
          </div>

          {/* Right Column - Trust Badges Grid */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {trustBadges.map((badge) => (
              <div
                key={badge.title}
                className="flex flex-col items-center rounded-lg border border-border bg-muted/50 p-5 text-center transition-all hover:shadow-md hover:border-border"
              >
                {/* Circular Orange Icon */}
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                  <badge.icon className="h-6 w-6 text-primary-foreground" />
                </div>

                {/* Badge Title */}
                <h3 className="mb-1 text-base font-bold text-foreground sm:text-lg">
                  {badge.title}
                </h3>

                {/* Badge Description */}
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
