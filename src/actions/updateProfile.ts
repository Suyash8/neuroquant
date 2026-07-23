"use server";

import prisma from "@/lib/prisma";
import { withAuthAction } from "@/lib/actions";

interface UpdateProfilePayload {
  username?: string;
  displayName?: string;
  persona?: "quant" | "generalist";
}

interface UpdateProfileResponse {
  success?: boolean;
  user?: {
    username: string | null;
    displayName: string | null;
    persona: string | null;
  };
}

export const updateProfile = withAuthAction<UpdateProfilePayload, UpdateProfileResponse>(
  async (data, { user }) => {
    const updateData: any = {};

    // Validate and prepare username
    if (data.username !== undefined) {
      const cleanUsername = data.username.toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (cleanUsername !== data.username.toLowerCase()) {
        throw new Error("Username can only contain letters, numbers, and underscores.");
      }

      if (cleanUsername.length < 3) {
        throw new Error("Username must be at least 3 characters long.");
      }
      
      // Check uniqueness
      const existingUser = await prisma.user.findUnique({
        where: { username: cleanUsername }
      });

      if (existingUser && existingUser.id !== user.id) {
        throw new Error("Username is already taken.");
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
  }
);
