import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Github, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <span className="text-xl font-bold">ZeroPlagiarism</span>
            </div>
            <p className="text-background/70 mb-6 leading-relaxed">
              The complete solution for content authenticity. Detect AI text, humanize content, and check for plagiarism with enterprise-grade accuracy.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-background/70 hover:text-background transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-background/70 hover:text-background transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-background/70 hover:text-background transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-background/70 hover:text-background transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-background mb-4">Products</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/ai-detection" className="text-background/70 hover:text-background transition-colors">
                  AI Text Detection
                </Link>
              </li>
              <li>
                <Link to="/humanizer" className="text-background/70 hover:text-background transition-colors">
                  Text Humanizer
                </Link>
              </li>
              <li>
                <Link to="/plagiarism-checker" className="text-background/70 hover:text-background transition-colors">
                  Plagiarism Checker
                </Link>
              </li>
              <li>
                <Link to="/api" className="text-background/70 hover:text-background transition-colors">
                  API Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-background mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-background/70 hover:text-background transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-background/70 hover:text-background transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-background/70 hover:text-background transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-background/70 hover:text-background transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-background mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-background/70 hover:text-background transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/documentation" className="text-background/70 hover:text-background transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-background/70 hover:text-background transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <a href="mailto:support@zeroplagiarism.com" className="text-background/70 hover:text-background transition-colors flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-background/70 text-sm mb-4 md:mb-0">
            © 2024 ZeroPlagiarism. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-sm">
            <Link to="/privacy" className="text-background/70 hover:text-background transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-background/70 hover:text-background transition-colors">
              Terms of Service
            </Link>
            <Link to="/security" className="text-background/70 hover:text-background transition-colors">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}