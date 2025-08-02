import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Bot, FileText, Search, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Bot,
    title: "AI Text Detection",
    description: "Instantly identify AI-generated content with 99.8% accuracy using advanced machine learning algorithms.",
    highlights: ["GPT, Claude, Gemini detection", "Real-time analysis", "Detailed confidence scores"],
    link: "/ai-detection",
    color: "primary"
  },
  {
    icon: FileText,
    title: "Text Humanizer",
    description: "Transform robotic AI text into natural, human-like content that passes AI detectors.",
    highlights: ["Natural language processing", "Maintains original meaning", "Multiple writing styles"],
    link: "/humanizer",
    color: "secondary"
  },
  {
    icon: Search,
    title: "Plagiarism Checker",
    description: "Scan billions of web pages and academic papers to ensure your content is 100% original.",
    highlights: ["Comprehensive database", "Citation suggestions", "Similarity reporting"],
    link: "/plagiarism-checker",
    color: "success"
  }
];

export function Features() {
  return (
    <section className="py-20 bg-background" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Three Powerful Tools,{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              One Platform
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to ensure content authenticity, originality, and quality in one comprehensive suite.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-feature transition-all duration-300 border border-border/50 hover:border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 mx-auto ${
                  feature.color === 'primary' ? 'bg-primary/10 text-primary' :
                  feature.color === 'secondary' ? 'bg-secondary/10 text-secondary' :
                  'bg-success/10 text-success'
                }`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground mb-2">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {feature.highlights.map((highlight, highlightIndex) => (
                    <li key={highlightIndex} className="flex items-center text-sm text-muted-foreground">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        feature.color === 'primary' ? 'bg-primary' :
                        feature.color === 'secondary' ? 'bg-secondary' :
                        'bg-success'
                      }`}></div>
                      {highlight}
                    </li>
                  ))}
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full group-hover:border-primary/50 transition-colors" 
                  asChild
                >
                  <Link to={feature.link}>
                    Try Now
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button variant="hero" size="lg" asChild>
            <Link to="/dashboard">
              Get All Tools Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}