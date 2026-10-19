
"use client";

import { FormEvent, useState } from "react";
import { CarFront, Mail, LockKeyhole, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
          },
        });

        if (error) throw error;

        if (data.session) {
          setMessage("Account created! Opening GoCab...");
        } else {
          setMessage(
            "Account created. Check your email to confirm your account, then log in."
          );
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        // The parent component detects the authenticated session.
      }
    } catch (error: unknown) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl md:grid-cols-2">
        <section className="flex flex-col justify-center bg-indigo-600 p-8 text-white md:p-12">
          <div className="mb-10 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600">
              <CarFront size={30} />
            </span>
            <span className="text-3xl font-black">
              GoCab
            </span>
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-indigo-200">
            Your journey starts here
          </p>

          <h1 className="text-4xl font-black leading-tight md:text-5xl">
            Every ride,
            <br />
            made simpler.
          </h1>

          <p className="mt-5 max-w-sm leading-7 text-indigo-100">
            Book your cab, compare estimated fares, and
            discover convenient routes with GoCab.
          </p>

          <div className="mt-10 flex items-center gap-3 text-sm text-indigo-100">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
              <LockKeyhole size={19} />
            </span>
            Secure account access powered by Supabase
          </div>
        </section>

        <section className="p-7 md:p-12">
          <div className="mb-8">
            <p className="text-sm font-semibold text-indigo-600">
              WELCOME TO GOCAB
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-900">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {mode === "signup"
                ? "Sign up to access your cab booking dashboard."
                : "Log in to continue to your cab booking dashboard."}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setMessage("");
              }}
              className={`rounded-lg py-3 text-sm font-bold ${
                mode === "signup"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Sign up
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
              className={`rounded-lg py-3 text-sm font-bold ${
                mode === "login"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Log in
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-4 text-slate-400"
                />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 py-3.5 pl-11 pr-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-4 text-slate-400"
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={
                    mode === "signup"
                      ? "new-password"
                      : "current-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-200 py-3.5 pl-11 pr-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Use at least 6 characters.
              </p>
            </div>

            {message && (
              <p
                aria-live="polite"
                className="rounded-xl bg-indigo-50 p-3 text-sm leading-6 text-indigo-700"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : mode === "signup"
                  ? "Create account"
                  : "Log in to GoCab"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
            By continuing, you agree to use GoCab responsibly.
          </p>
        </section>
      </div>
    </main>
  );
}
