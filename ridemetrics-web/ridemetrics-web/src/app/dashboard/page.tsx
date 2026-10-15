
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
            <div className="mx-auto max-w-5xl">
                <header className="flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold">
                        RideMetrics
                    </Link>

                    <form
                        action={async () => {
                            "use server";
                            await signOut({ redirectTo: "/" });
                        }}
                    >
                        <button
                            type="submit"
                            className="rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800"
                        >
                            Sign out
                        </button>
                    </form>
                </header>

                <section className="mt-16">
                    <h1 className="text-3xl font-bold">
                        Welcome{session.user.name ? `, ${session.user.name}` : ""}
                    </h1>

                    <p className="mt-3 text-slate-400">
                        Your cycling performance, all in one place.
                    </p>

                    <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
                        <h2 className="text-xl font-semibold">Your activities</h2>
                        <p className="mt-2 text-slate-400">
                            Your cycling activities will appear here.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
