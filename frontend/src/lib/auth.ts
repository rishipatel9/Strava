import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions, Session } from "next-auth";
import axios from "axios";

declare module "next-auth" {
  interface Session {
    user: {
      id: any;
      name?: string | null | undefined;
      email?: string | null | undefined;
      image?: any;
    };
    accessToken?: any;
  }
}

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000"; 

const NEXT_AUTH: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        try {
          // Send request to backend to create user
          const response = await axios.post(`${BACKEND_URL}/signup`, {
            email: user.email,
            name: user.name,
            image: user.image,
          });

          const dbUser = response.data; 
          token.id = dbUser.id;
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.image = dbUser?.image;
        } catch (error) {
          console.error("Error creating user:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
          image: token.image,
        };
        session.accessToken = token.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
};

export { NEXT_AUTH };
