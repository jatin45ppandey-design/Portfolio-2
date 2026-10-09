import { GitBranch } from "lucide-react";

import { signIn } from "@/auth";

type StudioLoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  if (error === "AccessDenied") {
    return "This GitHub account is not authorized for Portfolio Studio.";
  }

  if (error?.startsWith("OAuth")) {
    return "GitHub sign-in could not be completed. Please try again.";
  }

  return error ? "Sign-in could not be completed. Please try again." : null;
}

export default async function StudioLoginPage({ searchParams }: StudioLoginPageProps) {
  const { callbackUrl, error } = await searchParams;
  const redirectTo = /^\/studio(?:\/|$)/.test(callbackUrl ?? "") ? callbackUrl : "/studio";
  const errorMessage = getErrorMessage(error);

  return (
    <main className="studio-login">
      <section className="studio-login-card" aria-labelledby="studio-login-title">
        <span className="studio-kicker">Owner workspace</span>
        <h1 id="studio-login-title">Portfolio Studio</h1>
        <p>Private content management for Jatin&apos;s portfolio.</p>

        {errorMessage ? (
          <p className="studio-login-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo });
          }}
        >
          <button className="studio-github-button" type="submit">
            <GitBranch size={18} aria-hidden="true" />
            Continue with GitHub
          </button>
        </form>

        <small>Owner access only.</small>
      </section>
    </main>
  );
}
