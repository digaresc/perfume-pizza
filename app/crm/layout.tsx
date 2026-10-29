import Link from "next/link";
import { logout } from "../login/actions";

export default function CrmLayout({ children }: LayoutProps<"/crm">) {
  return (
    <div className="crm">
      <nav className="crm-nav">
        <strong>🍕 Pizza-Perfume CRM</strong>
        <Link href="/crm">Customers</Link>
        <Link href="/crm/products">Products</Link>
        <Link href="/">🐎 Hippodrome</Link>
        <form action={logout}>
          <button className="link">Log out</button>
        </form>
      </nav>
      <main>{children}</main>
      <footer className="crm-footer">
        <span>🍕 Pizza-Perfume Store · Via del Profumo 5, Napoli</span>
        <span>Open daily 11:00–23:00 · Smell responsibly</span>
      </footer>
    </div>
  );
}
