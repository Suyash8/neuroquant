import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { StoreInitializer } from "@/components/StoreInitializer";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      };
      activePersona = `theme-${dbUser.persona}`;
    }
  }

  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased dark`}>
      <body className={`h-full flex overflow-hidden bg-background text-foreground ${activePersona}`}>
        <StoreInitializer user={globalUser} />
        
        {children}
        
      </body>
    </html>
  );
}
