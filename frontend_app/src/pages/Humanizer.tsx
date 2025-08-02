import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Header } from "../components/landing/Header";
import { Footer } from "../components/landing/Footer";
import { FileText, Upload, Download, Zap, RefreshCw, Copy } from "lucide-react";
import { toast } from "sonner";


export default function Humanizer() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [error, setError] = useState("");

  const handleHumanize = async () => {
    if (!inputText.trim()) return;

    setIsHumanizing(true);
    setOutputText("");
    setError("");

    try {
      const response = await fetch("http://localhost:8000/api/humanize/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: inputText })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Something went wrong.");
      }

      const data = await response.json();
      setOutputText(data.modified_text || "No output received.");
    } catch (err) {
      console.error("Humanization Error:", err);
      setError("⚠️ Failed to humanize the text. Please try again.");
    } finally {
      setIsHumanizing(false);
    }
  };

const handleCopy = () => {
  if (!inputText.trim()) return;
  navigator.clipboard.writeText(inputText);
  toast.success("Text copied to clipboard!");
};

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-subtle">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/10 rounded-2xl mb-6">
              <FileText className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Text Humanizer
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform AI-generated text into natural, human-like content that passes AI detectors while maintaining meaning.
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
                      AI-Generated Text
                    </CardTitle>
                    <CardDescription>
                      Paste your AI-generated text that needs humanization
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">


                    <Textarea
                      placeholder="Paste your AI-generated text here for humanization..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[400px] resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {inputText.length} / 3000 characters
                      </span>
                      <Button
                        onClick={handleHumanize}
                        disabled={!inputText.trim() || isHumanizing}
                        variant="hero"
                      >
                        {isHumanizing ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Humanizing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Humanize Text
                          </>
                        )}
                      </Button>
                    </div>
                    {error && <p className="text-sm text-red-500 pt-2">{error}</p>}
                  </CardContent>
                </Card>

                {/* Output Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Humanized Text
                    </CardTitle>
                    <CardDescription>
                      Natural, human-like version of your content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!outputText && !isHumanizing ? (
                      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                        <div className="text-center">
                          <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                          <p>Enter text to see humanized results</p>
                        </div>
                      </div>
                    ) : isHumanizing ? (
                      <div className="space-y-4 h-[350px] flex items-center justify-center">
                        <div className="text-center w-full">
                          <div className="text-lg font-semibold mb-4">Humanizing your text...</div>
                          <Progress value={60} className="w-full mb-4" />
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p>✓ Analyzing AI patterns</p>
                            <p>✓ Applying natural language transformations</p>
                            <p>→ Optimizing readability...</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="secondary" className="bg-success/10 text-success">
                            Successfully Humanized
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            {outputText.length} characters
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-subtle rounded-lg border min-h-[250px]">
                          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                            {outputText}
                          </p>
                        </div>

                        <div className="flex gap-2">
  <Button variant="outline" className="flex-1" onClick={handleCopy}>
    <Copy className="w-4 h-4 mr-2" />
    Copy Text
  </Button>
  <Button variant="outline" className="flex-1" onClick={() => alert("Coming soon!")}>
    <Download className="w-4 h-4 mr-2" />
    Download
  </Button>
</div>

                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Advanced Humanization Features
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Sophisticated algorithms that understand context and meaning to create authentic human text.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Meaning Preservation</h3>
                <p className="text-sm text-muted-foreground">
                  Maintains original intent while improving natural flow
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Multiple Styles</h3>
                <p className="text-sm text-muted-foreground">
                  Choose from academic, creative, professional writing styles
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="w-6 h-6 text-success" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">AI-Proof Output</h3>
                <p className="text-sm text-muted-foreground">
                  Passes AI detection tools while sounding completely natural
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
