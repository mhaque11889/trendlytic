import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../db/connection';
import { UserModel } from '../models/User';

async function main() {
  await connectToDatabase();
  const email = process.env.ADMIN_EMAIL || 'admin@trendlytic.local';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';
  const existing = await UserModel.findOne({ email });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log('Admin already exists:', email);
    process.exit(0);
  }
  const password_hash = await bcrypt.hash(password, 10);
  await UserModel.create({ email, password_hash, role: 'admin', name: 'Administrator' });
  // eslint-disable-next-line no-console
  console.log('Admin created:', email);
  process.exit(0);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});


