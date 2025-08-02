import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
import axios from "../api/axios";

// Define the schema using Zod
const SignInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Infer the type from the schema
type SignInData = z.infer<typeof SignInSchema>;

const GoogleIcon = FcGoogle as unknown as React.FC<{ className?: string }>;

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", result.access);
        localStorage.setItem("refresh_token", result.refresh);

        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });

        navigate("/");
      } else {
        toast({
          title: "Login Failed",
          description: result.error || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Server Error",
        description: "Unable to connect to the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
  const accessToken = localStorage.getItem("access_token");

  if (accessToken) {
    try {
      await axios.get("/user/profile"); // or a token validation endpoint
      // Token is valid, redirect to dashboard
      navigate("/dashboard");
      return;
    } catch (error) {
      // Token invalid or expired — fallback to Google login
      console.log("Access token invalid, redirecting to Google login");
    }
  }

  // No valid token found, redirect to Google OAuth
  window.location.href = "http://localhost:8000/accounts/google/login/";
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
            <Button type="submit" className="w-full" disabled={isLoading}>
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
              Don’t have an account?{" "}
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
