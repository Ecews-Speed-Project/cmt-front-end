import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        access_token: { label: "Access Token", type: "text" },
        user: { label: "User", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.access_token || !credentials?.user) {
          return null;
        }

        try {
          const user = JSON.parse(credentials.user);
          return {
            id: user.id?.toString(),
            email: user.email,
            name: user.fullname,
            roles: user.roles,
            state: user.state,
            access_token: credentials.access_token,
          };
        } catch (error) {
          console.error('Auth Error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.roles = user.roles;
        token.state = user.state;
        token.access_token = user.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.roles = token.roles;
        session.user.state = token.state;
        session.user.access_token = token.access_token;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
