import { Card, CardContent } from "@/components/ui/card";
import { Sprout, Users, TrendingUp, Heart, Target, Eye } from "lucide-react";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-20 px-4">
        <div className="container mx-auto text-center animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Connecting farmers directly with consumers, eliminating middlemen, and ensuring fair prices for everyone.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="border-2 hover:shadow-strong transition-all animate-fade-in">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-full bg-gradient-hero flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To create a transparent marketplace that empowers farmers with fair prices and provides consumers with fresh, quality produce while eliminating exploitative middlemen from the agricultural supply chain.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-strong transition-all animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-full bg-gradient-hero flex items-center justify-center mb-4">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To revolutionize Indian agriculture by building a nationwide direct-to-consumer platform that ensures sustainable farming practices, fair trade, and food security for all communities.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Story */}
          <div className="mb-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
            <Card className="border-2">
              <CardContent className="p-8">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Founded in 2024, our platform emerged from witnessing the struggles of local farmers who worked tirelessly but received minimal compensation due to multiple intermediaries. We recognized that while consumers paid high prices, farmers barely earned enough to sustain their families.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Today, we're proud to connect over 100 farmers with 500+ happy consumers, facilitating fair trade worth ₹10L+ and growing every day. Our platform isn't just a marketplace—it's a movement towards agricultural justice and food security.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Core Values */}
          <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <h2 className="text-3xl font-bold mb-8 text-center">Our Core Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center hover:shadow-medium transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold mb-2">Fairness</h3>
                  <p className="text-sm text-muted-foreground">Fair prices for farmers and consumers alike</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-medium transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold mb-2">Community</h3>
                  <p className="text-sm text-muted-foreground">Building strong farmer-consumer relationships</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-medium transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center mx-auto mb-4">
                    <Sprout className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold mb-2">Sustainability</h3>
                  <p className="text-sm text-muted-foreground">Promoting eco-friendly farming practices</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-medium transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold mb-2">Growth</h3>
                  <p className="text-sm text-muted-foreground">Empowering farmers to scale their business</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
