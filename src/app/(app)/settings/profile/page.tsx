import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ProfileClient from "./ProfileClient";

export const metadata = {
  title: "Profile | NeuroQuant",
  description: "View your progress, achievements, and stats.",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      badges: {
        include: {
          badge: true,
        },
      },
    },
  });

  if (!dbUser) {
    redirect("/onboarding");
  }

  return <ProfileClient user={dbUser} />;
}
