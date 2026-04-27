import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/mongodb';
import { authConfig } from './auth.config';

// Full auth config — runs in Node.js runtime only (API routes, server components).
// Never imported by middleware.ts to avoid Edge runtime conflicts.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).trim().toLowerCase().slice(0, 200);
        const password = String(credentials.password).slice(0, 200);
        if (!email || !password) return null;

        try {
          const db = await getDb();
          const admin = await db.collection('admins').findOne({ email });
          if (!admin) return null;

          const valid = await bcrypt.compare(password, admin.passwordHash as string);
          if (!valid) return null;

          return { id: admin._id.toString(), email: admin.email as string };
        } catch (err) {
          console.error('[NextAuth] authorize error:', err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
});

