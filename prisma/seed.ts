import { ChatParticipants, Chats, Messages, PrismaClient } from "@prisma/client";
import { getCollection } from "../src/server/mongo-client";
import crypto from "crypto";

const accounts = [
    {
        id: 1,
        display_name: 'said yeter',
        username: 'said',
        email: 'saidyeter@hotmail.com',
        image_id: '63d842c75f8a8d4d74b86b25',
        password: '123',
        salt: 'zasdqwe',
        verified: true,
        created_at: new Date(),
        last_login: new Date(),
        suspended: false,
    },

    {
        id: 2,
        display_name: 'eser ozvataf',
        username: 'eser',
        email: 'eser@ozvataf.com',
        image_id: '63d842c75f8a8d4d74b86b25',
        password: '123',
        salt: 'zasdqwe',
        verified: true,
        created_at: new Date(),
        last_login: new Date(),
        suspended: false,
    },
    {
        id: 3,
        display_name: 'tayfun erbilen',
        username: 'tayfun',
        email: 'tayfun@erbilen.net',
        image_id: '63d842c75f8a8d4d74b86b25',
        password: '123',
        salt: 'zasdqwe',
        verified: true,
        created_at: new Date(),
        last_login: new Date(),
        suspended: false,
    },
    {
        id: 4,
        display_name: 'fatih kadir akin',
        username: 'fatih',
        email: 'fatihkadirakin@gmail.com',
        image_id: '63d842c75f8a8d4d74b86b25',
        password: '123',
        salt: 'zasdqwe',
        verified: true,
        created_at: new Date(),
        last_login: new Date(),
        suspended: false,
    },
    {
        id: 5,
        display_name: 'j herr',
        username: 'jherr',
        email: 'jherr@pobox.com',
        image_id: '63d842c75f8a8d4d74b86b25',
        password: '123',
        salt: 'zasdqwe',
        verified: true,
        created_at: new Date(),
        last_login: new Date(),
        suspended: false,
    },
    {
        id: 6,
        display_name: 'hasan shn',
        username: 'hasan',
        email: 'hsnsoft@outlook.com',
        image_id: '63d842c75f8a8d4d74b86b25',
        password: '123',
        salt: 'zasdqwe',
        verified: true,
        created_at: new Date(),
        last_login: new Date(),
        suspended: false,
    },
    {
        id: 7,
        display_name: 'scott hanselman',
        username: 'scott',
        email: 'scott@hanselman.com',
        image_id: '63d842c75f8a8d4d74b86b25',
        password: '123',
        salt: 'zasdqwe',
        verified: true,
        created_at: new Date(),
        last_login: new Date(),
        suspended: false,
    },
    {
        id: 8,
        display_name: 'okan davut',
        username: 'okan',
        email: 'davut.okan@gmail.com',
        image_id: '63d842c75f8a8d4d74b86b25',
        password: '123',
        salt: 'zasdqwe',
        verified: true,
        created_at: new Date(),
        last_login: new Date(),
        suspended: false,
    },
    {
        id: 9,
        display_name: 'adem ilter',
        username: 'adem',
        email: 'ademilter@gmail.com',
        image_id: '63d842c75f8a8d4d74b86b25',
        password: '123',
        salt: 'zasdqwe',
        verified: true,
        created_at: new Date(),
        last_login: new Date(),
        suspended: false,
    }
]

const chats: Chats[] = [
    {
        id: 1,
        chat_keys_id: '63d842c75f8a8d4d74b86b23',
        is_group: false,
        last_message_id: 1,
        group_image_id: null,
        group_name: null
    },
    {
        id: 2,
        chat_keys_id: '63d842c75f8a8d4d74b86b23',
        is_group: true,
        last_message_id: 3,
        group_image_id: '63d842c75f8a8d4d74b86b24',
        group_name: 'vrb'
    },
    {
        id: 3,
        chat_keys_id: '63d842c75f8a8d4d74b86b23',
        is_group: false,
        last_message_id: 5,
        group_image_id: null,
        group_name: null
    }
]

const chatParticipants: ChatParticipants[] = [
    {
        id: 1,
        account_id: 1,
        chat_id: 1
    },
    {
        id: 2,
        chat_id: 1,
        account_id: 2,
    },
    {
        id: 3,
        chat_id: 2,
        account_id: 1,
    },
    {
        id: 4,
        chat_id: 2,
        account_id: 3,
    },
    {
        id: 5,
        chat_id: 2,
        account_id: 4,
    },
    {
        id: 6,
        chat_id: 3,
        account_id: 1,
    },
    {
        id: 7,
        chat_id: 3,
        account_id: 4,
    }
]

const messages: Messages[] = [
    {
        id: 1,
        chat_id: 1,
        sender: 1,
        sent_at: new Date('2022-12-04 13:21:40.000'),
        text: 'selam',
        status: 0
    },
    {
        id: 2,
        chat_id: 2,
        sender: 1,
        sent_at: new Date('2022-12-04 14:11:45.000'),
        text: 'yarin aksam bulusalim mi ',
        status: 0
    },

    {
        id: 3,
        chat_id: 2,
        sender: 3,
        sent_at: new Date('2022-12-04 14:21:40.000'),
        text: 'olur nerede',
        status: 0
    },

    {
        id: 4,
        chat_id: 3,
        sender: 1,
        sent_at: new Date('2022-12-05 10:14:55.000'),
        text: 'abi selam naptin su bizim isi',
        status: 0
    },

    {
        id: 5,
        chat_id: 3,
        sender: 4,
        sent_at: new Date('2022-12-05 10:18:15.000'),
        text: 'said, daha bakamadim ya',
        status: 0
    },

]

const prisma = new PrismaClient()
export async function main() {
    for (let account of accounts) {

        const emailHash = crypto.createHash('md5').update(account.email).digest("hex")
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
        account.image_id = uploadPhoto.insertedId.toString()
        await prisma.accounts.create({
            data: account
        })
    }
    for (let chat of chats) {
        await prisma.chats.create({
            data: chat
        })
    }
    for (let chatParticipant of chatParticipants) {
        await prisma.chatParticipants.create({
            data: chatParticipant
        })
    }
    for (let message of messages) {
        await prisma.messages.create({
            data: message
        })
    }
}


main()
    .catch(e => {
        console.log(e);
        process.exit(1)
    })
    .finally(() => {
        prisma.$disconnect()
    })
