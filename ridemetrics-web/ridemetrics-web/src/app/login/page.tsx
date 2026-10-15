
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Activity, ArrowLeft, LoaderCircle } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Email ou palavra-passe incorretos.");
                return;
            }

            router.push("/dashboard");
            router.refresh();
        } catch {
            setError("Não foi possível iniciar sessão. Tenta novamente.");
        } finally {
            setLoading(false);
        }
    }

    const inputClass =
        "w-full rounded-xl border border-white/15 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-lime-300";

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#0b1220] px-5 py-12 text-white">
            <div className="w-full max-w-md">
                <Link
                    href="/"
                    className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
                >
                    <ArrowLeft size={16} /> Back to home
                </Link>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-9">
                    <Link href="/" className="mb-8 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-300 text-slate-950">
              <Activity size={24} />
            </span>
                        <span className="text-xl font-bold">RideMetrics</span>
                    </Link>

                    <h1 className="text-3xl font-bold">Welcome back</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        Sign in to access your cycling data.
                    </p>

                    {searchParams.get("registered") === "1" && (
                        <p className="mt-5 rounded-xl border border-lime-300/20 bg-lime-300/10 p-3 text-sm text-lime-200">
                            Account created successfully. You can now sign in.
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm text-slate-300">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                maxLength={254}
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className={inputClass}
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm text-slate-300">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className={inputClass}
                                placeholder="Your password"
                            />
                        </div>

                        {error && (
                            <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading && <LoaderCircle className="animate-spin" size={18} />}
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-400">
                        Don't have an account?{" "}
                        <Link href="/register" className="font-semibold text-lime-300 hover:text-lime-200">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
