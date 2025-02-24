import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';

// Default timezone for the app
export const DEFAULT_TIMEZONE = 'America/New_York';

/**
 * Convert a local datetime to UTC
 * @param {Date|string} dateTime - Local date time
 * @returns {string} - UTC ISO string
 */
export const localToUTC = (dateTime) => {
  const date = new Date(dateTime);
  return date.toISOString();
};

/**
 * Convert UTC datetime to local time
 * @param {string} utcDateTime - UTC datetime string
 * @returns {Date} - Local date object
 */
export const utcToLocal = (utcDateTime) => {
  return new Date(utcDateTime);
};

/**
 * Format a datetime string for display, always in user's timezone
 * @param {string} dateTime - The datetime string to format
 * @param {Object} options - Display options
 * @returns {string} - Formatted date string
 */
export const formatDateTime = (dateTime, options = {}) => {
  const date = new Date(dateTime);
  return date.toLocaleString('en-US', {
    timeZone: DEFAULT_TIMEZONE,
    ...options
  });
};

/**
 * Get the start of day in local time, converted to UTC for database queries
 * @returns {string} - UTC ISO string for start of current day
 */
export const getStartOfDay = () => {
  const now = new Date();
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0, 0, 0
  );
  return localToUTC(startOfDay);
};

/**
 * Get the end of day in local time, converted to UTC for database queries
 * @returns {string} - UTC ISO string for end of current day
 */
export const getEndOfDay = () => {
  const now = new Date();
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23, 59, 59, 999
  );
  return localToUTC(endOfDay);
};

/**
 * Check if a UTC datetime is in the future
 * @param {string} utcDateTime - UTC datetime string
 * @returns {boolean}
 */
export const isFutureDate = (utcDateTime) => {
  const localDate = utcToLocal(utcDateTime);
  return localDate > new Date();
};

/**
 * Format time for display (e.g., "3:30 PM")
 * @param {string} dateTime - The datetime string
 * @returns {string}
 */
export const formatTime = (dateTime) => {
  return formatDateTime(dateTime, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format date for display (e.g., "Feb 24")
 * @param {string} dateTime - The datetime string
 * @returns {string}
 */
export const formatDate = (dateTime) => {
  return formatDateTime(dateTime, {
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format weekday for display (e.g., "Mon")
 * @param {string} dateTime - The datetime string
 * @returns {string}
 */
export const formatWeekday = (dateTime) => {
  return formatDateTime(dateTime, {
    weekday: 'short'
  });
};
