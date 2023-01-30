import { ObjectId } from "mongodb";
import { z } from "zod";
import { getCollection } from "../../mongo-client";
import crypto from "crypto";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({

  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(2),
      name: z.string().min(2)
    }))
    .mutation(async ({ input }) => {
      const userCollection = await getCollection('user')
      const user = await userCollection.findOne({
        email: input.email,
        password: input.password
      });
      if (user) {
        return {
          success: false,
          msg: 'the username has been taken'
        };
      }

      const emailHash = crypto.createHash('md5').update(input.email).digest("hex")
      const avatarUrl = `https://www.gravatar.com/avatar/${emailHash}?s=256`
      const avatar = await (await fetch(avatarUrl)).arrayBuffer()
      const avatarBase64 = btoa(
        new Uint8Array(avatar)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const photoCollection = await getCollection('photo')
      const uploadPhoto = await photoCollection.insertOne({
        data: avatarBase64
      });

      const result = await userCollection.insertOne({
        email: input.email,
        name: input.name,
        password: input.password,
        image: uploadPhoto.insertedId.toString(),
        suspended: false
      });
      return {
        success: true,
        user: result
      };
    }),

  changePassword: protectedProcedure
    .input(z.object({
      oldPassword: z.string().min(2),
      newPassword: z.string().min(2),
      newPasswordAgain: z.string().min(2),
    }))
    .mutation(async ({ input, ctx }) => {
      if (input.newPassword !== input.newPasswordAgain) {
        return {
          success: false,
          msg: 'new password should match'
        };
      }
      const userCollection = await getCollection('user')
      const user = await userCollection.findOne({
        email: ctx.session.user.email,
        password: input.oldPassword
      });
      if (!user) {
        return {
          success: false,
          msg: 'old password incorrect'
        };
      }

      user.password = input.newPassword
      const res = await userCollection.replaceOne({ '_id': user._id }, user)
      // console.log('update res', res);

      return {
        success: res.modifiedCount > 0,
      };
    }),

  changeProfilePicture: protectedProcedure
    .input(z.object({
      pictureBase64: z.string()
    }))
    .mutation(async ({ input, ctx }) => {

      const imgurl = ctx.session.user.image
      if (!imgurl) {
        return {
          success: false,
          msg: 'couldnt find photo'
        }
      }
      const imguid = imgurl.substring('/api/photo/'.length)
      console.log(imguid);

      // '/api/photo/'+ user.image
      const photoCollection = await getCollection('photo')
      const photo = await photoCollection.findOne({
        '_id': new ObjectId(imguid)
      });

      if (!photo) {
        return {
          success: false,
          msg: 'couldnt find photo'
        }
      }
      photo.data = input.pictureBase64
      const res = await photoCollection.replaceOne({ '_id': photo._id }, photo)

      // console.log('update pp res', res);

      return {
        success: res.modifiedCount > 0,
      };
    }),
});