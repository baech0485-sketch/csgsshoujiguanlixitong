import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "shoujiguanli";

if (!uri) {
  throw new Error("缺少 MONGODB_URI 环境变量");
}

const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: Promise<MongoClient>;
};

function getMongoUri() {
  if (!uri) {
    throw new Error("缺少 MONGODB_URI 环境变量");
  }

  if (uri.includes("authSource=")) {
    return uri;
  }

  const separator = uri.includes("?") ? "&" : "?";
  return `${uri}${separator}authSource=admin`;
}

function createMongoClient() {
  return new MongoClient(getMongoUri(), {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
}

export async function getDatabase() {
  if (!globalForMongo.mongoClient) {
    const client = createMongoClient();
    globalForMongo.mongoClient = client.connect();
  }

  const client = await globalForMongo.mongoClient;
  return client.db(dbName);
}

export async function getDevicesCollection() {
  const db = await getDatabase();
  return db.collection("devices");
}

export async function getApprovalsCollection() {
  const db = await getDatabase();
  return db.collection("approvals");
}

export async function getAdminUsersCollection() {
  const db = await getDatabase();
  return db.collection("admin_users");
}

export async function getEmployeesCollection() {
  const db = await getDatabase();
  return db.collection("employees");
}

export async function getIncidentsCollection() {
  const db = await getDatabase();
  return db.collection("incidents");
}

export async function getOffboardingCollection() {
  const db = await getDatabase();
  return db.collection("offboarding");
}

export async function getDeviceEventsCollection() {
  const db = await getDatabase();
  return db.collection("device_events");
}
