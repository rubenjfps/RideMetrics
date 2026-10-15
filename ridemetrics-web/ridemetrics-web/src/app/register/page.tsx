
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Activity, ArrowLeft, LoaderCircle } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("As palavras-passe não coincidem.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error ?? "Não foi possível criar a conta.");
                return;
            }

            router.push("/login?registered=1");
        } catch {
            setError("Não foi possível contactar o servidor. Tenta novamente.");
        } finally {
            setLoading(false);
        }
    }

    const inputClass =
        "w-full rounded-xl border border-white/15 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-lime-300";

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#0b1220] px-5 py-12 text-white">
            <div className="w-full max-w-md">
                <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
                    <ArrowLeft size={16} /> Voltar à página inicial
                </Link>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-9">
                    <Link href="/" className="mb-8 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-300 text-slate-950">
              <Activity size={24} />
            </span>
                        <span className="text-xl font-bold">RideMetrics</span>
                    </Link>

                    <h1 className="text-3xl font-bold">Cria a tua conta</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        Começa a explorar os teus dados de ciclismo.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div>
                            <label htmlFor="name" className="mb-2 block text-sm text-slate-300">Nome</label>
                            <input
                                id="name"
                                name="name"
                                autoComplete="name"
                                required
                                minLength={2}
                                maxLength={80}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={inputClass}
                                placeholder="O teu nome"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm text-slate-300">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                maxLength={254}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputClass}
                                placeholder="tu@exemplo.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm text-slate-300">Palavra-passe</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={10}
                                maxLength={128}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputClass}
                                placeholder="Pelo menos 10 caracteres"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="mb-2 block text-sm text-slate-300">Confirmar palavra-passe</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={10}
                                maxLength={128}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={inputClass}
                                placeholder="Repete a palavra-passe"
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
                            {loading ? "A criar conta..." : "Criar conta"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-400">
                        Já tens conta?{" "}
                        <Link href="/login" className="font-semibold text-lime-300 hover:text-lime-200">
                            Entrar
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
