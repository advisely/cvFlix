import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (user && await bcrypt.compare(credentials.password, user.passwordHash)) {
          return { id: user.id, email: user.email }
        }

        return null
      }
    })
  ],
  pages: {
    signIn: '/boss/login',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
export { authOptions }