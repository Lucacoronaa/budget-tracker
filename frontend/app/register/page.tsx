"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "../lib/api";

type RegisterResponse = {
  ok?: boolean;
  message?: string;
  detail?: string;
  user_id?: number;
};

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (password.length < 6) {
      setErrorMessage("La password deve contenere almeno 6 caratteri.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Le password non coincidono.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data: RegisterResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || "Errore durante la registrazione");
      }

      setSuccessMessage("Account creato correttamente. Ora puoi effettuare il login.");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Errore imprevisto durante la registrazione.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <section className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 text-2xl font-bold">
            €
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Crea account
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Registrati per iniziare a gestire entrate, uscite e saldo personale.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="nome@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Crea una password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Conferma password
              </label>

              <input
                id="confirmPassword"
                type="password"
                placeholder="Ripeti la password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
            </div>

            {errorMessage && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Creazione account..." : "Registrati"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Hai già un account?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="font-medium text-emerald-400 transition hover:text-emerald-300"
            >
              Accedi
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}