import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";
import { Card } from "../components/ui/Card.js";
import { Input } from "../components/ui/Input.js";
import { Button } from "../components/ui/Button.js";
import { ThemeToggle } from "../components/ui/ThemeToggle.js";
import { Compass, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

export const LoginPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { login, register } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const user = await login({ email, password });
      toast.success(`Welcome back, ${user.name}!`);
      if (user.isOnboarded) {
        onNavigate("/dashboard");
      } else {
        onNavigate("/onboarding");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
      toast.error(err.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail("alex.chen@university.edu");
    setPassword("StudentPass123!");
    setIsLoading(true);
    setError(null);
    try {
      // First try login, if fails, register demo user
      try {
        const user = await login({ email: "alex.chen@university.edu", password: "StudentPass123!" });
        toast.success(`Demo student signed in: ${user.name}`);
        onNavigate(user.isOnboarded ? "/dashboard" : "/onboarding");
      } catch (loginErr: any) {
        // Fallback: If demo user does not exist in DB, create it
        const newUser = await register({
          name: "Alex Chen",
          email: "alex.chen@university.edu",
          password: "StudentPass123!",
          confirmPassword: "StudentPass123!",
        });
        toast.success(`Demo account created for Alex Chen!`);
        onNavigate("/onboarding");
      }
    } catch (err: any) {
      setError("Demo login error: " + err.message);
      toast.error(err.message || "Demo login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="login-page" className="max-w-md mx-auto py-8 sm:py-12 px-3 sm:px-4">
      <Card variant="default" className="p-4 sm:p-8 space-y-5 sm:space-y-6">
        <div className="flex justify-end">
          <ThemeToggle size="sm" showLabel />
        </div>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Sign In to Your Framework
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access your career roadmap, verified skill evidence, and mock interview arena.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="login-email"
            label="University or Personal Email"
            type="email"
            placeholder="e.g. alex.chen@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            id="login-password"
            label="Password"
            isPassword
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            id="login-submit-btn"
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Or Quick Demo
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        <Button
          id="demo-login-btn"
          type="button"
          variant="outline"
          size="md"
          className="w-full text-xs"
          onClick={handleDemoLogin}
          isLoading={isLoading}
          leftIcon={<Sparkles className="w-4 h-4 text-blue-600" />}
        >
          Quick Launch with Demo Student Account
        </Button>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Don't have an account yet?{" "}
            <button
              type="button"
              id="switch-to-register-btn"
              onClick={() => onNavigate("/register")}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              Create Account
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};
