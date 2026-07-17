"use server";

import prisma from "@/lib/prisma";

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  if (!username || username.length < 3) return false;
  
  // Clean username (alphanumeric and underscores only)
  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  
  if (cleanUsername !== username.toLowerCase()) return false;
  
  const existingUser = await prisma.user.findUnique({
    where: { username: cleanUsername }
  });
  
  return !existingUser;
}
