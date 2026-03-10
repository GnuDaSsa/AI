import { MongoClient } from 'mongodb';

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI 환경변수가 설정되지 않았습니다.');

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri).connect();
    }
    return global._mongoClientPromise;
  }
  return new MongoClient(uri).connect();
}

export async function getCollection(dbName: string, collectionName: string) {
  const client = await getClientPromise();
  return client.db(dbName).collection(collectionName);
}

export async function getSetting(key: string): Promise<string | null> {
  try {
    const col = await getCollection('settings_db', 'settings');
    const doc = await col.findOne({ key });
    return doc?.value ?? null;
  } catch {
    return null;
  }
}
