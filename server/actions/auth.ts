'use server'

import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordMatch,
} from '@/lib/validators/auth'

const SALT_ROUNDS = 10

export interface SignUpState {
  error?: string
  success?: boolean
}

export async function signUpWithCredentials(
  _prev: SignUpState | null,
  formData: FormData
): Promise<SignUpState> {
  const name = (formData.get('name') as string)?.trim() ?? ''
  const email = (formData.get('email') as string)?.trim().toLowerCase() ?? ''
  const password = (formData.get('password') as string) ?? ''
  const confirmPassword = (formData.get('confirmPassword') as string) ?? ''

  const nameResult = validateName(name)
  if (!nameResult.ok) return { error: nameResult.error }
  const emailResult = validateEmail(email)
  if (!emailResult.ok) return { error: emailResult.error }
  const passwordResult = validatePassword(password)
  if (!passwordResult.ok) return { error: passwordResult.error }
  const matchResult = validatePasswordMatch(password, confirmPassword)
  if (!matchResult.ok) return { error: matchResult.error }

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return { error: 'An account with this email already exists.' }
    }

    const hashedPassword = await hash(password, SALT_ROUNDS)
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'STUDENT',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('Unique constraint') || message.includes('P2002')) {
      return { error: 'An account with this email already exists.' }
    }
    console.error('Sign up error:', err)
    return { error: 'Something went wrong. Please try again.' }
  }

  return { success: true }
}
