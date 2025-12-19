import { Card } from "@/components/ui/card";
import { ShoppingCart, FileText, Wrench, Sparkles } from "lucide-react";

const features = [
  {
    icon: ShoppingCart,
    title: "Direct Buy from Farmers",
    description: "Get fresh produce directly from farms without middlemen inflating prices. Quality assured, fair pricing.",
    color: "bg-gradient-hero",
  },
  {
    icon: FileText,
    title: "Contract Farming",
    description: "Hire farmers to grow specific crops for you. Choose organic or conventional farming methods tailored to your needs.",
    color: "bg-gradient-warm",
  },
  {
    icon: Wrench,
    title: "Tool & Land Renting",
    description: "Rent tractors, irrigation systems, or farmland. Modern farming equipment at affordable rates for better productivity.",
    color: "bg-gradient-accent",
  },
  {
    icon: Sparkles,
    title: "More Features Coming Soon",
    description: "We're constantly innovating to bring you better solutions. Stay tuned for exciting new features.",
    color: "bg-gradient-hero",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            What We Offer
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Empowering farmers and consumers with transparent, fair, and efficient solutions
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group relative overflow-hidden hover:shadow-strong transition-all duration-500 cursor-pointer animate-scale-in border-none"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-8 space-y-4">
                  {/* Icon with gradient background */}
                  <div className={`w-16 h-16 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white drop-shadow-md" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover Effect Border */}
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary group-hover:w-full transition-all duration-500" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
