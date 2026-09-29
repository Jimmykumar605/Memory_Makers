import fs from "fs";
import path from "path";
import { UserAccount } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function ensureFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([]), "utf8");
    }
  } catch (err) {
    console.warn("Could not initialize server user store directory:", err);
  }
}

export function getServerUsers(): UserAccount[] {
  try {
    ensureFile();
    if (!fs.existsSync(USERS_FILE)) return [];
    const raw = fs.readFileSync(USERS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function findServerUserByEmail(email: string): UserAccount | undefined {
  const users = getServerUsers();
  const norm = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === norm);
}

export function saveServerUser(user: UserAccount): void {
  try {
    ensureFile();
    const users = getServerUsers();
    const index = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (index >= 0) {
      users[index] = { ...users[index], ...user };
    } else {
      users.push(user);
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save user to server store:", err);
  }
}
