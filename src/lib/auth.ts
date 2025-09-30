import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          const error = new Error('Missing email or password.');
          error.name = 'CredentialsSignin';
          throw error;
        }

        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          const userCount = await prisma.user.count();
          const fallbackEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';
          const fallbackPassword = process.env.DEFAULT_ADMIN_PASSWORD;

          const canBootstrap = userCount === 0 && fallbackPassword && credentials.email === fallbackEmail;

          if (canBootstrap) {
            const hashedPassword = await bcrypt.hash(fallbackPassword, 10);
            user = await prisma.user.create({
              data: {
                email: fallbackEmail,
                passwordHash: hashedPassword
              }
            });
          } else {
            const error = new Error('Account not found.');
            error.name = 'CredentialsSignin';
            throw error;
          }
        }

        const passwordMatches = await bcrypt.compare(credentials.password, user.passwordHash)

        if (!passwordMatches) {
          const error = new Error('Incorrect password.');
          error.name = 'CredentialsSignin';
          throw error;
        }

        return { id: user.id, email: user.email }
      }
    })
  ],
  pages: {
    signIn: '/boss/login',
  },
}
