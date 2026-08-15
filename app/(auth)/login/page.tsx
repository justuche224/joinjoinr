import React from "react";
import LoginForm from "@/components/auth/login-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface LoginPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
}

const LoginPage = async ({ searchParams }: LoginPageProps) => {
  const { callbackUrl } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });

  if (session && session.user) {
    return redirect(callbackUrl || "/dashboard");
  }

  return <LoginForm callbackUrl={callbackUrl} />;
};

export default LoginPage;
