
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export type RepeatType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  date: string;      // YYYY-MM-DD
  location?: string;
  repeat: RepeatType;
  notificationMinutes?: number;
}

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  deadline?: string;
  progress: number; // 0-100
  completed: boolean;
  workedToday: boolean;
  history: { timestamp: number; progress: number }[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  progress: number;
  milestones: { id: string; title: string; completed: boolean }[];
  resources: { id: string; name: string; url: string }[];
}

export interface ResourceItem {
  id: string;
  type: 'FILE' | 'LINK';
  name: string;
  url: string;
  folderId?: string;
}

export interface Folder {
  id: string;
  name: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  image?: string;
  link?: string;
  category: string;
  price?: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: number;
  description: string;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
}
