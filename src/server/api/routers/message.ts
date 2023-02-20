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
      const sql = getChatsQuery(ctx.session.user.id)
      // console.log(ctx.session.user.id);

      const chats = await ctx.prisma.$queryRawUnsafe(sql)

      return {
        success: true,
        chats
      }
    }),

  getMessages: protectedProcedure
    .input(z.object({
      chatId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const sql = getChatMessagesQuery(input.chatId)
      const messages = await ctx.prisma.$queryRawUnsafe(sql)
      return {
        success: true,
        messages
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

      
      const insertChat = await db.chats.create({
        data: {
          last_message_id:-1,
          chat_keys_id: insertMongoResult.insertedId.toString(),
        }
      })

      const insertChatPartipiciants= await db.chatParticipants.createMany({
        data:[
          {
            account_id: receiverUser.id,
            chat_id : insertChat.id
          },
          {
            account_id: parseInt(ctx.session.user.id),
            chat_id : insertChat.id
          },
        ]
      })

      return {
        success: true,
        chatId: insertChat.id
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

      const updateRes = await db.chats.update({
        where: {
          id: chat.id
        },
        data: {
          last_message_id: insertMessage.id
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

function getChatsQuery(accountId: number | string) {
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
  where cp.account_id = ${accountId}
  order by m.sent_at desc;
`
}

function getChatMessagesQuery(chatId: number) {
  return `
-- chat messages 
select 
m.text,
m.sender,
a.username,
a.display_name,
a.image_id,
m.sent_at
from messages m 
inner join accounts a on a.id = m.sender
where  m.chat_id = ${chatId};
`
}