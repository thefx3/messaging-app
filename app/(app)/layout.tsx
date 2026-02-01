import { getViewerServer } from "@/lib/auth/viewer.server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import NavBar from "@/components/NavBar";

export default async function AppLayout({ children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, role } = await getViewerServer();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <NavBar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header email={user.email ?? "-"} role={role} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
