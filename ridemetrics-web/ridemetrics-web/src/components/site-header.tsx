
"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function SiteHeader() {
    const { data: session, status } = useSession();
    const isLoggedIn = status === "authenticated";

    return (
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-2xl font-bold text-white">
                RideMetrics
            </Link>

            <nav className="flex items-center gap-3">
                {status === "loading" ? null : isLoggedIn ? (
                    <>
                        <div className="hidden items-center gap-2 text-white sm:flex">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-5 w-5"
                                aria-hidden="true"
                            >
                                <circle cx="12" cy="8" r="4" />
                                <path d="M4 21a8 8 0 0 1 16 0" />
                            </svg>

                            <span>
                {session.user?.name || session.user?.email}
              </span>
                        </div>

                        <Link
                            href="/dashboard"
                            className="rounded-lg bg-lime-400 px-4 py-2 font-semibold text-slate-950 hover:bg-lime-300"
                        >
                            Dashboard
                        </Link>

                        <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: "/" })}
                            title="Sign out"
                            aria-label="Sign out"
                            className="rounded-lg border border-slate-700 p-2 text-white hover:bg-slate-800"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-5 w-5"
                                aria-hidden="true"
                            >
                                <path d="M10 17l5-5-5-5" />
                                <path d="M15 12H3" />
                                <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                            </svg>
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className="rounded-lg border border-slate-700 px-4 py-2 text-white hover:bg-slate-800"
                        >
                            Login
                        </Link>

                        <Link
                            href="/register"
                            className="rounded-lg bg-lime-400 px-4 py-2 font-semibold text-slate-950 hover:bg-lime-300"
                        >
                            Register
                        </Link>
                    </>
                )}
            </nav>
        </header>
    );
}
