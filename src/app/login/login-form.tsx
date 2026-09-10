"use client";

import { useActionState, useState } from "react";
import { signInWithPassword, signUpWithPassword, signInWithGoogle, type AuthActionState } from "@/app/auth/actions";

const initialState: AuthActionState = { error: null, message: null };

export function LoginForm() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [signInState, signInAction, signInPending] = useActionState(signInWithPassword, initialState);
  const [signUpState, signUpAction, signUpPending] = useActionState(signUpWithPassword, initialState);

  const action = mode === "sign-in" ? signInAction : signUpAction;
  const state = mode === "sign-in" ? signInState : signUpState;
  const pending = mode === "sign-in" ? signInPending : signUpPending;

  return (
    <div className="w-full max-w-[380px] rounded-2xl border border-border bg-surface p-6 shadow-card">
      <h1 className="text-center text-xl font-bold text-text-1">Rechatta</h1>
      <p className="mt-1 text-center text-[13px] text-text-2">
        {mode === "sign-in" ? "Sign in to continue" : "Create an account"}
      </p>

      {state.message ? (
        <div className="mt-6 rounded-xl bg-surface-inset px-3.5 py-3 text-[13px] text-text-1">{state.message}</div>
      ) : (
        <form action={action} className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            name="email"
            required
            placeholder="Email"
            className="w-full rounded-xl border border-border bg-surface-inset px-3 py-2.5 text-[13px] text-text-1 outline-none placeholder:text-text-3 focus:border-border-soft"
          />
          <input
            type="password"
            name="password"
            required
            minLength={6}
            placeholder="Password"
            className="w-full rounded-xl border border-border bg-surface-inset px-3 py-2.5 text-[13px] text-text-1 outline-none placeholder:text-text-3 focus:border-border-soft"
          />
          {state.error && <p className="text-[12.5px] text-red-500">{state.error}</p>}
          <button type="submit" className="cta-pill mt-1" disabled={pending}>
            <span className="cta-label">
              {pending ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Sign up"}
            </span>
          </button>
        </form>
      )}

      {!state.message && (
        <form action={signInWithGoogle} className="mt-2.5">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2.5 text-[13px] font-semibold text-text-1 hover:bg-surface-hover"
          >
            Continue with Google
          </button>
        </form>
      )}

      <button
        type="button"
        className="mt-4 w-full text-center text-[12.5px] font-semibold text-text-2 hover:text-text-1"
        onClick={() => setMode((m) => (m === "sign-in" ? "sign-up" : "sign-in"))}
      >
        {mode === "sign-in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
