import { useState,useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Bot, FileText, Search, Upload, Download, User, Settings, LogOut } from "lucide-react";
import { Link,useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("ai-detection");
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Z</span>
          </div>
          <span className="text-xl font-bold text-foreground">ZeroPlagiarism</span>
        </div>

        <nav className="space-y-2">
          <Button
            variant={activeTab === "ai-detection" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("ai-detection")}
          >
            <Bot className="w-4 h-4 mr-3" />
            AI Detection
          </Button>
          <Button
            variant={activeTab === "humanizer" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("humanizer")}
          >
            <FileText className="w-4 h-4 mr-3" />
            Text Humanizer
          </Button>
          <Button
            variant={activeTab === "plagiarism" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("plagiarism")}
          >
            <Search className="w-4 h-4 mr-3" />
            Plagiarism Checker
          </Button>
        </nav>

        <div className="mt-8 pt-8 border-t border-border">
  <div className="space-y-2">
    {isLoggedIn && (
      <>
        <Button variant="ghost" className="w-full justify-start">
          <User className="w-4 h-4 mr-3" />
          Profile
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </>
    )}
  </div>
</div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {activeTab === "ai-detection" && "AI Text Detection"}
              {activeTab === "humanizer" && "Text Humanizer"}
              {activeTab === "plagiarism" && "Plagiarism Checker"}
            </h1>
            <p className="text-muted-foreground">
              {activeTab === "ai-detection" && "Detect AI-generated content with 99.8% accuracy"}
              {activeTab === "humanizer" && "Transform AI text into natural, human-like content"}
              {activeTab === "plagiarism" && "Check for plagiarism across billions of sources"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Input Text
                </CardTitle>
                <CardDescription>
                  Paste your text below or upload a file for analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your text here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[300px] resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {inputText.length} characters
                  </span>
                  <Button 
                    onClick={handleAnalyze}
                    disabled={!inputText.trim() || isAnalyzing}
                    variant="hero"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Text"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Analysis Results
                </CardTitle>
                <CardDescription>
                  {activeTab === "ai-detection" && "AI detection confidence and detailed breakdown"}
                  {activeTab === "humanizer" && "Humanized text with improved readability"}
                  {activeTab === "plagiarism" && "Originality score and source matches"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isAnalyzing && !inputText.trim() ? (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Enter text to see analysis results
                  </div>
                ) : isAnalyzing ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold mb-2">Analyzing your text...</div>
                      <Progress value={75} className="w-full" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Sample Results based on active tab */}
                    {activeTab === "ai-detection" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">AI Confidence:</span>
                          <Badge variant="destructive">87% AI Generated</Badge>
                        </div>
                        <Progress value={87} className="w-full" />
                        <div className="text-sm text-muted-foreground">
                          High likelihood of AI generation detected. Review highlighted sections for specific patterns.
                        </div>
                      </div>
                    )}

                    {activeTab === "humanizer" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Humanization:</span>
                          <Badge variant="secondary">Completed</Badge>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm">
                            Your text has been successfully humanized while maintaining the original meaning and key information.
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab === "plagiarism" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Originality:</span>
                          <Badge variant="secondary">92% Original</Badge>
                        </div>
                        <Progress value={92} className="w-full" />
                        <div className="text-sm text-muted-foreground">
                          2 potential matches found. Review sources for proper citation.
                        </div>
                      </div>
                    )}

                    <Button variant="outline" className="w-full">
                      Download Report
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Texts Analyzed Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">12</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Credits Remaining
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">488</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-foreground">Pro</span>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/pricing">Upgrade</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}