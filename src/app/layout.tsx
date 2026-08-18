import type { Metadata, Viewport } from "next";
import "./globals.css";

import { StoreInitializer } from "@/components/StoreInitializer";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  let favicon = "/favicon-quant.svg";

  if (authUser) {
    const dbUser = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (dbUser?.persona === "generalist") {
      favicon = "/favicon-generalist.svg";
    }
  }

  return {
    title: "NeuroQuant | Cognitive & Quantitative Training",
    description: "High-performance mental math and automaticity trainer.",
    icons: {
      icon: favicon,
    }
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  let globalUser = null;
  let activePersona = "theme-quant";

  if (authUser) {
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id }
    });
    if (dbUser) {
      globalUser = {
        id: dbUser.id,
        persona: dbUser.persona,
        globalStreak: dbUser.globalStreak,
        totalPoints: dbUser.totalPoints,
        username: dbUser.username,
        displayName: dbUser.displayName,
      };
      activePersona = `theme-${dbUser.persona}`;
    }
  }

  return (
    <html lang="en" className="h-full antialiased dark font-sans">
      <body className={`h-full flex overflow-hidden bg-background text-foreground ${activePersona}`}>
        <StoreInitializer user={globalUser} />
        
        {children}
        
      </body>
    </html>
  );
}
