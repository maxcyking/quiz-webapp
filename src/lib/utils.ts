import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { enableNetwork, disableNetwork } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Timestamp } from 'firebase/firestore';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isOnline(): boolean {
  return typeof window !== 'undefined' ? navigator.onLine : true;
}

let networkHandlerInProgress = false;
let networkRetryTimeout: NodeJS.Timeout | null = null;

export async function handleNetworkStatus(online: boolean) {
  if (networkHandlerInProgress || typeof window === 'undefined') return;

  try {
    networkHandlerInProgress = true;

    // Clear any existing retry timeout
    if (networkRetryTimeout) {
      clearTimeout(networkRetryTimeout);
      networkRetryTimeout = null;
    }

    if (online) {
      try {
        await enableNetwork(db);
      } catch (error) {
        console.warn('Failed to enable network, retrying in 5 seconds...');
        // Retry enabling network after 5 seconds
        networkRetryTimeout = setTimeout(() => {
          handleNetworkStatus(true);
        }, 5000);
      }
    } else {
      await disableNetwork(db);
    }
  } catch (error) {
    console.error('Error handling network status:', error);
  } finally {
    networkHandlerInProgress = false;
  }
}

export function handleFirebaseError(error: any): string {
  if (!error) return 'An unknown error occurred';

  // Network related errors
  if (!isOnline()) {
    return 'You are currently offline. Please check your internet connection.';
  }

  // Firebase specific errors
  switch (error.code) {
    case 'unavailable':
      return 'The service is currently unavailable. Please try again later.';
    case 'permission-denied':
      return 'You do not have permission to perform this action.';
    case 'unauthenticated':
      return 'Please log in to continue.';
    case 'not-found':
      return 'The requested resource was not found.';
    case 'already-exists':
      return 'This resource already exists.';
    case 'failed-precondition':
      return 'The operation failed due to a precondition.';
    case 'cancelled':
      return 'The operation was cancelled.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
}

export function convertFirebaseTimestamp(timestamp: any): Date | null {
  if (!timestamp) return null;
  
  try {
    // If it's already a Date object, return it
    if (timestamp instanceof Date) return timestamp;
    
    // If it's a Firebase Timestamp, convert it to Date
    if (timestamp instanceof Timestamp) return timestamp.toDate();
    
    // If it's a number (seconds or milliseconds since epoch)
    if (typeof timestamp === 'number') {
      // Check if it's seconds (Firebase) or milliseconds (JavaScript)
      const date = new Date(timestamp * (timestamp < 10000000000 ? 1000 : 1));
      return isNaN(date.getTime()) ? null : date;
    }
    
    // If it's an ISO string or any other date string
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // If it's a Firebase timestamp object but not an instance
    if (timestamp?.seconds !== undefined) {
      const date = new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
      return isNaN(date.getTime()) ? null : date;
    }
    
    return null;
  } catch (error) {
    console.error("Error converting timestamp:", error, timestamp);
    return null;
  }
}

// Format a date with a consistent format
export function formatDate(date: Date | null, options: Intl.DateTimeFormatOptions = {}): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Date not available';
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    ...options
  };

  return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
}

// Format a duration in seconds to a human-readable string
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

// Format a file size in bytes to a human-readable string
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Debounce a function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Throttle a function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Generate a random string
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

// Deep clone an object
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as any;
  }

  const clonedObj = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }

  return clonedObj;
}