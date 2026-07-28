import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = "REMOTERELAYURI";

if (!uri || typeof uri !== 'string') {
  console.error('Invalid MongoDB URI: must be a non-empty string');
  process.exit(1);
}

let client;
try {
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
} catch (error) {
  console.error(`Failed to create MongoDB client: ${error.message}`);
  process.exit(1);
}

function provideClient() {
  if (!client) {
    console.error('MongoDB client is not initialized');
    return null;
  }
  return client;
}

export { provideClient };
