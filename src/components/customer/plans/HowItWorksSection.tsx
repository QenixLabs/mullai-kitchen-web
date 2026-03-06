import { FaListAlt, FaUtensils, FaSmile, FaTools } from "react-icons/fa";

interface HowItWorksSectionProps {
  className?: string;
}

export function HowItWorksSection({ className = "" }: HowItWorksSectionProps) {
  const steps = [
    {
      number: 1,
      icon: FaListAlt,
      title: "Choose Your Plan",
      description:
        "Select from our Basic, Premium, or Executive plans based on your appetite and lifestyle.",
      color: "bg-indigo-500",
    },
    {
      number: 2,
      icon: FaTools,
      title: "Build Your Own Plan",
      description:
        "Create a personalized plan based on your convenience. Choose delivery days, meal timing, and portions that fit your schedule.",
      color: "bg-emerald-500",
    },
    {
      number: 3,
      icon: FaUtensils,
      title: "Customize Your Menu",
      description:
        "Browse our weekly menu and pick the meals that suit your taste preferences.",
      color: "bg-amber-500",
    },
    {
      number: 4,
      icon: FaSmile,
      title: "Enjoy Fresh Meals",
      description:
        "Sit back and relax as we deliver freshly prepared meals to your doorstep daily.",
      color: "bg-rose-500",
    },
  ];

  return (
    <section
      className={`w-full bg-white py-16 px-4 sm:px-6 lg:px-8 ${className}`}
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold leading-tight text-foreground">
            Simple, Healthy, & Consistent
          </h2>
          <p className="text-base text-muted-foreground">
            Skip the grocery shopping and cooking. We bring the taste of home
            to your doorstep every single day.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid items-stretch gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="flex h-full flex-col items-center text-center"
              >
                {/* Step Number and Icon */}
                <div className="mb-6 flex items-center justify-center">
                  <div className={`relative flex h-16 w-16 items-center justify-center rounded-full ${step.color}`}>
                    <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                  </div>
                </div>

                {/* Step Title */}
                <h3 className="mb-3 text-lg font-bold text-foreground">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="flex-grow text-base leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
