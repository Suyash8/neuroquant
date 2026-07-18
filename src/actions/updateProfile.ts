"use server";

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export async function updateProfile(data: {
  username?: string;
  displayName?: string;
  persona?: "quant" | "generalist";
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: "Not authenticated" };
  }

  try {
    const updateData: any = {};

    // Validate and prepare username
    if (data.username !== undefined) {
      const cleanUsername = data.username.toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (cleanUsername !== data.username.toLowerCase()) {
        return { error: "Username can only contain letters, numbers, and underscores." };
      }
      
      if (cleanUsername.length < 3) {
        return { error: "Username must be at least 3 characters long." };
      }

      // Check uniqueness
      const existingUser = await prisma.user.findUnique({
        where: { username: cleanUsername }
      });

      if (existingUser && existingUser.id !== user.id) {
        return { error: "Username is already taken." };
      }

      updateData.username = cleanUsername;
    }

    if (data.displayName !== undefined) {
      updateData.displayName = data.displayName.trim();
    }

    if (data.persona !== undefined) {
      if (["quant", "generalist"].includes(data.persona)) {
        updateData.persona = data.persona;
      }
    }

    // Update in Prisma
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return { 
      success: true, 
      user: {
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        persona: updatedUser.persona
      }
    };
  } catch (err: any) {
    console.error("Error updating profile:", err);
    return { error: "An unexpected error occurred while saving your profile." };
  }
}
