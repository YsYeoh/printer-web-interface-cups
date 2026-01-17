import fs from 'fs-extra';
import path from 'path';
import { randomBytes } from 'crypto';

const TEMP_DIR = path.join(process.cwd(), 'temp');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Ensure temp directory exists
export async function ensureTempDir() {
  await fs.ensureDir(TEMP_DIR);
}

// Generate unique filename
function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);
  const random = randomBytes(8).toString('hex');
  const timestamp = Date.now();
  return `${baseName}_${timestamp}_${random}${ext}`;
}

// Save uploaded file
export async function saveUploadedFile(
  file: File | Buffer,
  originalName: string
): Promise<string> {
  await ensureTempDir();
  
  const filename = generateUniqueFilename(originalName);
  const filePath = path.join(TEMP_DIR, filename);
  
  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error('File size exceeds maximum limit');
    }
    
    await fs.writeFile(filePath, buffer);
  } else {
    if (file.length > MAX_FILE_SIZE) {
      throw new Error('File size exceeds maximum limit');
    }
    await fs.writeFile(filePath, file);
  }
  
  return filePath;
}

// Delete file
export async function deleteFile(filePath: string): Promise<void> {
  try {
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}

// Get file info
export async function getFileInfo(filePath: string) {
  const stats = await fs.stat(filePath);
  return {
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
  };
}

// Clean old files (older than 1 hour)
export async function cleanOldFiles(): Promise<void> {
  await ensureTempDir();
  
  const files = await fs.readdir(TEMP_DIR);
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  for (const file of files) {
    if (file === '.gitkeep') continue;
    
    const filePath = path.join(TEMP_DIR, file);
    const stats = await fs.stat(filePath);
    
    if (now - stats.birthtime.getTime() > oneHour) {
      await deleteFile(filePath);
    }
  }
}

