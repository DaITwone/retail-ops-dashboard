import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Hardcode tạm, sau này thay bằng query DB
const MOCK_USER = {
  id: "1",
  name: "Store Manager",
  email: "manager@winmart.com",
  password: "123456",
  role: "manager",
};

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        if (email === MOCK_USER.email && password === MOCK_USER.password) {
          return {
            id: MOCK_USER.id,
            name: MOCK_USER.name,
            email: MOCK_USER.email,
            role: MOCK_USER.role,
          };
        }

        return null;
      },
    }),
  ],
});
