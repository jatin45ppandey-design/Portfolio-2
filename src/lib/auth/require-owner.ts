import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { isOwnerGithubId } from "@/lib/auth/owner";

export async function requireOwner() {
  const session = await auth();

  if (!session || !isOwnerGithubId(session.user.githubId)) {
    redirect("/studio/login?error=AccessDenied");
  }

  return session;
}
