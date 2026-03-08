import GitHubProvider from 'next-auth/providers/github'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.login) {
        session.user.login = token.login as string;
        const adminLogins = process.env.ADMIN_GITHUB_LOGINS?.split(',') ?? []
        session.user.isAdmin = adminLogins.includes(token.login as string)
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.login = (profile as { login?: string }).login;
      }
      return token;
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}