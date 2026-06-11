import { query } from './src/config/db.js';

async function main() {
  try {
    await query("ALTER TYPE participant_status ADD VALUE 'pending_partner'");
    console.log("Added pending_partner");
  } catch (e) {
    if (e.code === '42710') {
      console.log("Value already exists");
    } else {
      console.error(e);
    }
  }
  process.exit(0);
}
main();
