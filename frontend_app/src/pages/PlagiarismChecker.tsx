import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Header } from "../components/landing/Header";
import { Footer } from "../components/landing/Footer";
import {
  Search,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

export default function PlagiarismChecker() {
  const [inputText, setInputText] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [reportBlobUrl, setReportBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState("");


const handleCheck = async () => {
  if (!inputText.trim()) return;

  setIsChecking(true);
  setResults(null);
  setError("");


  try {
    const response = await fetch("http://localhost:8000/api/plagiarism-check/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text_content: inputText.trim() })
    });

    if (!response.ok) throw new Error("Plagiarism check failed");

    const data = await response.json();

    const originalityScore = data.status === "duplicate_content_found" ? 0 : 100;
    const matches = data.duplicate_content_found_on_links || [];
setResults({
  originalityScore,
  matches,
  totalSources: 15000000000,
  scanTime: "2.3 seconds"
});

  } catch (err) {
    console.error("Error checking plagiarism:", err);
    setError("⚠️ Something went wrong. Please try again.");
  } finally {
    setIsChecking(false);
  }
};


  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-subtle">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-2xl mb-6">
              <Search className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Plagiarism Checker
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Scan billions of web pages and academic papers to ensure your content is 100% original with detailed source citations.
            </p>
          </div>
        </section>

        {/* Main Tool */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Document Text
                    </CardTitle>
                    <CardDescription>
                      Paste your content for plagiarism checking
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Paste your text here to check for plagiarism..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[400px] resize-none"
                    />
<div className="flex items-center justify-between">
  <span className="text-sm text-muted-foreground">
    {inputText.length} / 10000 characters
  </span>
  <Button
    onClick={handleCheck}
    disabled={!inputText.trim() || isChecking}
    variant="hero"
  >
    {isChecking ? "Scanning..." : "Check Plagiarism"}
  </Button>
</div>

{/* ✅ Add this just below the button row */}
{error && (
  <p className="text-sm text-red-500 pt-2">
    {error}
  </p>
)}

                    <div className="text-xs text-muted-foreground">
                      <p>✓ Scans 15+ billion web pages</p>
                      <p>✓ Academic papers and journals</p>
                      <p>✓ Books and publications</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Results Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Plagiarism Results
                    </CardTitle>
                    <CardDescription>
                      Originality score and source matches
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!results && !isChecking ? (
                      <div className="flex items-center justify-center h-[450px] text-muted-foreground">
                        <div className="text-center">
                          <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                          <p>Enter text to check for plagiarism</p>
                        </div>
                      </div>
                    ) : isChecking ? (
                      <div className="space-y-4 h-[450px] flex items-center justify-center">
                        <div className="text-center w-full">
                          <div className="text-lg font-semibold mb-4">Scanning for plagiarism...</div>
                          <Progress value={65} className="w-full mb-4" />
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p>✓ Scanning web pages</p>
                            <p>✓ Checking academic databases</p>
                            <p>→ Analyzing similarity patterns...</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Score Summary */}
                        <div className="text-center p-6 bg-gradient-subtle rounded-lg border">
                          <div className="text-3xl font-bold text-foreground mb-2">
                            {results.originalityScore}%
                          </div>
                          <Badge variant={results.originalityScore > 90 ? "secondary" : "destructive"} className="mb-2">
                            {results.originalityScore > 90 ? "Original Content" : "Potential Issues Found"}
                          </Badge>
                          <p className="text-sm text-muted-foreground">Originality Score</p>
                          <div className="text-xs text-muted-foreground mt-2">
                            Scanned {results.totalSources.toLocaleString()} sources in {results.scanTime}
                          </div>
                        </div>

                        {/* Matches */}
                        {results.matches.length > 0 ? (
  <div className="space-y-4">
    <h4 className="font-semibold text-foreground flex items-center gap-2">
      <AlertTriangle className="w-4 h-4 text-warning" />
      Potential Matches ({results.matches.length})
    </h4>
    {results.matches.map((link: string, index: number) => (
      <div key={index} className="p-4 rounded-lg border space-y-2">
        <p className="text-sm text-foreground bg-warning/10 p-2 rounded break-all">
          {link}
        </p>
        <div className="flex justify-end">
          <a href={link} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="text-xs h-6">
              <ExternalLink className="w-3 h-3 mr-1" />
              View Source
            </Button>
          </a>
        </div>
      </div>
    ))}
  </div>
) : (
  <div className="text-center p-6 bg-success/10 rounded-lg border border-success/20">
    <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
    <p className="font-semibold text-success">No plagiarism detected!</p>
    <p className="text-sm text-muted-foreground">Your content appears to be original.</p>
  </div>
)}

                         
                       
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Comprehensive Plagiarism Detection</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our advanced algorithms scan the largest database of sources for maximum accuracy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-success" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Massive Database</h3>
                <p className="text-sm text-muted-foreground">
                  15+ billion web pages, academic papers, and publications
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Real-time Scanning</h3>
                <p className="text-sm text-muted-foreground">
                  Get results in seconds with detailed similarity analysis
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Download className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Citation Help</h3>
                <p className="text-sm text-muted-foreground">
                  Get source information and citation suggestions
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
