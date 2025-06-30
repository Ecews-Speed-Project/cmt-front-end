import 'next-auth';

type UserRole = 'Super Admin' | 'Admin' | 'State';

declare module 'next-auth' {
  interface User {
    roles?: UserRole[];
    state?: string;
    access_token?: string;
    token?: string;
  }

  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      roles?: UserRole[];
      state?: string;
      access_token?: string;
      token?: string;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    roles?: UserRole[];
    state?: string;
    access_token?: string;
    token?: string;
  }
}
