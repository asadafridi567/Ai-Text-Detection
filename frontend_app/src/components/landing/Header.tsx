import { useState,useEffect } from "react";
import { Button } from "../ui/button";
import { Menu, X,ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const handleSignOut = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  setIsLoggedIn(false);
  window.location.href = "/"; // optional redirect to home
};


useEffect(() => {
  const accessToken = localStorage.getItem("access_token");
  const googleToken = localStorage.getItem("google_token"); // or whatever you store

  // If either exists, mark user as logged in
  setIsLoggedIn(!!accessToken || !!googleToken);
}, []);


  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Z</span>
          </div>
          <span className="text-xl font-bold text-foreground">ZeroPlagiarism</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
      <div
        className="relative"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none">
          Features
          <ChevronDown className="w-4 h-4 mt-[1px]" />
        </button>

        <div
          className={`absolute top-full mt-2 w-48 bg-white border border-border rounded-md shadow-md z-50 transition-all duration-200 ${
            open ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <a
            href="/ai-detection"
            className="block px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            AI Detection
          </a>
          <a
            href="/humanizer"
            className="block px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Humanize Text
          </a>
          <a
            href="/plagiarism-checker"
            className="block px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Plagiarism Checker
          </a>
        </div>
      </div>

          <Link to="/blogs" className="text-muted-foreground hover:text-foreground transition-colors">
            Blogs
          </Link>
          <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
  {!isLoggedIn ? (
    <Button variant="ghost" asChild>
      <Link to="/sign-in">Sign In</Link>
    </Button>
  ) : (
    <Button variant="ghost" onClick={handleSignOut}>
      Sign Out
    </Button>
  )}
  <Button variant="hero" asChild>
    <Link to="/dashboard">Get Started</Link>
  </Button>
</div>
        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <nav className="container mx-auto px-4 py-4 space-y-4">
          <div>
        <button
          onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
          className="w-full flex justify-between items-center text-muted-foreground hover:text-foreground transition-colors py-1 "
        >
          Features
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isFeaturesOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isFeaturesOpen && (
          <div className="pl-4 space-y-1">
            <Link
              to="/ai-detection"
              className="block text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              AI Detection
            </Link>
            <Link
              to="/humanize-text"
              className="block text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Humanize Text
            </Link>
            <Link
              to="/plagiarism-checker"
              className="block text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Plagiarism Checker
            </Link>
          </div>
        )}
      </div>
            <Link
              to="/blogs"
              className="block text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Blogs
            </Link>
            <Link
              to="/about"
              className="block text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="pt-4 space-y-2">
              {!isLoggedIn ? (
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/sign-in" onClick={() => setIsMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              )}
              <Button variant="hero" className="w-full" asChild>
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>

          </nav>
        </div>
      )}
    </header>
  );
}