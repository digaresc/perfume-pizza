import Link from "next/link";

const CALZONE = String.raw`
     _.-""""-._
   .'  o   o   '.
  /   (  __  )   \
 |  ~~ calzone ~~ |
  \_____________/
`;

export default function NotFound() {
  return (
    <main className="crm center">
      <section className="card">
        <pre>{CALZONE}</pre>
        <h1>404 — this page was folded into a calzone</h1>
        <Link href="/crm">Back to the CRM</Link>
      </section>
    </main>
  );
}
