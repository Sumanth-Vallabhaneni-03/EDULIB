require('dotenv').config();
const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect(process.env.mongo_url);
  const result = await mongoose.connection.db.collection('users').updateMany(
    { role: { $in: ['admin', 'librarian'] } },
    { $set: { status: 'active' } }
  );
  console.log('Updated', result.modifiedCount, 'admin/librarian accounts to active');
  process.exit(0);
}

fix().catch(e => { console.error(e.message); process.exit(1); });
