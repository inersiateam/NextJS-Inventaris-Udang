import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { loginSchema } from './validations/authValidator'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          const validatedData = loginSchema.parse(credentials)
          const admin = await prisma.admin.findUnique({
            where: { username: validatedData.username }
          })
          
          if (!admin) {
            throw new Error('Username atau password salah')
          }
                    
          if (!admin.isActive) {
            throw new Error('Akun Anda tidak aktif. Hubungi administrator.')
          }
          
          const isPasswordValid = await bcrypt.compare(
            validatedData.password,
            admin.password
          )
          
          if (!isPasswordValid) {
            throw new Error('Username atau password salah')
          }
          
          await prisma.logAktivitas.create({
            data: {
              adminId: admin.id,
              aksi: 'LOGIN',
              tabelTarget: 'admin',
              timestamp: new Date(),
            }
          })
          
          return {
            id: admin.id.toString(),
            username: admin.username,
            jabatan: admin.jabatan,
            isActive: admin.isActive,
          }
          
        } catch (error) {
          console.error('Login error:', error)
          throw error
        }
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.jabatan = user.jabatan
      }
      return token
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.jabatan = token.jabatan as string
      }
      return session
    }
  },
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  
  secret: process.env.NEXTAUTH_SECRET,
}
