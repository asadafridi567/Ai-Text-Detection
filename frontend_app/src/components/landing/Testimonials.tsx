import { Card, CardContent } from "../ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Sarah Chen",
    role: "Professor, Stanford University",
    avatar: "SC",
    content: "ZeroPlagiarism has revolutionized how we handle academic integrity. The AI detection is incredibly accurate, and it's become an essential tool for our department.",
    rating: 5
  },
  {
    name: "Mark Rodriguez",
    role: "Content Manager, TechCorp",
    avatar: "MR",
    content: "The humanizer tool is a game-changer. It transforms our AI-generated drafts into content that feels genuinely human while maintaining all the key information.",
    rating: 5
  },
  {
    name: "Emily Thompson",
    role: "Freelance Writer",
    avatar: "ET",
    content: "I use ZeroPlagiarism daily to ensure my work is original and authentic. The plagiarism checker is thorough, and the interface is incredibly user-friendly.",
    rating: 5
  },
  {
    name: "Prof. David Kim",
    role: "Research Director, MIT",
    avatar: "DK",
    content: "The most comprehensive text analysis platform I've used. All three tools work seamlessly together, saving us hours of manual verification work.",
    rating: 5
  },
  {
    name: "Lisa Anderson",
    role: "Marketing Director",
    avatar: "LA",
    content: "ZeroPlagiarism gives us confidence in our content strategy. We can quickly verify authenticity and improve quality before publishing anything.",
    rating: 5
  },
  {
    name: "James Wilson",
    role: "Graduate Student",
    avatar: "JW",
    content: "Perfect for academic work. Helped me ensure my thesis was completely original and properly cited. The detailed reports are incredibly helpful.",
    rating: 5
  }
];

export function Testimonials() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Trusted by{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See what educators, writers, and professionals say about ZeroPlagiarism.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="group hover:shadow-feature transition-all duration-300 border border-border/50 hover:border-primary/20">
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-primary/20 mb-4" />
                
                {/* Content */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 bg-gradient-subtle rounded-2xl px-8 py-6 border border-border/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1">4.9★</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1">50,000+</div>
              <div className="text-sm text-muted-foreground">Happy Users</div>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1">1M+</div>
              <div className="text-sm text-muted-foreground">Texts Analyzed</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}