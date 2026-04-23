/**
 * One-time script to drop the stale `userFullName_1` index
 * from the users collection.
 *
 * Run with: node scripts/fixIndexes.js
 */

require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");

async function main() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.mongo_url);

  const db = mongoose.connection.db;
  const collection = db.collection("users");

  // List current indexes
  const indexes = await collection.indexes();
  console.log("\nCurrent indexes:");
  indexes.forEach((i) => console.log(" -", i.name, "→", JSON.stringify(i.key)));

  // Drop the stale index if it exists
  const staleIndex = indexes.find((i) => i.name === "userFullName_1");
  if (staleIndex) {
    await collection.dropIndex("userFullName_1");
    console.log("\n✅ Dropped stale index: userFullName_1");
  } else {
    console.log("\nℹ️  Index userFullName_1 not found — nothing to drop.");
  }

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
