import { Button } from "@/components/ui/button";
import { ArrowRight, Sprout, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-farm.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/70 to-primary/60" />
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute top-20 left-10 animate-float opacity-20">
        <Sprout className="w-16 h-16 text-primary-foreground" />
      </div>
      <div className="absolute bottom-32 right-16 animate-float opacity-20" style={{ animationDelay: '1s' }}>
        <Sprout className="w-20 h-20 text-primary-foreground" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-md rounded-full px-6 py-2 text-primary-foreground animate-fade-in">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Connecting 100+ Farmers Across India</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground leading-tight animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Empowering Farmers,<br />
            <span className="bg-gradient-warm bg-clip-text text-transparent">Feeding Families</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Fair Prices, No Middlemen. Direct connection between farmers and consumers for a transparent marketplace.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Button 
              variant="hero-outline" 
              size="lg" 
              className="group"
              onClick={() => navigate('/equipment')}
            >
              Start Buying
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => navigate('/signup?role=farmer')}
            >
              Join as Farmer
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-foreground">100+</div>
              <div className="text-sm text-primary-foreground/80 mt-1">Active Farmers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-foreground">500+</div>
              <div className="text-sm text-primary-foreground/80 mt-1">Happy Consumers</div>
            </div>
            <div className="text-center col-span-2 md:col-span-1">
              <div className="text-4xl font-bold text-primary-foreground">₹10L+</div>
              <div className="text-sm text-primary-foreground/80 mt-1">Fair Trade Value</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-1.5 bg-primary-foreground/70 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
