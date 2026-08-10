import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Header } from "../components/landing/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../hooks/use-toast";
import { Mail, MapPin } from "lucide-react";

const ContactSchema = z.object({
  name: z.string().min(1, { message: "Please enter your name" }),
  email: z.string().email({ message: "Invalid email address" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});
type ContactData = z.infer<typeof ContactSchema>;

const ContactUs = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactData>({
    resolver: zodResolver(ContactSchema),
  });

  // Intentionally does NOT call the backend. This page is static — the form
  // is validated client-side only, and submission just confirms receipt in
  // the UI. Wire this up to a real endpoint (or a third-party form service)
  // if/when you want messages to actually be delivered somewhere.
  const onSubmit = (data: ContactData) => {
    setIsSubmitted(true);
    toast({
      title: "Message received",
      description: "Thanks for reaching out — we'll get back to you soon.",
    });
    reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-28 pb-16 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Contact Us
          </h1>
          <p className="text-muted-foreground text-lg">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Email</p>
                  <p className="text-sm text-muted-foreground">
                    support@zeroplagiarism.example
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Location</p>
                  <p className="text-sm text-muted-foreground">
                    Remote-first team
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            {isSubmitted ? (
              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <p className="text-foreground font-medium mb-1">
                  Message sent
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Thanks for reaching out &mdash; we'll respond as soon as we
                  can.
                </p>
                <Button variant="ghost" onClick={() => setIsSubmitted(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    placeholder="How can we help?"
                    {...register("message")}
                  />
                  {errors.message && (
                    <p className="text-sm text-red-500">{errors.message.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactUs;