import React from "react";
import LoginForm from "@/components/auth/login-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";



const LoginPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session && session.user) return redirect("/dashboard");

  return <LoginForm />;
};

export default LoginPage;
