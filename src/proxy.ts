import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { isOwnerGithubId } from "@/lib/auth/owner";

export const proxy = auth((request) => {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/studio/login") {
    return NextResponse.next();
  }

  if (isOwnerGithubId(request.auth?.user?.githubId)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/studio")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/studio/login", request.url);
  loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: ["/studio/:path*", "/api/studio/:path*"],
};
