"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Mail, Lock, ArrowRight } from "lucide-react";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  Callback:
    "Sign-in with Google failed. Check that NEXTAUTH_URL is set (e.g. http://localhost:3000), NEXTAUTH_SECRET is set, and in Google Cloud Console the redirect URI is exactly: http://localhost:3000/api/auth/callback/google",
  OAuthCallback:
    "Sign-in with Google failed. The sign-in session may have expired or cookies were blocked. Try again.",
  OAuthAccountNotLinked:
    "This email is already used with another sign-in method. Sign in with the method you used when you registered.",
  Default: "Sign-in failed. Please try again or use email and password.",
};

interface LoginFormProps {
  callbackUrl: string;
  registered: boolean;
  urlError: string;
}

export function LoginForm({
  callbackUrl,
  registered,
  urlError,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const displayError =
    error ||
    (urlError
      ? (OAUTH_ERROR_MESSAGES[urlError] ?? OAUTH_ERROR_MESSAGES.Default)
      : "");

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        setError("Invalid email or password.");
        return;
      }
      if (res?.url) {
        window.location.href = res.url;
        return;
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoogleSignIn() {
    setError("");
    signIn("google", { callbackUrl });
  }

  return (
    <div className="h-[calc(100vh-4rem)] min-h-0 flex items-center justify-center overflow-y-auto px-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 font-bold text-2xl text-foreground"
        >
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          LearnHub
        </Link>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue learning
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form className="space-y-4" onSubmit={handleCredentialsSubmit}>
              {registered && (
                <p className="text-sm text-green-600 dark:text-green-400 bg-green-500/10 rounded-md px-3 py-2">
                  Account created. Sign in with your email and password.
                </p>
              )}
              {displayError && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                  {displayError}
                </p>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Signing in…" : "Sign In"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              Google
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
