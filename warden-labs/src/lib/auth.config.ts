import type { NextAuthConfig } from 'next-auth';

// Edge-compatible auth config (no Node.js modules)
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const publicPaths = ['/login', '/register'];
      const isPublic = publicPaths.some(p => nextUrl.pathname.startsWith(p));
      const isApi = nextUrl.pathname.startsWith('/api');

      if (isApi) return true;
      if (!isLoggedIn && !isPublic) return false; // Redirect to login
      if (isLoggedIn && isPublic) {
        return Response.redirect(new URL('/', nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.username as string;
      }
      return session;
    },
  },
  providers: [], // Added in auth.ts with full config
  secret: process.env.NEXTAUTH_SECRET,
};
