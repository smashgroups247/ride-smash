/**
 * Run once to create your first admin user in MongoDB.
 *
 * Usage:
 *   node scripts/create-admin.mjs <email> <password>
 *
 * Example:
 *   node scripts/create-admin.mjs admin@ridesmash.com MyStr0ngPass!
 */

import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error('Usage: node scripts/create-admin.mjs <email> <password>');
  process.exit(1);
}

if (password.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI environment variable is not set.');
  console.error('Run: $env:MONGODB_URI="your-uri"; node scripts/create-admin.mjs ...');
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db();

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await db.collection('admins').findOne({ email: normalizedEmail });
  if (existing) {
    console.log(`Admin with email "${normalizedEmail}" already exists. No changes made.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.collection('admins').insertOne({
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date(),
  });

  console.log(`✅ Admin created: ${normalizedEmail}`);
} catch (err) {
  console.error('Error creating admin:', err);
  process.exit(1);
} finally {
  await client.close();
}
