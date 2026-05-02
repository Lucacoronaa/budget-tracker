"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "../lib/api";

type User = {
  id: number;
  email: string;
};

type Summary = {
  total_income: number;
  total_expense: number;
  balance: number;
  total_transactions: number;
};

type MeResponse = {
  ok: boolean;
  user: User;
};

type SummaryResponse = {
  ok: boolean;
  data: Summary;
};

function formatCurrency(value: number | string) {
  const numericValue = Number(value);

  const formattedValue = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(Math.abs(numericValue));

  if (numericValue < 0) {
    return `- ${formattedValue}`;
  }

  return formattedValue;
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setIsLoading(false);
        router.push("/login");
        return;
      }

      try {
        const meResponse = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!meResponse.ok) {
          localStorage.removeItem("access_token");
          setIsLoading(false);
          router.push("/login");
          return;
        }

        const meData: MeResponse = await meResponse.json();
        setUser(meData.user);

        const summaryResponse = await fetch(`${API_URL}/dashboard/summary`, 
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!summaryResponse.ok) {
          throw new Error("Errore nel caricamento della dashboard");
        }

        const summaryData: SummaryResponse = await summaryResponse.json();
        setSummary(summaryData.data);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Errore imprevisto");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    router.push("/login");
  }
  const balanceValue = Number(summary?.balance ?? 0);
    const isBalanceNegative = balanceValue < 0;
    const isBalancePositive = balanceValue > 0;


  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-slate-300">
          Caricamento dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-6">
      <section className="mx-auto w-full max-w-5xl">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-emerald-400">Bentornato</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {user?.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            Logout
          </button>
        </header>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        <section
            className={`mb-6 rounded-3xl border p-6 shadow-2xl ${
                isBalanceNegative
                ? "border-red-400/20 bg-red-500/10"
                : isBalancePositive
                ? "border-emerald-400/20 bg-emerald-400/10"
                : "border-white/10 bg-white/5"
            }`}
        >
            <p
                className={`text-sm ${
                isBalanceNegative
                    ? "text-red-300"
                    : isBalancePositive
                    ? "text-emerald-300"
                    : "text-slate-300"
                }`}
            >
                Saldo attuale
            </p>

            <h2
                className={`mt-3 text-4xl font-bold tracking-tight ${
                isBalanceNegative
                    ? "text-red-200"
                    : isBalancePositive
                    ? "text-white"
                    : "text-slate-100"
                }`}
            >
                {formatCurrency(balanceValue)}
            </h2>

            <p className="mt-3 text-sm text-slate-300">
                Calcolato su tutte le entrate e uscite registrate.
            </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Entrate</p>
            <p className="mt-3 text-2xl font-semibold text-emerald-400">
              {formatCurrency(summary?.total_income ?? 0)}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Uscite</p>
            <p className="mt-3 text-2xl font-semibold text-red-300">
              {formatCurrency(summary?.total_expense ?? 0)}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Movimenti</p>
            <p className="mt-3 text-2xl font-semibold text-slate-100">
              {summary?.total_transactions ?? 0}
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <button
            onClick={() => router.push("/transactions/new")}
            className="rounded-3xl bg-emerald-500 px-5 py-4 text-left text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            + Aggiungi movimento
            <span className="mt-1 block text-xs font-normal text-slate-800">
              Registra una nuova entrata o uscita
            </span>
          </button>

          <button
            onClick={() => router.push("/transactions")}
            className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-left text-sm font-semibold text-slate-100 transition hover:bg-white/10"
          >
            Vedi movimenti
            <span className="mt-1 block text-xs font-normal text-slate-400">
              Consulta la lista delle transazioni
            </span>
          </button>
        </section>
      </section>
    </main>
  );
}