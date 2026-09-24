"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button, FormField, Input } from "@/components/ui/shared";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please provide your registered email address.");
      return;
    }
    setLoading(true);
    // Simulate password reset email trigger
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Password reset instructions sent!");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand */}
        <div className="flex justify-center items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
            +
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">EKSU</p>
            <p className="text-base font-bold text-slate-900 leading-none">University Health Center</p>
          </div>
        </div>

        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Check Your Email</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                If an account exists with <strong className="text-slate-800">{email}</strong>, you will receive password reset instructions shortly.
              </p>
              <div className="pt-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="w-full">
                    <ArrowLeft size={14} className="mr-1.5" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Forgot Password</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your university email address and we will send you a password reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField label="Email address" required>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <Input
                      type="email"
                      required
                      placeholder="student@eksu.edu.ng or staff@eksu.edu.ng"
                      className="pl-9 text-xs"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </FormField>

                <Button type="submit" variant="primary" className="w-full text-xs" loading={loading}>
                  Send Reset Link
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  <ArrowLeft size={13} />
                  Return to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
