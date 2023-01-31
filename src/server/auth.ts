import type { GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "../env/server.mjs";
import CredentialProvider from "next-auth/providers/credentials";
import { prisma } from "./db";
import { z } from "zod";
import { type ObjectID } from "bson";
import { getCollection } from "./mongo-client";

/**
 * Module augmentation for `next-auth` types
 * Allows us to add custom properties to the `session` object
 * and keep type safety
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure
 * adapters, providers, callbacks, etc.
 * @see https://next-auth.js.org/configuration/options
 **/
export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        // session.user.role = user.role; <-- put other properties on the session here
      }
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here
     *
     * Most other providers require a bit more work than the Discord provider.
     * For example, the GitHub provider requires you to add the
     * `refresh_token_expires_in` field to the Account model. Refer to the
     * NextAuth.js docs for the provider you want to use. Example:
     * @see https://next-auth.js.org/providers/github
     **/
    CredentialProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      type: "credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {

        const loginObj = z.object({
          username: z.string().email(),
          password: z.string(),
        })

        const parseRes = loginObj.safeParse(credentials)
        if (!parseRes.success) {
          return null
        }

        const { username, password } = parseRes.data

        const db = prisma
        const existingUser = await db.accounts.findFirst({
          where: {
            OR: [
              {
                email: {
                  equals: username
                },
              },
              {
                username: {
                  equals: username
                },
              }
            ],
            AND: {
              password: {
                equals: password
              }
            }
          }
        })
        if (existingUser) {
          const _user = {
            id: existingUser.id.toString(),
            email: existingUser.email,
            name: existingUser.display_name,
            image: existingUser.image_id ? '/api/photo/' + existingUser.image_id : ""
          }
          console.log(_user);


          return _user
        }

        // prisma
        // const userCollection = await getCollection("user")
        // const user = await userCollection.findOne<{
        //   _id: ObjectID,
        //   email:string,
        //   name: string,
        //   image?: string
        // }>({
        //   email:username,
        //   password,
        // });

        // //https://www.gravatar.com/avatar/73689250fcb74e2bc2b5196ace3aaacc?s=256
        // if (user) {
        //   const _user={
        //     id: user._id.toString(),
        //     email: user.email,
        //     name : user.name,
        //     image : user.image ? '/api/photo/'+ user.image : ""
        //   }
        //   console.log(_user);


        //   return _user
        // }
        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  }
};

/**
 * Wrapper for getServerSession so that you don't need
 * to import the authOptions in every file.
 * @see https://next-auth.js.org/configuration/nextjs
 **/
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};