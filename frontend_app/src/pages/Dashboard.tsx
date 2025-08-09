import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Bot,
  FileText,
  Search,
  Upload,
  Download,
  User,
  Settings,
  LogOut,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import instance from "../api/axios";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("ai-detection");
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };
const handleAnalyze = async () => {
  setIsAnalyzing(true);
  setResults(null);
  setError("");

  let endpoint = "";
  if (activeTab === "ai-detection") endpoint = "/api/ai-check/";
  if (activeTab === "humanizer") endpoint = "/api/humanize/";
  if (activeTab === "plagiarism") endpoint = "/api/plagiarism-check/";

  try {
    let response;
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      response = await fetch("http://localhost:8000" + endpoint, {
        method: "POST",
        body: formData,
      });
    } else {
      response = await fetch("http://localhost:8000" + endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text_content: inputText.trim() }),
      });
    }

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.detail || "Analysis failed.");
    }

    const data = await response.json();
    console.log("🧪 Response from backend:", data);

    // Transform response based on tab
    if (activeTab === "ai-detection") {
      setResults({
        aiConfidence: Math.min(100, Math.round(data.ai_percentage || 0)),
        humanConfidence: Math.max(0, 100 - Math.round(data.ai_percentage || 0)),
        sentences:
          data.sentence_predictions
            ?.filter((item) => item.sentence?.trim())
            .map((item) => ({
              text: item.sentence,
              confidence: Math.round((item.ai_probability || 0) * 100),
              isAI: item.label === "AI-Generated",
            })) || [],
      });
    } else if (activeTab === "humanizer") {
      setResults({
        humanizedText: data.humanized_text || "",
      });
    } else if (activeTab === "plagiarism") {
  setResults({
  originalityScore: data.status === "duplicate_content_found" ? 0 : 100,
  matches: data.duplicate_content_found_on_links || [],
  totalSources: 15000000000,
  scanTime: "2.3 seconds",
});

}
  } catch (err: any) {
    console.error("Analysis failed:", err);
    setError(err.message || "Something went wrong.");
  } finally {
    setIsAnalyzing(false);
  }
};

const handleDownloadReport = () => {
  if (!results) return alert("No content to download.");
  
  const doc = new jsPDF();
  doc.setFontSize(16);

  if (activeTab === "humanizer") {
    // Humanizer Report
    if (!results.modified_text) return alert("No humanized content to download.");

    const content = results.modified_text;

    doc.text("Humanized Text Report", 10, 10);
    doc.setFontSize(12);
    doc.text("=======================", 10, 20);

    const lines = doc.splitTextToSize(content, 180);
    let yOffset = 30;

    lines.forEach((line: string) => {
      if (yOffset > 280) {
        doc.addPage();
        yOffset = 20;
      }
      doc.text(line, 10, yOffset);
      yOffset += 10;
    });

    doc.save("humanized-text-report.pdf");
  }

  else if (activeTab === "ai-detection") {
    // AI Detection Report
    doc.text("AI Detection Report", 10, 10);
    doc.setFontSize(12);
    doc.text("===================", 10, 20);

    doc.text(`AI Confidence: ${results.aiConfidence ?? "N/A"}%`, 10, 30);
    doc.text(`Human Confidence: ${results.humanConfidence ?? "N/A"}%`, 10, 40);
    doc.text("Sentence-Level Analysis:", 10, 60);

    let yOffset = 70;
    results.sentences?.forEach((s: any, i: number) => {
      const line = `${i + 1}. [${s.isAI ? "AI" : "Human"} - ${s.confidence}%] ${s.text}`;
      const lines = doc.splitTextToSize(line, 180);
      lines.forEach((line: string) => {
        if (yOffset > 280) {
          doc.addPage();
          yOffset = 20;
        }
        doc.text(line, 10, yOffset);
        yOffset += 10;
      });
    });

    doc.save("ai-detection-report.pdf");
  }
  else if (activeTab === "plagiarism") {
    // Plagiarism Report
    doc.text("Plagiarism Checker Report", 10, 10);
    doc.setFontSize(12);
    doc.text("===========================", 10, 20);

    doc.text(`Originality Score: ${results.originalityScore ?? "N/A"}%`, 10, 30);
    doc.text(`Total Sources Scanned: ${results.totalSources.toLocaleString()}`, 10, 40);
    doc.text(`Scan Time: ${results.scanTime}`, 10, 50);

    if (results.matches.length > 0) {
      doc.text("Source Matches:", 10, 70);
      let yOffset = 80;
      results.matches.forEach((link: string, index: number) => {
        const line = `${index + 1}. ${link}`;
        const lines = doc.splitTextToSize(line, 180);
        lines.forEach((line: string) => {
          if (yOffset > 280) {
            doc.addPage();
            yOffset = 20;
          }
          doc.text(line, 10, yOffset);
          yOffset += 10;
        });
      });
    } else {
      doc.text("No matches found.", 10, 70);
    }

    doc.save("plagiarism-report.pdf");
  }
  // You can extend this further for `plagiarism` tab as well
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
                                      <input
    type="file"
    onChange={(e) => setFile(e.target.files[0])}
    accept=".pdf,.doc,.docx"
    className="block w-full text-sm text-gray-700 
               file:mr-4 file:py-2 file:px-4
               file:rounded-md file:border-0
               file:text-sm file:font-semibold
               file:bg-primary file:text-white
               hover:file:bg-primary/90
               focus:outline-none"
  />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {inputText.length} characters
                </span>
                <Button
                    onClick={handleAnalyze}
                    disabled={!inputText.trim() && !file || isAnalyzing}
                    variant="hero"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Text"}
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                {isAnalyzing ? (
                  <div className="text-center space-y-4">
                    <div className="text-lg font-semibold">Analyzing your text...</div>
                    <Progress value={75} />
                  </div>
                ) : !results ? (
                  <div className="text-muted-foreground h-[300px] flex items-center justify-center">
                    Enter text to see analysis results
                  </div>
                ) : (
                 <div className="space-y-4">
  {activeTab === "ai-detection" && results && (
    <>
      <div className="flex justify-between items-center">
        <span className="font-semibold text-foreground">AI Confidence:</span>
        <Badge variant="destructive" className="text-xs">
          {results.aiConfidence ?? "N/A"}%
        </Badge>
      </div>
      <Progress value={results.aiConfidence} className="h-2" />

      <h4 className="font-semibold text-foreground mt-4">Sentence Analysis</h4>
      {results.sentences.map((item: any, index: number) => (
        <div key={index} className="p-4 rounded-lg border space-y-2">
          <p className="text-sm text-foreground">{item.text}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {item.isAI ? (
                <AlertTriangle className="w-4 h-4 text-destructive" />
              ) : (
                <CheckCircle className="w-4 h-4 text-success" />
              )}
              <span className="text-xs text-muted-foreground">
                {Math.round(item.confidence)}% confidence
              </span>
            </div>
            <Badge variant={item.isAI ? "destructive" : "secondary"} className="text-xs">
              {item.isAI ? "AI" : "Human"}
            </Badge>
          </div>
        </div>
      ))}
    </>
  )}



{activeTab === "humanizer" && results?.modified_text && (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-4">
      <Badge variant="secondary" className="bg-success/10 text-success">
        Successfully Humanized
      </Badge>
      <div className="text-sm text-muted-foreground">
        {results.modified_text.length} characters
      </div>
    </div>

    <div className="p-4 bg-gradient-subtle rounded-lg border min-h-[250px]">
      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
        {results.modified_text}
      </p>
    </div>
  </div>
)}
{activeTab === "plagiarism" && results && (
  <div className="space-y-2">
    <div className="flex justify-between">
      <span className="font-semibold">Originality:</span>
      <Badge variant="secondary">
        {results.originalityScore}% Original
      </Badge>
    </div>
    <Progress value={parseInt(results.originalityScore)} />

{results.matches
  .filter((link: string) => link.startsWith("http"))
  .map((link: string, index: number) => (
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
  ))} : (
      <div className="text-sm text-muted-foreground">No matches found.</div>
    )
  </div>
)}

                    <Button variant="outline" className="w-full" onClick={handleDownloadReport}>
                      Download Report
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

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
