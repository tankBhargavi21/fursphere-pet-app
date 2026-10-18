import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'data', 'fursphere_local_db.json');

// Ensure data folder exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial default seed state
const initialData = {
  users: [],
  products: [],
  pets: [],
  carts: {},
  wishlists: {},
  orders: [],
  otps: {},
};

export class LocalStore {
  static load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading local db file:', e);
    }
    this.save(initialData);
    return initialData;
  }

  static save(data) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error('Error writing local db file:', e);
    }
  }

  static get(key) {
    const data = this.load();
    return data[key];
  }

  static set(key, value) {
    const data = this.load();
    data[key] = value;
    this.save(data);
  }

  static update(updater) {
    const data = this.load();
    const updated = updater(data) || data;
    this.save(updated);
    return updated;
  }
}
