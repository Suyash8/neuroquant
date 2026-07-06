"use server";

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

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

  const { error, data: authData } = await supabase.auth.signUp(data)

  if (error) {
    return redirect('/login?error=' + error.message)
  }

  if (authData.user) {
    // Create the Prisma User record to match the Auth User
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (!existingUser) {
        await prisma.user.create({
            data: {
                id: authData.user.id,
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
        });
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
