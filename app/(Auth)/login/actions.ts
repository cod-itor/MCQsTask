'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { loginSchema, registerSchema } from '@/lib/validations/auth'

export async function login(formData: FormData) {
  try {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const validation = loginSchema.safeParse({ email, password })
    if (!validation.success) {
      return { error: 'Invalid email or password.' }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: validation.data.email,
      password: validation.data.password,
    })

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        return { error: 'Your account has not been verified yet. Please check your email for the confirmation link.' }
      }
      return { error: error.message || 'Invalid email or password.' }
    }

    revalidatePath('/', 'layout')
    redirect('/home?logged_in=true')
  } catch (e: any) {
    return { error: e?.message || JSON.stringify(e) || 'An unexpected error occurred.' }
  }
}

export async function signup(formData: FormData) {
  try {
    const supabase = await createClient()
    
    const username = formData.get('username') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('password') as string 
    
    const validation = registerSchema.safeParse({
      username,
      email,
      password,
      confirmPassword: password 
    })

    if (!validation.success) {
      return { error: validation.error.errors[0]?.message || 'Invalid registration data.' }
    }

    const validData = validation.data

    const existingUser = await prisma.user.findUnique({
      where: { username: validData.username }
    })

    if (existingUser) {
      return { error: 'Username is already taken' }
    }

    const { data, error } = await supabase.auth.signUp({
      email: validData.email,
      password: validData.password,
      options: {
        data: {
          username: validData.username,
        }
      }
    })

    if (error) {
      return { error: error.message || JSON.stringify(error) || 'Supabase signup failed.' }
    }

    if (data.user) {
      try {
        await prisma.user.upsert({
          where: { id: data.user.id },
          update: { email: data.user.email!, username: validData.username },
          create: { id: data.user.id, email: data.user.email!, username: validData.username }
        })
      } catch (e: any) {
        console.error("Prisma upsert error:", e)
        // We don't return an error here to prevent blocking the user if they successfully signed up in Supabase
      }
    }

    return { success: true, message: "Successfully created account! Please check your email to verify." }
  } catch (e: any) {
    console.error("Action exception:", e)
    return { error: e?.message || JSON.stringify(e) || 'An unexpected server error occurred.' }
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
