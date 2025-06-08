import mongoose from "mongoose";
import { env } from "./utils/env.js";
import { createServer } from "http";

import { app } from "./app.js";
import { createSocketIosServer } from "./socketio.js";
const server = createServer(app);
const io = createSocketIosServer(server);

try {
  await mongoose.connect(env.MONGODB_URI, { dbName: "Yasmeen" });
  console.log(`Connected to MongoDB with uri \n${env.MONGODB_URI}\n`);
  server.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
} catch (error) {
  console.error("Failed to connect to MongoDB:", error);
  process.exit(1);
}

export default app;
