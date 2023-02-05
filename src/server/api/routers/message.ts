import { ObjectId } from "mongodb";
import { z } from "zod";
import { getCollection } from "../../mongo-client";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { generateKeyPair } from 'crypto'

export const messageRouter = createTRPCRouter({
  searchUser: protectedProcedure
    .input(z.object({
      searchKey: z.string().min(3)
    }))
    .query(async ({ input, ctx }) => {
      const accounts = await ctx.prisma.accounts.findMany({
        where: {
          username: {
            startsWith: input.searchKey
          }
        }
      })
      return {
        success: true,
        accounts
      }
    }),
  getChats: protectedProcedure
    .input(z.object({}))
    .query(async ({ input, ctx }) => {
      console.log();

      const chats = await ctx.prisma.$queryRaw`${getChatQuery(ctx.session.user.id)}`
      return {
        success: true,
        chats
      }
    }),

  getChatsByUser: protectedProcedure
    .input(z.object({
      receiverId: z.number()
    }))
    .query(async ({ input, ctx }) => {
      console.log(ctx.session.user.id);

      const chats = await ctx.prisma.chats.findMany({
        // where: {
        //   account_id: parseInt(ctx.session.user.id)
        // },
        // orderBy: {
        //   last_message: 'desc'
        // }
      })
      return {
        success: true,
        chats
      }
    }),
  startChat: protectedProcedure
    .input(z.object({
      receiverUsername: z.string().min(4)
    }))
    .mutation(async ({ input, ctx }) => {
      const db = ctx.prisma
      const receiverUser = await db.accounts.findFirst({
        where: {
          username: {
            equals: input.receiverUsername
          },
        }
      })
      if (!receiverUser) {
        return {
          success: false,
          msg: 'the receiver username couldnt find'
        };
      }
      const keys = createRSAKeys()

      if (keys.length == 0) {
        return {
          success: false,
          msg: "error on key creation"
        }
      }
      const [publicKey, privateKey] = keys
      const chatCollection = await getCollection("chat")
      const insertMongoResult = await chatCollection.insertOne({
        publicKey,
        privateKey,
        participants: [
          receiverUser.id,
          ctx.session.user.id
        ]
      })
      if (!insertMongoResult.acknowledged) {
        console.log('couldnt insert public and private key to mongo')
        return {
          success: false,
          msg: "error on key creation"
        }
      }

      // const insertSenderChat = db.chats.create({
      //   data: {
      //     // sender_id: parseInt(ctx.session.user.id),
      //     chat_keys_id: insertMongoResult.insertedId.toString(),
      //     // last_message: new Date(),
      //   }
      // })

      // const insertReceiverChat = db.chats.create({
      //   data: {
      //     // account_id: receiverUser.id,
      //     chat_keys_id: insertMongoResult.insertedId.toString(),
      //     last_message: new Date(),
      //   }
      // })

      // const promises = await Promise.allSettled([insertSenderChat, insertReceiverChat])
      // if (promises[0].status == 'fulfilled' && promises[1].status == 'fulfilled') {
      //   return {
      //     success: true,
      //     chatId: promises[0].value.id
      //   }
      // }
      console.log('couldnt insert chat to db')
      return {
        success: false,
        msg: "error on chat creation"
      }
    }),
  sendMessage: protectedProcedure
    .input(z.object({
      text: z.string().min(2),
      chatId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = ctx.prisma
      const chat = await db.chats.findFirst({
        where: {
          id: {
            equals: input.chatId
          }
        }
      })
      if (!chat) {
        return {
          success: false,
          msg: 'chat coulndt find'
        };
      }

      const insertMessage = await db.messages.create({
        data: {
          chat_id: chat.id,
          text: input.text,
          sender: parseInt(ctx.session.user.id),
          sent_at: new Date(),
        }
      })
      // push notification to msg queue

      return {
        success: true
      };
    }),

  getMessageContent: protectedProcedure
    .input(z.object({
      messageId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = ctx.prisma
      const message = await db.messages.findFirst({
        where: {
          id: {
            equals: input.messageId
          }
        }
      })
      if (!message) {
        return {
          success: false,
          msg: 'chat coulndt find'
        };
      }
      const messageReads = await db.messageReads.findMany({
        where: {
          message_id: {
            equals: input.messageId
          }
        },
        select: {
          account_id: true,
          read_at: true
        }
      })

      return {
        success: true,
        message: message,
        reads: messageReads
      };
    }),

  setMessageRead: protectedProcedure
    .input(z.object({
      messageId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = ctx.prisma
      const message = await db.messages.findFirst({
        where: {
          id: {
            equals: input.messageId
          }
        }
      })
      if (!message) {
        return {
          success: false,
          msg: 'chat coulndt find'
        };
      }
      const messageReads = await db.messageReads.findFirst({
        where: {
          message_id: {
            equals: input.messageId
          },
          account_id: {
            equals: parseInt(ctx.session.user.id)
          }
        },
      })
      if (messageReads) {
        return {
          success: true,
        };
      }
      await db.messageReads.create({
        data: {
          message_id: input.messageId,
          account_id: parseInt(ctx.session.user.id),
          read_at: new Date()
        }
      })

      return {
        success: true,
      };
    }),

  getMessages: protectedProcedure
    .input(z.object({
      chatId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const db = ctx.prisma
      const messages = await db.messages.findMany({
        where: {
          chat_id: input.chatId
        }
      })
      return {
        success: true,
        messages
      }



    }),

  // getFirstUnreadMessage: protectedProcedure
  //   .input(z.object({
  //     chatId: z.number(),
  //   }))
  //   .mutation(async ({ input, ctx }) => {

  // select mr.* from message_reads mr
  // right join messages m on m.id = mr.message_id
  // where m.chat_id = 123 and mr.account_id=345
  // order by mr.read_at desc
  // limit 1

  //   }),

});

function createRSAKeys(): string[] {
  let publicKeyStr = ''
  let privateKeyStr = ''
  let error
  generateKeyPair('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase: 'top secret'
    }
  }, (err, publicKey, privateKey) => {
    error = err
    publicKeyStr = publicKey
    privateKeyStr = privateKey
    // Handle errors and use the generated key pair.
  })
  if (error) {
    console.log('error on key creation', error)
    return []
  }
  return [
    publicKeyStr,
    privateKeyStr
  ]
}

function getChatQuery(accountId:number|string) {
  return `
  -- chat list 
  select
  c.id as chatId,
  
  # receiver user display name 
  (
    case 
      when c.is_group = 1 then c.group_name
      else a.display_name 
    end
  ) as receiverDisplayName,
    
  # receiver username 
  (
    case 
      when c.is_group = 1 then c.group_name
      else a.username
    end
  ) as receiverUserName,
  
  # receiver user image
  (
    case 
      when c.is_group = 1 then c.group_image_id
      else a.image_id 
    end
  ) as receiverImageId,
  
  # last message text
  m.text as lastMessageText,
  
  # last message date
  m.sent_at as lastMessageDate,
    
  # last message sender
  m.sender as lastMessageSender
  
  from chats c
  inner join chat_participants cp on c.id = cp.chat_id
  inner join messages m on m.id = c.last_message_id
  left join chat_participants cp2 on cp2.chat_id = c.id and cp2.account_id <> ${accountId}  and c.is_group=0
  left join accounts a on a.id = cp2.account_id
  where cp.account_id = ${accountId};
`
}