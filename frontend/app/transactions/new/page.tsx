"use client";

import { useEffect, useMemo, useState } from "react";
import { API_URL } from "../../lib/api";
import { useRouter } from "next/navigation";

type MacroCategory = {
  id: number;
  name: string;
  type: "expense" | "income";
  is_active: boolean;
  sort_order: number;
  icon_name?: string | null;
};

type SubCategory = {
  id: number;
  macro_category_id: number;
  name: string;
  is_active: boolean;
  sort_order: number;
};

type MacroCategoriesResponse = {
  ok: boolean;
  data: MacroCategory[];
};

type SubCategoriesResponse = {
  ok: boolean;
  data: SubCategory[];
};

type TransactionType = "expense" | "income";

export default function NewTransactionPage() {
  const router = useRouter();

  const [transactionType, setTransactionType] =
    useState<TransactionType>("expense");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [macroCategoryId, setMacroCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");

  const [macroCategories, setMacroCategories] = useState<MacroCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredMacroCategories = useMemo(() => {
    return macroCategories.filter(
      (category) => category.type === transactionType
    );
  }, [macroCategories, transactionType]);

  useEffect(() => {
    async function loadCategories() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setIsLoading(false);
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/categories/macro`);

        if (!response.ok) {
          throw new Error("Errore nel caricamento delle macro categorie");
        }

        const data: MacroCategoriesResponse = await response.json();
        setMacroCategories(data.data);
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

    loadCategories();
  }, [router]);

  useEffect(() => {
    async function loadSubCategories() {
      if (!macroCategoryId) {
        setSubCategories([]);
        setSubCategoryId("");
        return;
      }

      try {
        const response = await fetch
            (`${API_URL}/categories/sub?macro_category_id=${macroCategoryId}`);

        if (!response.ok) {
          throw new Error("Errore nel caricamento delle sottocategorie");
        }

        const data: SubCategoriesResponse = await response.json();
        setSubCategories(data.data);
        setSubCategoryId("");
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Errore imprevisto");
        }
      }
    }

    loadSubCategories();
  }, [macroCategoryId]);

  function resetCategorySelection() {
    setMacroCategoryId("");
    setSubCategoryId("");
    setSubCategories([]);
  }

  function handleTypeChange(type: TransactionType) {
    setTransactionType(type);
    resetCategorySelection();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    setErrorMessage("");
    setIsSaving(true);

    try {
      if (!title.trim()) {
        throw new Error("Inserisci un titolo");
      }

      if (!amount || Number(amount) <= 0) {
        throw new Error("Inserisci un importo valido");
      }

      if (!transactionDate) {
        throw new Error("Inserisci una data");
      }

      const response = await fetch(`${API_URL}/transactions/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sub_category_id: subCategoryId ? Number(subCategoryId) : null,
          title: title.trim(),
          description: description.trim() || null,
          amount: Number(amount),
          transaction_type: transactionType,
          transaction_date: transactionDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Errore nel salvataggio del movimento");
      }

      router.push("/transactions");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Errore imprevisto");
      }
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-slate-300">
          Caricamento categorie...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-6">
      <section className="mx-auto w-full max-w-3xl">
        <header className="mb-8">
          <button
            onClick={() => router.push("/transactions")}
            className="mb-4 text-sm font-medium text-slate-400 transition hover:text-emerald-400"
          >
            ← Torna ai movimenti
          </button>

          <p className="text-sm text-emerald-400">Nuovo movimento</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Aggiungi transazione
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Registra una nuova entrata o uscita nel tuo tracker finanziario.
          </p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Tipo movimento
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleTypeChange("expense")}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    transactionType === "expense"
                      ? "bg-red-500/20 text-red-200 ring-1 ring-red-400/40"
                      : "bg-slate-900 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  Uscita
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange("income")}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    transactionType === "income"
                      ? "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40"
                      : "bg-slate-900 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  Entrata
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Titolo
              </label>

              <input
                id="title"
                type="text"
                placeholder="Es. Spesa Lidl"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Descrizione
              </label>

              <input
                id="description"
                type="text"
                placeholder="Opzionale"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="amount"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Importo
                </label>

                <input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                />
              </div>

              <div>
                <label
                  htmlFor="transactionDate"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Data
                </label>

                <input
                  id="transactionDate"
                  type="date"
                  value={transactionDate}
                  onChange={(event) => setTransactionDate(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="macroCategory"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Macro categoria
                </label>

                <select
                  id="macroCategory"
                  value={macroCategoryId}
                  onChange={(event) => setMacroCategoryId(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                >
                  <option value="">Seleziona macro</option>

                  {filteredMacroCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="subCategory"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Sottocategoria
                </label>

                <select
                  id="subCategory"
                  value={subCategoryId}
                  onChange={(event) => setSubCategoryId(event.target.value)}
                  disabled={!macroCategoryId}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition disabled:cursor-not-allowed disabled:opacity-50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                >
                  <option value="">
                    {macroCategoryId
                      ? "Seleziona sottocategoria"
                      : "Prima scegli una macro"}
                  </option>

                  {subCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/transactions")}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                Annulla
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Salvataggio..." : "Salva movimento"}
              </button>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}