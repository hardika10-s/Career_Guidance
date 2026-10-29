import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.js";
import { useToast } from "../context/ToastContext.js";
import { Card } from "../components/ui/Card.js";
import { Input } from "../components/ui/Input.js";
import { Button } from "../components/ui/Button.js";
import { ThemeToggle } from "../components/ui/ThemeToggle.js";
import { Compass, User, Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

export const RegisterPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { register } = useAuth();
  const toast = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Please complete all required fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const user = await register({ name, email, password, confirmPassword });
      toast.success(`Account registered! Welcome to the framework, ${user.name}.`);
      onNavigate("/onboarding");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
      toast.error(err.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="register-page" className="max-w-md mx-auto py-8 sm:py-10 px-3 sm:px-4">
      <Card variant="default" className="p-4 sm:p-8 space-y-5 sm:space-y-6">
        <div className="flex justify-end">
          <ThemeToggle size="sm" showLabel />
        </div>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Create Student Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set up your persistent profile to analyze readiness and build your career roadmap.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="register-name"
            label="Full Name"
            placeholder="e.g. Alex Chen"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            id="register-email"
            label="Email Address"
            type="email"
            placeholder="e.g. alex.chen@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            id="register-password"
            label="Create Password (min 8 characters)"
            isPassword
            placeholder="Create secure password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Input
            id="register-confirm-password"
            label="Confirm Password"
            isPassword
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            id="register-submit-btn"
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Account & Continue
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <button
              type="button"
              id="switch-to-login-btn"
              onClick={() => onNavigate("/login")}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};
