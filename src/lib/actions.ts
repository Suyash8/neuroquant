import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import type { User } from "@prisma/client";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AuthenticatedAction<T, R> = (
  payload: T,
  ctx: {
    user: User;
    supabase: SupabaseClient;
  }
) => Promise<R>;

/**
 * A higher-order function that wraps a server action with authentication.
 * It ensures the user is authenticated via Supabase and exists in Prisma
 * before calling the underlying handler.
 */
export function withAuthAction<T, R>(
  handler: AuthenticatedAction<T, R>
): (payload: T) => Promise<R | { error: string }> {
  return async (payload: T) => {
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                );
              } catch (error) {
                // The `setAll` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
              }
            },
          },
        }
      );

      const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !supabaseUser) {
        return { error: "Unauthorized" };
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: supabaseUser.id },
      });

      if (!dbUser) {
        return { error: "User not found in database" };
      }

      return await handler(payload, { user: dbUser, supabase });
    } catch (error: any) {
      console.error("[AuthAction Error]", error);
      return { error: error.message || "An unexpected error occurred." };
    }
  };
}
