import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-16">
      <h1 className="font-display text-3xl text-paper-100">Choose a new password</h1>
      <div className="mt-8">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
