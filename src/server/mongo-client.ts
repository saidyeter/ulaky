import { type Db, MongoClient } from 'mongodb';
import { serverEnv } from '../env/schema.mjs';


let db: Db
export async function getCollection(collectionName: "user" | "message" | 'photo') {
    if (!db) {
        if (!serverEnv.MONGODB_URI) {
            throw new Error("db connection error");
        }
        const url = serverEnv.MONGODB_URI;
        const client = new MongoClient(url);
        const connection = await client.connect()
        db = connection.db('test');
    }
    return db.collection(collectionName)
}