import { LogOut } from "lucide-react";
import Link from "next/link";

import { signOut } from "@/auth";

export function StudioHeader() {
  return (
    <header className="studio-header">
      <div className="studio-header-inner">
        <Link className="studio-brand" href="/studio" aria-label="Portfolio Studio home">
          <span>JP</span>
          Portfolio Studio
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/studio/login" });
          }}
        >
          <button className="studio-sign-out" type="submit">
            <LogOut size={15} aria-hidden="true" />
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
