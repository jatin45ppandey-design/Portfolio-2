import { requireOwner } from "@/lib/auth/require-owner";

export default async function ProtectedStudioLayout({ children }: { children: React.ReactNode }) {
  await requireOwner();

  return children;
}
