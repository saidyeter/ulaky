import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { getCollection } from "../../../server/mongo-client";

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  // Configure one or more authentication providers
  providers: [
    CredentialProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      type:"credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {

        const loginObj = z.object({
          username: z.string().email(),
          password: z.string(),
        })

        const parseRes = loginObj.safeParse(credentials)
        if (!parseRes.success) {
          return null
        }

        const { username, password } = parseRes.data

        const userCollection = await getCollection("user")
        const user = await userCollection.findOne({
          email:username,
          password,
        });

        //https://www.gravatar.com/avatar/73689250fcb74e2bc2b5196ace3aaacc?s=256
        if (user) {
          const _user={
            id: user._id.toString(),
            email: user.email,
            name : user.name,
            image : user.image ? '/api/photo/'+ user.image : ""
          }
          console.log(_user);
          
          
          return _user
        }
        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  }
};

export default NextAuth(authOptions);
