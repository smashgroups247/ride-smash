import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

/**
 * Lightweight auth config for the Edge runtime (middleware).
 * Must NOT import anything that uses Node.js built-ins (mongodb, bcryptjs, crypto streams).
 * The real `authorize` logic lives in auth.ts which runs in Node.js only.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [
    // Provider declaration needed so NextAuth knows Credentials exists.
    // The actual authorize callback is intentionally omitted here — it runs
    // in the Node.js runtime via auth.ts, never in the Edge.
    Credentials({}),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      // Only the dashboard requires auth
      if (pathname === '/' && !isLoggedIn) return false;

      // Bounce logged-in users away from /login
      if (pathname === '/login' && isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl));
      }

      return true;
    },
  },
};
