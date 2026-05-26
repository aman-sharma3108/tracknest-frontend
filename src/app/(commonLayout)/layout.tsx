import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { userService } from "@/services/user.service";

export const dynamic = "force-dynamic";

export default async function CommonLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { data } = await userService.getSession();

  const user = data?.user;
  const isLoggedIn = !!user;

  const userName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar isLoggedIn={isLoggedIn} userName={userName} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}