import { redirect } from "next/navigation";
import ResetPasswordClient from "./reset-password-client";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/forgot-password");
  }

  return <ResetPasswordClient token={token} />;
}
