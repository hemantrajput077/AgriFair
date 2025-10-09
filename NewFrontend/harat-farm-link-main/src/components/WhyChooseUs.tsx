import { Card } from "@/components/ui/card";
import { Shield, TrendingUp, Heart, Leaf } from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "100% Transparent",
    description: "Every transaction is tracked. Know exactly where your produce comes from and where your money goes.",
    stat: "0% Hidden Charges",
  },
  {
    icon: TrendingUp,
    title: "Fair Pricing",
    description: "Farmers get better prices, consumers pay less. Cutting middlemen means everyone wins.",
    stat: "30% Better Prices",
  },
  {
    icon: Heart,
    title: "Support Local",
    description: "Directly support Indian farmers and their families. Build sustainable rural economies.",
    stat: "100+ Families Helped",
  },
  {
    icon: Leaf,
    title: "Fresh & Organic",
    description: "Choose from conventional or organic produce. Farm-to-table freshness guaranteed.",
    stat: "24hr Freshness",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-20 px-4 bg-gradient-accent">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Why Choose Us?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Building a fairer, more transparent agricultural marketplace for everyone
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={benefit.title}
                className="group relative overflow-hidden hover:shadow-strong transition-all duration-500 text-center p-8 space-y-4 animate-scale-in bg-card border-none"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Icon */}
                <div className="mx-auto w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <Icon className="w-8 h-8 text-primary-foreground" />
                </div>

                {/* Stat */}
                <div className="text-3xl font-bold text-primary">
                  {benefit.stat}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-foreground">
                  {benefit.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>

                {/* Decorative element */}
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
              </Card>
            );
          })}
        </div>

        {/* CTA Box */}
        <div className="mt-16 text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <Card className="bg-gradient-hero p-12 border-none shadow-strong">
            <div className="max-w-2xl mx-auto space-y-6">
              <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground">
                Ready to Make a Difference?
              </h3>
              <p className="text-lg text-primary-foreground/90">
                Join thousands of farmers and consumers building a fairer marketplace together.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
