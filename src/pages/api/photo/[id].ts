import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

import { getCollection } from "../../../server/mongo-client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== 'GET') {
        return res.status(400).json({ err: 'GET request expoected' })
    }

    const { id } = req.query
    if (!id) {
        return res.status(400).json({ err: 'Id expoected' })
    }
    const photoId = Array.isArray(id) ? id[0] : id

    const collection = await getCollection('photo')
    const photo = await collection.findOne({ "_id": new ObjectId(photoId) })

    if (!photo) {
        return res.status(404)
    }

    return res.send(Buffer.from(photo.data, 'base64'));
}
