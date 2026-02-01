import { getViewerServer } from "@/lib/auth/viewer.server";
import "./globals.css";
import { redirect } from "next/navigation";
import Header from "@/components/Header";



export default async function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
const { user, role } = await getViewerServer();
  if (!user) redirect("/login");

  return (
    <html lang="en">
      <body className={`antialiased`} >
        <Header email={user.email ?? "-"} role={role} />
        {children}
      </body>
    </html>
  );
}
