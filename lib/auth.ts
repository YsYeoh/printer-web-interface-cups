import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs-extra';
import path from 'path';
import { User, AuthConfig, UserRole } from './types';

const AUTH_CONFIG_PATH = path.join(process.cwd(), 'config', 'auth.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

// Ensure config directory exists
async function ensureConfigDir() {
  const configDir = path.dirname(AUTH_CONFIG_PATH);
  await fs.ensureDir(configDir);
}

// Read auth config
export async function readAuthConfig(): Promise<AuthConfig> {
  await ensureConfigDir();
  
  if (!(await fs.pathExists(AUTH_CONFIG_PATH))) {
    // Create default config with admin user
    const defaultConfig: AuthConfig = {
      users: [
        {
          username: 'admin',
          password: await bcrypt.hash('admin', 10),
          role: 'admin',
        },
      ],
    };
    await writeAuthConfig(defaultConfig);
    return defaultConfig;
  }
  
  const data = await fs.readJson(AUTH_CONFIG_PATH);
  return data as AuthConfig;
}

// Write auth config
export async function writeAuthConfig(config: AuthConfig): Promise<void> {
  await ensureConfigDir();
  await fs.writeJson(AUTH_CONFIG_PATH, config, { spaces: 2 });
}

// Validate user credentials
export async function validateUser(
  username: string,
  password: string
): Promise<User | null> {
  const config = await readAuthConfig();
  const user = config.users.find((u) => u.username === username);
  
  if (!user) {
    return null;
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return null;
  }
  
  return user;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Generate JWT token
export function generateToken(username: string, role: UserRole): string {
  return jwt.sign({ username, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

// Verify JWT token
export function verifyToken(token: string): { username: string; role: UserRole } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string; role: UserRole };
    return decoded;
  } catch (error) {
    return null;
  }
}

// Get user from token
export async function getUserFromToken(token: string): Promise<User | null> {
  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }
  
  const config = await readAuthConfig();
  const user = config.users.find((u) => u.username === decoded.username);
  return user || null;
}

// Check if user is admin
export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}

// Add user
export async function addUser(
  username: string,
  password: string,
  role: UserRole
): Promise<void> {
  const config = await readAuthConfig();
  
  if (config.users.some((u) => u.username === username)) {
    throw new Error('User already exists');
  }
  
  const hashedPassword = await hashPassword(password);
  config.users.push({
    username,
    password: hashedPassword,
    role,
  });
  
  await writeAuthConfig(config);
}

// Update user
export async function updateUser(
  username: string,
  updates: { password?: string; role?: UserRole }
): Promise<void> {
  const config = await readAuthConfig();
  const userIndex = config.users.findIndex((u) => u.username === username);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  if (updates.password) {
    config.users[userIndex].password = await hashPassword(updates.password);
  }
  
  if (updates.role) {
    config.users[userIndex].role = updates.role;
  }
  
  await writeAuthConfig(config);
}

// Delete user
export async function deleteUser(username: string): Promise<void> {
  const config = await readAuthConfig();
  config.users = config.users.filter((u) => u.username !== username);
  await writeAuthConfig(config);
}

