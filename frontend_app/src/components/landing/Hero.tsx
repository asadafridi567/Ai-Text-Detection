import { Button } from "../ui/button";
import { ArrowRight, Shield, Zap, Target } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "../../assets/hero-image.jpg"; // Adjust the path as necessary


export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-subtle"></div>
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>
    
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-border rounded-full px-4 py-2 mb-8">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Trusted by 50,000+ professionals</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Detect AI Text,{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Humanize Content
            </span>
            {" "}& Check Plagiarism
          </h1>

          {/* Subtext */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            The complete solution for content authenticity. Detect AI-generated text, 
            transform robotic writing into human-like content, and ensure originality 
            with our advanced plagiarism detection.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button variant="hero" size="lg" className="min-w-[200px]" asChild>
              <Link to="/dashboard">
                Try Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="min-w-[200px]" asChild>
                <a href="#features">Explore Features</a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-primary mr-2" />
                <span className="text-2xl font-bold text-foreground">99.8%</span>
              </div>
              <p className="text-sm text-muted-foreground">Detection Accuracy</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-6 h-6 text-secondary mr-2" />
                <span className="text-2xl font-bold text-foreground">50K+</span>
              </div>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-success mr-2" />
                <span className="text-2xl font-bold text-foreground">4.9★</span>
              </div>
              <p className="text-sm text-muted-foreground">User Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}