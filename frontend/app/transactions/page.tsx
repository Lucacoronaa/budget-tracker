"use client";

import { useEffect, useState } from "react";
import { API_URL } from "../lib/api";
import { useRouter } from "next/navigation";

type Transaction = {
  id: number;
  user_id: number;
  sub_category_id: number | null;
  title: string;
  description: string | null;
  amount: number | string;
  transaction_type: "expense" | "income";
  transaction_date: string;
  created_at: string;
  updated_at: string;
  sub_category_name: string | null;
  macro_category_name: string | null;
};

type TransactionsResponse = {
  ok: boolean;
  data: Transaction[];
};

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function TransactionsPage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadTransactions() {
        const token = localStorage.getItem("access_token");

        if (!token) {
        setIsLoading(false);
        router.push("/login");
        return;
        }

        try {
        const response = await fetch(`${API_URL}/transactions/`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("access_token");
            setIsLoading(false);
            router.push("/login");
            return;
            }

            throw new Error("Errore nel caricamento dei movimenti");
        }

        const data: TransactionsResponse = await response.json();
        setTransactions(data.data);
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

    loadTransactions();
    }, [router]);
    
  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-slate-300">
          Caricamento movimenti...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-6">
      <section className="mx-auto w-full max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="mb-4 text-sm font-medium text-slate-400 transition hover:text-emerald-400"
            >
              ← Torna alla dashboard
            </button>

            <p className="text-sm text-emerald-400">Movimenti</p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Le tue transazioni
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Consulta entrate e uscite registrate nel tuo tracker.
            </p>
          </div>

          <button
            onClick={() => router.push("/transactions/new")}
            className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            + Aggiungi movimento
          </button>
        </header>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {transactions.length === 0 ? (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-2xl text-emerald-400">
              €
            </div>

            <h2 className="text-xl font-semibold">
              Nessun movimento registrato
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
              Appena registrerai una nuova entrata o uscita, la troverai qui.
            </p>

            <button
              onClick={() => router.push("/transactions/new")}
              className="mt-6 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Aggiungi il primo movimento
            </button>
          </section>
        ) : (
          <section className="space-y-3">
            {transactions.map((transaction) => {
              const isIncome = transaction.transaction_type === "income";

              return (
                <article
                  key={transaction.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/[0.07]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-base font-semibold text-slate-100">
                          {transaction.title}
                        </h2>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            isIncome
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-red-500/15 text-red-300"
                          }`}
                        >
                          {isIncome ? "Entrata" : "Uscita"}
                        </span>
                      </div>

                      {transaction.description && (
                        <p className="mt-2 text-sm text-slate-400">
                          {transaction.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                        <span className="rounded-full bg-slate-900 px-3 py-1">
                          {transaction.macro_category_name || "Senza macro"}
                        </span>

                        <span className="rounded-full bg-slate-900 px-3 py-1">
                          {transaction.sub_category_name || "Senza categoria"}
                        </span>

                        <span className="rounded-full bg-slate-900 px-3 py-1">
                          {formatDate(transaction.transaction_date)}
                        </span>
                      </div>
                    </div>

                    <p
                      className={`shrink-0 text-right text-lg font-bold ${
                        isIncome ? "text-emerald-400" : "text-red-300"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </section>
    </main>
  );
}