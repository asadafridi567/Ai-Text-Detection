import { Upload, Scan, Download, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Text",
    description: "Paste or upload your content directly into our secure platform. Supports various file formats."
  },
  {
    icon: Scan,
    title: "AI Analysis",
    description: "Our advanced algorithms analyze your text for AI patterns, plagiarism, and quality metrics."
  },
  {
    icon: CheckCircle,
    title: "Get Results",
    description: "Receive detailed reports with confidence scores, suggestions, and highlighted sections."
  },
  {
    icon: Download,
    title: "Download & Use",
    description: "Export your improved content or reports in multiple formats ready for publication."
  }
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple, fast, and reliable. Get professional results in just a few clicks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              {/* Icon */}
              <div className="relative mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-2xl shadow-feature group-hover:shadow-elegant transition-all duration-300">
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                {/* Step Number */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>

              {/* Connector Line (hidden on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-secondary/50 transform translate-x-1/2"></div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            Ready to ensure your content is authentic and original?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-5 h-5 text-success" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-5 h-5 text-success" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-5 h-5 text-success" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}