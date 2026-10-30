"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginForm({ next }: { next: string }) {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="card login">
      <h1>🍕 Pizza-Perfume CRM</h1>
      <p className="muted">Staff only. Smell responsibly.</p>
      <p className="local-note">🗄️ CRM data is stored locally in this browser.</p>
      <input type="hidden" name="next" value={next} />
      <label>
        User
        <input name="user" autoComplete="username" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {error && <p className="error">{error}</p>}
      <button disabled={pending}>{pending ? "Sniffing…" : "Log in"}</button>
    </form>
  );
}
