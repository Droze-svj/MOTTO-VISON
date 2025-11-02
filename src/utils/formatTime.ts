/**
 * Time formatting utilities
 * Formats timestamps into human-readable "time ago" format
 */

/**
 * Format timestamp to "time ago" string
 * Examples: "just now", "5 min ago", "2 hours ago", "Yesterday", "Jan 15"
 */
export const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // Just now (less than 10 seconds)
  if (seconds < 10) {
    return 'just now';
  }

  // Seconds ago (less than 1 minute)
  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  // Minutes ago (less than 1 hour)
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  // Hours ago (less than 24 hours)
  if (hours < 24) {
    return `${hours}h ago`;
  }

  // Days ago (less than 7 days)
  if (days < 7) {
    return `${days}d ago`;
  }

  // More than a week - show date
  const messageDate = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if it's yesterday
  if (
    messageDate.getDate() === yesterday.getDate() &&
    messageDate.getMonth() === yesterday.getMonth() &&
    messageDate.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Yesterday';
  }

  // Same year - show month and day
  if (messageDate.getFullYear() === today.getFullYear()) {
    return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Different year - show full date
  return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Format timestamp to time string (e.g., "2:30 PM")
 */
export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format timestamp to date and time string (e.g., "Jan 15, 2024 at 2:30 PM")
 */
export const formatDateTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Check if timestamp is from today
 */
export const isToday = (timestamp: number): boolean => {
  const today = new Date();
  const messageDate = new Date(timestamp);
  
  return (
    messageDate.getDate() === today.getDate() &&
    messageDate.getMonth() === today.getMonth() &&
    messageDate.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if timestamp is from yesterday
 */
export const isYesterday = (timestamp: number): boolean => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const messageDate = new Date(timestamp);
  
  return (
    messageDate.getDate() === yesterday.getDate() &&
    messageDate.getMonth() === yesterday.getMonth() &&
    messageDate.getFullYear() === yesterday.getFullYear()
  );
};

export default {
  formatTimeAgo,
  formatTime,
  formatDateTime,
  isToday,
  isYesterday,
};

