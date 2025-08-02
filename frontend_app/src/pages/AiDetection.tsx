import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Header } from "../components/landing/Header";
import { Footer } from "../components/landing/Footer";
import { Bot, Upload, Download, AlertTriangle, CheckCircle } from "lucide-react";

export default function AIDetection() {
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setResults(null);
    setError("");

    try {
  const response = await fetch("http://localhost:8000/api/ai-check/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text_content: inputText.trim() })
  });

  console.log("Raw fetch response:", response);

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.detail || "Failed to analyze text.");
  }

  let data;
  try {
    data = await response.json();
    console.log("Parsed API Response:", data);
  } catch (err) {
    console.error("Detection error:", err);
    setError("⚠️ Failed to detect the text. Please try again.");
  }

setResults({
  aiConfidence: Math.min(100, Math.round(data.ai_percentage || 0)),
  humanConfidence: Math.max(0, 100 - Math.round(data.ai_percentage || 0)),
  sentences: data.sentence_predictions
    ?.filter((item: any) => item.sentence?.trim())
    .map((item: any) => ({
      text: item.sentence,
      confidence: Math.round((item.ai_probability || 0) * 100),
      isAI: item.label === "AI-Generated",
    })) || [],
});

} catch (err: any) {
  console.error("AI Detection Error:", err);
  setError(err.message || "Something went wrong while analyzing text.");
} finally {
  setIsAnalyzing(false);
}
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-subtle">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              AI Text Detection
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Detect AI-generated content with 99.8% accuracy using state-of-the-art machine learning algorithms.
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
                      Input Text
                    </CardTitle>
                    <CardDescription>
                      Paste your text below for AI detection analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Paste the text you want to analyze for AI generation..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[400px] resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {inputText.length} / 5000 characters
                      </span>
                      <Button 
                        onClick={handleAnalyze}
                        disabled={!inputText.trim() || isAnalyzing}
                        variant="hero"
                      >
                        {isAnalyzing ? "Analyzing..." : "Detect AI Content"}
                      </Button>
                    </div>
                    {error && (
                      <p className="text-red-500 text-sm mt-2">{error}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Results Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Detection Results
                    </CardTitle>
                    <CardDescription>
                      AI detection confidence and detailed analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!results && !isAnalyzing ? (
                      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                        <div className="text-center">
                          <Bot className="w-12 h-12 mx-auto mb-4 opacity-30" />
                          <p>Enter text to see AI detection results</p>
                        </div>
                      </div>
                    ) : isAnalyzing ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold mb-2">Analyzing text for AI patterns...</div>
                          <Progress value={75} className="w-full" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Overall Score */}
                        <div className="text-center p-6 bg-gradient-subtle rounded-lg border">
                          <div className="text-3xl font-bold text-foreground mb-2">
                            {results.aiConfidence}%
                          </div>
                          <Badge variant={results.aiConfidence > 70 ? "destructive" : "secondary"} className="mb-2">
                            {results.aiConfidence > 70 ? "Likely AI Generated" : "Likely Human Written"}
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            AI Detection Confidence
                          </p>
                        </div>

                        {/* Breakdown */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-foreground">Sentence Analysis</h4>
                          {results.sentences.map((sentence: any, index: number) => (
                            <div key={index} className="p-4 rounded-lg border space-y-2">
                              <p className="text-sm text-foreground">{sentence.text}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {sentence.isAI ? (
                                    <AlertTriangle className="w-4 h-4 text-destructive" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4 text-success" />
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {sentence.confidence}% confidence
                                  </span>
                                </div>
                                <Badge variant={sentence.isAI ? "destructive" : "secondary"} className="text-xs">
                                  {sentence.isAI ? "AI" : "Human"}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>

                        <Button variant="outline" className="w-full">
                          Download Detailed Report
                        </Button>
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
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Why Choose Our AI Detection?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Advanced algorithms trained on the latest AI models for maximum accuracy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">99.8% Accuracy</h3>
                <p className="text-sm text-muted-foreground">
                  Industry-leading detection rates across all major AI models
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Real-time Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Get instant results with detailed confidence scores
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Download className="w-6 h-6 text-success" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Detailed Reports</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive analysis with sentence-level breakdowns
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
