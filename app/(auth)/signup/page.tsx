import React from "react";
import SignupForm from "@/components/auth/signup-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface SignupPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
}

const SignupPage = async ({ searchParams }: SignupPageProps) => {
  const { callbackUrl } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });

  if (session && session.user) {
    return redirect(callbackUrl || "/dashboard");
  }

  return <SignupForm callbackUrl={callbackUrl} />;
};

export default SignupPage;
