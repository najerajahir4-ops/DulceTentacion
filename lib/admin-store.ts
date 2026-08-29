import fs from "fs";
import path from "path";
import os from "os";
import bcrypt from "bcryptjs";

export interface AdminData {
  username: string;
  passwordHash: string;
  updatedAt: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "admin.json");
const TMP_FILE = path.join(os.tmpdir(), "admin.json");

// Default initial password: Admin123!
// Generated with bcrypt.hashSync("Admin123!", 10)
const DEFAULT_PASSWORD_HASH = "$2a$10$7R9O9Wn8bN6P6W3gQZ1.E.B0Z1726aZqK7r47K8oR1pI99sT964iq"; // Placeholder or generated at init

let memoryAdminCache: AdminData | null = null;

function ensureDataDirectory() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function getAdminData(): AdminData {
  if (memoryAdminCache) {
    return memoryAdminCache;
  }

  let loadedData: Partial<AdminData> | null = null;
  let dataMtime = 0;
  let tmpMtime = 0;

  try {
    if (fs.existsSync(DATA_FILE)) {
      dataMtime = fs.statSync(DATA_FILE).mtimeMs;
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      loadedData = JSON.parse(content);
    }
  } catch (error) {
    console.error("Error reading data admin file:", error);
  }

  try {
    if (fs.existsSync(TMP_FILE)) {
      tmpMtime = fs.statSync(TMP_FILE).mtimeMs;
      if (tmpMtime >= dataMtime) {
        const content = fs.readFileSync(TMP_FILE, "utf-8");
        loadedData = { ...loadedData, ...JSON.parse(content) };
      }
    }
  } catch (error) {
    console.error("Error reading tmp admin file:", error);
  }

  if (loadedData && loadedData.username && loadedData.passwordHash) {
    const admin: AdminData = {
      username: loadedData.username,
      passwordHash: loadedData.passwordHash,
      updatedAt: loadedData.updatedAt || new Date().toISOString(),
    };
    memoryAdminCache = admin;
    return admin;
  }

  // If no admin credentials exist yet, initialize with default hashed password
  const initialHash = bcrypt.hashSync("Admin123!", 10);
  const defaultAdmin: AdminData = {
    username: "admin",
    passwordHash: initialHash,
    updatedAt: new Date().toISOString(),
  };

  saveAdminData(defaultAdmin);
  memoryAdminCache = defaultAdmin;
  return defaultAdmin;
}

function saveAdminData(data: AdminData) {
  // 1. Save to local data folder
  try {
    ensureDataDirectory();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    // Read-only filesystem on Vercel
  }

  // 2. Save to /tmp directory
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing admin data to tmp:", error);
  }
}

export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  const admin = getAdminData();
  if (admin.username !== username.trim()) {
    return false;
  }
  return await bcrypt.compare(password, admin.passwordHash);
}

export async function updateAdminPassword(newPassword: string): Promise<boolean> {
  if (!newPassword || newPassword.length < 6) {
    throw new Error("La nueva contraseña debe tener al menos 6 caracteres.");
  }

  const current = getAdminData();
  const newHash = await bcrypt.hash(newPassword, 10);
  const updated: AdminData = {
    ...current,
    passwordHash: newHash,
    updatedAt: new Date().toISOString(),
  };

  memoryAdminCache = updated;
  saveAdminData(updated);
  return true;
}

export function getAdminProfile(): { username: string; updatedAt: string } {
  const admin = getAdminData();
  return {
    username: admin.username,
    updatedAt: admin.updatedAt,
  };
}
