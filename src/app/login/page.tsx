import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Log in" };

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-16">
      <h1 className="font-display text-3xl text-paper-100">Welcome back</h1>
      <p className="mt-2 text-sm text-paper-100/60">Log in to continue building your Brain Profile.</p>
      <div className="mt-8">
        <LoginForm next={next ?? "/dashboard"} />
      </div>
    </div>
  );
}
