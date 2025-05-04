import dotenv from "dotenv";
dotenv.config({});

const isOnline = process.env.CFY_is_db_online;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Online MongoDB URI is not defined in environment variables");
}

export default process.env;
