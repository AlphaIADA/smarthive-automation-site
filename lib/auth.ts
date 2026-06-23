import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;
        const emailLower = email.toLowerCase();
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { emailLower },
              { email: { equals: email, mode: "insensitive" } },
            ],
          },
        });
        if (!user?.password) return null;
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = "role" in user && typeof user.role === "string" ? user.role : "USER";
      }
      return token;
    },
    async session({ session, token }) {
      const sessionWithRole = session as typeof session & { role?: string };
      sessionWithRole.role = typeof token.role === "string" ? token.role : "USER";
      return sessionWithRole;
    }
  },
  pages: {
    signIn: "/login"
  }
});
