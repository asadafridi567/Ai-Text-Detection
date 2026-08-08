import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useToast } from "../hooks/use-toast";
import { FcGoogle } from "react-icons/fc";
import axios, { API_BASE_URL } from "../api/axios";

const GoogleIcon = FcGoogle as unknown as React.FC<{ className?: string }>;

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email, password } = formData;

    // Basic client-side validation
    if (!name || !email || !password) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out all fields.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Shared axios instance instead of a raw fetch + a locally hardcoded
      // API_BASE_URL, so this inherits baseURL, timeout, and interceptors
      // from one place instead of drifting out of sync with other pages.
      const res = await axios.post("/register/", { name, email, password });

      toast({
        title: "Account Created",
        description: "Please check your email to verify your account.",
      });
      navigate("/email-verification", { replace: true });
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;

      if (axiosError.response) {
        // Backend responded but rejected the signup (e.g. email taken,
        // weak password, validation error)
        const data = axiosError.response.data;
        toast({
          variant: "destructive",
          title: "Signup Failed",
          description: data?.error || JSON.stringify(data),
        });
      } else {
        // No response at all — backend unreachable, wrong URL, CORS, timeout
        toast({
          variant: "destructive",
          title: "Server Error",
          description: "Something went wrong. Please try again later.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    // API_BASE_URL comes from the shared axios config (env-driven), not a
    // hardcoded Codespaces URL that only works in this one environment.
    window.location.href = `${API_BASE_URL}/accounts/google/login/`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-white p-4">
      <Card className="w-full max-w-md border border-white/30 shadow-xl rounded-3xl backdrop-blur-md bg-white/80">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-foreground">
            Create an Account
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Join <span className="text-primary font-medium">ZeroPlagiarism</span> to ensure academic integrity
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleSignUp}
            >
              <GoogleIcon className="text-lg" />
              Sign Up with Google
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link to="/sign-in" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SignUp;