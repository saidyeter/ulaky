import { type Db, MongoClient } from 'mongodb';
// import { serverEnv } from '../env/schema.mjs';


let db: Db
export async function getCollection(collectionName: "user" | "message" | 'photo' | "chat") {
    if (!db) {
        const url =  process.env.MONGODB_URI 
        if (!url) {
            throw new Error("db connection error");
        }
        const client = new MongoClient(url);
        const connection = await client.connect()
        db = connection.db('test');
    }
    return db.collection(collectionName)
}