import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-16">
      <h1 className="font-display text-3xl text-paper-100">Create your account</h1>
      <p className="mt-2 text-sm text-paper-100/60">Start building your Brain Profile in minutes.</p>
      <div className="mt-8">
        <SignupForm />
      </div>
    </div>
  );
}
