import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) return null;

        // Kembalikan objek user lengkap beserta role-nya
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role, // Memastikan field role (e.g. 'admin' / 'operator') terikut
        };
      },
    }),
  ],

  callbacks: {
    // 1. Menyimpan data role dari database ke dalam JWT token
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    // 2. Meneruskan data role dari JWT token ke objek Sesi di Frontend
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role; // Sekarang session.user.role bisa diakses di page.jsx
        session.user.id = token.id;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 hari masa aktif sesi login
  },

  // Mengarahkan NextAuth ke halaman login kustom bertema terang yang sudah dibuat
  pages: {
    signIn: "/auth/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };