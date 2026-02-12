import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          hd: "g.batstate-u.edu.ph", // UI restriction only
        },
      },
    }),
  ],

  callbacks: {
    // 🔐 HARD DOMAIN ENFORCEMENT
    async signIn({ user }) {
      if (!user.email) return false;

      const domain = user.email.split("@")[1];

      if (domain !== "g.batstate-u.edu.ph") {
        return false; // Block non-school emails
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        token.id = user.id;

        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true },
          });

          token.role = dbUser?.role ?? "STUDENT";
        } catch {
          token.role = "STUDENT";
        }
      }

      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as "STUDENT" | "ADMIN") ?? "STUDENT";
      }

      return session;
    },
  },
};
