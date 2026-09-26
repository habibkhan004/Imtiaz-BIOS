import { readFileSync } from "fs";
import { resolve } from "path";
import mongoose from "mongoose";

for (const line of readFileSync(resolve(".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const uri = process.env.MONGODB_URI || "";
const masked = uri.replace(/:([^:@/]+)@/, ":****@");

console.log("URI (masked):", masked);
console.log("Has mongodb+srv:", uri.startsWith("mongodb+srv://"));
console.log("DB name in path:", uri.match(/\.net\/([^?]+)/)?.[1] || "(none)");

const user = uri.match(/mongodb\+srv:\/\/([^:]+):/)?.[1];
const pass = uri.match(/mongodb\+srv:\/\/[^:]+:([^@]+)@/)?.[1];
console.log("Username from URI:", user);
console.log("Password length:", pass?.length ?? 0);
console.log("Password is digits-only:", /^\d+$/.test(pass || ""));

async function tryConnect(label, connectionUri) {
  console.log("\n---", label, "---");
  try {
    await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 20000,
    });
    console.log("SUCCESS connected to db:", mongoose.connection.name);
    await mongoose.connection.db?.admin().command({ ping: 1 });
    console.log("PING ok");
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.log("FAIL:", err.message);
    console.log("code:", err.code, err.codeName);
    try {
      await mongoose.disconnect();
    } catch {
      /* ignore */
    }
    return false;
  }
}

await tryConnect("as-is from .env.local", uri);

if (user && pass) {
  const withAuthSource = uri.includes("authSource=")
    ? uri
    : `${uri}${uri.includes("?") ? "&" : "?"}authSource=admin`;
  await tryConnect("with authSource=admin", withAuthSource);
}

process.exit(0);
