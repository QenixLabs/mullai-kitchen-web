import { FaBuilding, FaClipboardList, FaCalendarAlt, FaHeadset } from "react-icons/fa";

const FEATURES = [
  {
    icon: FaClipboardList,
    title: "Scalable meal programs",
    description:
      "Order for 10 or 1000 employees with flexible configurations.",
  },
  {
    icon: FaBuilding,
    title: "Postpaid billing",
    description:
      "Pay after delivery. Proforma invoices generated upfront, final invoices adjusted for changes.",
  },
  {
    icon: FaCalendarAlt,
    title: "Flexible scheduling",
    description:
      "Choose delivery days, meal types, and duration. Modify orders as needs change.",
  },
  {
    icon: FaHeadset,
    title: "Dedicated support",
    description:
      "Priority support and account management for corporate clients.",
  },
];

export function CorporateHighlights() {
  return (
    <div className="space-y-10">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-white/20 backdrop-blur-sm">
          <FaBuilding className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Mullai Kitchen Corporate</h3>
          <p className="text-sm text-white/80">
            Bulk meal solutions for modern workplaces
          </p>
        </div>
      </div>

      {/* Value Proposition */}
      <div>
        <p className="text-lg leading-relaxed text-white/95">
          Simplify workplace meals with our corporate bulk ordering platform.
          Fresh, home-style dishes delivered daily to your office with flexible
          scheduling and transparent postpaid billing.
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
                <p className="mt-0.5 text-sm leading-relaxed text-white/80">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
