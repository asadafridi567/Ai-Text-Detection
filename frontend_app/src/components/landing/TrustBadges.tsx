import { Shield, Lock, Award, Users } from "lucide-react";

const badges = [
  {
    icon: Shield,
    title: "SOC 2 Compliant",
    description: "Enterprise-grade security standards"
  },
  {
    icon: Lock,
    title: "GDPR Compliant",
    description: "Your data privacy is protected"
  },
  {
    icon: Award,
    title: "ISO 27001 Certified",
    description: "Information security management"
  },
  {
    icon: Users,
    title: "Trusted Globally",
    description: "Used in 150+ countries"
  }
];

export function TrustBadges() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Security & Trust
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your content and data are protected with enterprise-grade security and privacy standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {badges.map((badge, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-background rounded-2xl shadow-card mb-4 group-hover:shadow-feature transition-all duration-300">
                <badge.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                {badge.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {badge.description}
              </p>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}