// Types for Monolith Life OS

export type PriorityType = 'LOW' | 'MEDIUM' | 'HIGH';
export type RepeatType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type CalendarView = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  repeat?: RepeatType;
}

export interface Task {
  id: string;
  title: string;
  priority: PriorityType;
  completed: boolean;
  progress: number;
  date?: string; // Associated date for scheduling
  createdAt: string; // When the task was initialized
  completedAt?: string; // ISO Date of completion
  workHistory?: Record<string, boolean>; // Log of days worked on: { 'YYYY-MM-DD': true }
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string;
  timestamp: number;
  description?: string;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
}

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  category: string;
  link: string;
  image: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  progress: number;
  milestones: any[];
  resources: any[];
}

export interface ResourceItem {
  id: string;
  name: string;
  url: string;
  type: 'LINK' | 'FILE';
}

export interface Folder {
  id: string;
  name: string;
}

export interface PasswordEntry {
  id: string;
  site: string;
  username: string;
  password?: string;
  notes?: string;
}
