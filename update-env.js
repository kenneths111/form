#!/usr/bin/env node

/**
 * Helper script to update .env.local file
 * Usage: node update-env.js <NEW_CONNECTION_STRING>
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("\n📝 Current .env.local contents:\n");
  try {
    const envPath = path.join(__dirname, ".env.local");
    const content = fs.readFileSync(envPath, "utf-8");
    console.log(content);
    console.log("\n---");
    console.log('Usage: node update-env.js "postgresql://user:pass@host/db"');
  } catch (error) {
    console.error("Error reading .env.local:", error.message);
  }
  process.exit(0);
}

const newConnectionString = args[0];

// Validate it looks like a postgres connection string
if (!newConnectionString.startsWith("postgresql://")) {
  console.error("❌ Error: Connection string must start with postgresql://");
  process.exit(1);
}

const envContent = `# Database connection strings
DATABASE_URL=${newConnectionString}
POSTGRES_URL=${newConnectionString}

# Other environment variables (copy from Neon dashboard if provided)
`;

const envPath = path.join(__dirname, ".env.local");

try {
  fs.writeFileSync(envPath, envContent, "utf-8");
  console.log("✅ Successfully updated .env.local");
  console.log("\n📝 New contents:");
  console.log(envContent);
  console.log("\n✅ Next steps:");
  console.log(
    "1. Visit http://localhost:3000/api/init-db to initialize the database"
  );
  console.log("2. Run: npm run import-responses");
} catch (error) {
  console.error("❌ Error writing .env.local:", error.message);
  process.exit(1);
}
