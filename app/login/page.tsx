import LoginForm from "./LoginForm";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return (
    <main className="crm center">
      <LoginForm next={typeof next === "string" ? next : "/crm"} />
    </main>
  );
}
