"use server";

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { withPerf } from '@/lib/perf'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await withPerf("Supabase Auth (signIn)", () => supabase.auth.signInWithPassword(data))

  if (error) {
    return redirect('/login?error=' + error.message)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error, data: authData } = await withPerf("Supabase Auth (signUp)", () => supabase.auth.signUp(data))

  if (error) {
    return redirect('/login?error=' + error.message)
  }

  if (authData.user) {
    const userId = authData.user.id;
    // Create the Prisma User record to match the Auth User
    const existingUser = await withPerf("Prisma Auth (findUnique)", () => prisma.user.findUnique({ where: { email: data.email } }));
    if (!existingUser) {
        await withPerf("Prisma Auth (create)", () => prisma.user.create({
            data: {
                id: userId,
                email: data.email,
                persona: "quant",
                globalStreak: 0,
                totalPoints: 0,
                reflexProfile: {
                    create: {
                        horizon: "30_days",
                        moduleStreak: 0
                    }
                }
            }
        }));
    }
    
    // If Supabase requires email confirmation, a session won't be created yet
    if (!authData.session) {
      return redirect('/login?message=Check your email to confirm your account')
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
