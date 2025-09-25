import { v4 as uuidv4 } from 'uuid';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return uuidv4();
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('it-IT');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

export function getRiskCategory(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (score <= 30) return 'LOW';
  if (score <= 70) return 'MEDIUM';
  return 'HIGH';
}

export function getRiskColor(score: number): string {
  if (score <= 30) return 'text-green-600';
  if (score <= 70) return 'text-yellow-600';
  return 'text-red-600';
}

export function getRiskBgColor(score: number): string {
  if (score <= 30) return 'bg-green-100';
  if (score <= 70) return 'bg-yellow-100';
  return 'bg-red-100';
}