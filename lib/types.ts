export type UserRole = 'admin' | 'regular';

export interface User {
  username: string;
  password: string; // hashed
  role: UserRole;
}

export interface AuthConfig {
  users: User[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface PrintOptions {
  copies: number;
  color: 'color' | 'monochrome';
  paperSize: string;
  orientation: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  scaling?: number; // percentage
  quality?: 'draft' | 'normal' | 'high';
}

export interface Printer {
  name: string;
  description?: string;
  status?: string;
  options?: Record<string, string>;
}

export interface PrintJob {
  filePath: string;
  printerName: string;
  options: PrintOptions;
}

