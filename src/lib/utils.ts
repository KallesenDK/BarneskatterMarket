import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple money formatter (DKK)
export function formatMoney(amount: number) {
  return amount.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' });
}

// Simple relative date formatter
export function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'i dag';
  if (diffDays === 1) return 'i går';
  if (diffDays > 1) return `${diffDays} dage siden`;
  if (diffDays === -1) return 'i morgen';
  if (diffDays < -1) return `om ${-diffDays} dage`;
  return date.toLocaleDateString('da-DK');
}
