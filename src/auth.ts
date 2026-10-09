import NextAuth from "next-auth";
import GitHub, { type GitHubProfile } from "next-auth/providers/github";

import { isOwnerGithubId } from "@/lib/auth/owner";

declare module "next-auth" {
  interface Session {
    user: {
      githubId?: string;
      login?: string;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    githubId?: string;
    login?: string;
    image?: string | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/studio/login",
    error: "/studio/login",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "github" || !profile?.id) {
        return false;
      }

      return isOwnerGithubId(profile.id);
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "github" && profile) {
        const githubProfile = profile as unknown as GitHubProfile;

        if (isOwnerGithubId(githubProfile.id)) {
          token.githubId = String(githubProfile.id);
          token.login = githubProfile.login;
          token.name = githubProfile.name;
          token.image = githubProfile.avatar_url;
          delete token.email;
          delete token.picture;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        githubId: token.githubId,
        login: token.login,
        name: token.name ?? null,
        image: token.image ?? null,
      } as typeof session.user;

      return session;
    },
  },
});
