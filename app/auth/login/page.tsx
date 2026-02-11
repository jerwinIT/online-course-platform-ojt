import { LoginForm } from "@/components/contents/login-form";

interface LoginPageProps {
  searchParams: {
    callbackUrl?: string;
    registered?: string;
    error?: string;
  };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const callbackUrl = searchParams.callbackUrl ?? "/dashboard";
  const registered = searchParams.registered === "1";
  const urlError = searchParams.error ?? "";

  return (
    <LoginForm
      callbackUrl={callbackUrl}
      registered={registered}
      urlError={urlError}
    />
  );
}
