import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { FcGoogle } from "react-icons/fc";
import { useToast } from "../hooks/use-toast";
import axios, { API_BASE_URL } from "../api/axios";

const SignInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});
type SignInData = z.infer<typeof SignInSchema>;
const GoogleIcon = FcGoogle as unknown as React.FC<{ className?: string }>;

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // get redirect path or fallback to dashboard
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInData>({
    resolver: zodResolver(SignInSchema),
  });

  const onSubmit = async (data: SignInData) => {
    setIsLoading(true);

    try {
      // Use the shared axios instance instead of a raw fetch + a second
      // hardcoded API_BASE_URL. This ensures baseURL, timeout, and
      // interceptors are consistent everywhere in the app.
      const response = await axios.post("/login/", data);
      const result = response.data;

      localStorage.setItem("access_token", result.access);
      localStorage.setItem("refresh_token", result.refresh);

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      // redirect to the intended page
      navigate(redirectPath, { replace: true });
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; detail?: string }>;

      if (axiosError.response) {
        // Backend responded, but rejected the request (bad credentials, etc.)
        toast({
          title: "Login Failed",
          description:
            axiosError.response.data?.error ||
            axiosError.response.data?.detail ||
            "Invalid credentials",
          variant: "destructive",
        });
      } else {
        // No response at all — backend unreachable, wrong URL, CORS, timeout, etc.
        toast({
          title: "Server Error",
          description: "Unable to connect to the server. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
      try {
        await axios.get("/user/profile");
        navigate("/dashboard");
        return;
      } catch {
        console.log("Access token invalid, redirecting to Google login");
      }
    }

    // preserve redirect path for Google OAuth too.
    // API_BASE_URL comes from the shared axios config (env-driven), not a
    // hardcoded Codespaces URL that will break outside this one environment.
    window.location.href = `${API_BASE_URL}/accounts/google/login/?redirect=${encodeURIComponent(
      redirectPath
    )}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-white p-4">
      <Card className="w-full max-w-md border border-white/30 shadow-xl rounded-3xl backdrop-blur-md bg-white/80">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-bold text-foreground">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to your{" "}
            <span className="text-primary font-medium">ZeroPlagiarism</span>{" "}
            account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                data-testid="email-input"
                type="email"
                placeholder="e.g. jane.doe@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                data-testid="password-input"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" data-testid="sign-in-submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleSignIn}
            >
              <GoogleIcon className="text-lg" />
              Sign In with Google
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Don't have an account?{" "}
              <Link to="/sign-up" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SignIn;