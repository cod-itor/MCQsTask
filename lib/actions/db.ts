'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export async function getSubjects() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Ensure user exists in our DB
  await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email! },
    create: { id: user.id, email: user.email! }
  })

  const subjects = await prisma.subject.findMany({
    where: { userId: user.id },
    include: {
      practiceSets: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return subjects
}

export async function createSubject(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const subject = await prisma.subject.create({
    data: {
      name,
      userId: user.id,
    }
  })

  revalidatePath('/')
  return subject
}

export async function deleteSubject(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  await prisma.subject.delete({
    where: {
      id,
      userId: user.id, // Ensure they own it
    }
  })

  revalidatePath('/')
}

export async function renameSubject(id: string, newName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const subject = await prisma.subject.update({
    where: {
      id,
      userId: user.id,
    },
    data: {
      name: newName,
    }
  })

  revalidatePath('/')
  return subject
}

export async function toggleFavoriteSubject(id: string, isFavorite: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const subject = await prisma.subject.update({
    where: {
      id,
      userId: user.id,
    },
    data: {
      isFavorite,
    }
  })

  revalidatePath('/')
  return subject
}

export async function savePracticeSet(subjectId: string, title: string, type: string, content: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Verify they own the subject
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId, userId: user.id }
  })

  if (!subject) throw new Error('Subject not found or unauthorized')

  const practiceSet = await prisma.practiceSet.create({
    data: {
      subjectId,
      title,
      type,
      content,
    }
  })

  revalidatePath('/')
  return practiceSet
}

export async function deletePracticeSet(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // We need to verify ownership through the subject
  const practiceSet = await prisma.practiceSet.findUnique({
    where: { id },
    include: { subject: true }
  })

  if (!practiceSet || practiceSet.subject.userId !== user.id) {
    throw new Error('Unauthorized')
  }

  await prisma.practiceSet.delete({
    where: { id }
  })

  revalidatePath('/')
}

export async function updatePracticeSet(id: string, title: string, content: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const practiceSet = await prisma.practiceSet.findUnique({
    where: { id },
    include: { subject: true }
  })

  if (!practiceSet || practiceSet.subject.userId !== user.id) {
    throw new Error('Unauthorized')
  }

  const updated = await prisma.practiceSet.update({
    where: { id },
    data: { title, content }
  })

  revalidatePath('/')
  return updated
}
