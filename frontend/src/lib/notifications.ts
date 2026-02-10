export type NotificationType = "anomaly";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
}

const NOTIFICATIONS_KEY_PREFIX = "uniguard.notifications.";
const NOTIFIED_EMAIL_KEY_PREFIX = "uniguard.notifications.sent.";
const USER_EMAIL_KEY = "uniguard.user.email";

export function getUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(USER_EMAIL_KEY);
}

export function setUserEmail(email: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USER_EMAIL_KEY, email);
}

function notificationsKey(userId: string | null): string | null {
  if (typeof window === "undefined" || !userId) return null;
  return `${NOTIFICATIONS_KEY_PREFIX}${userId}`;
}

function sentKey(userId: string | null): string | null {
  if (typeof window === "undefined" || !userId) return null;
  return `${NOTIFIED_EMAIL_KEY_PREFIX}${userId}`;
}

/**
 * Get notifications for the current user only. Pass userId so each user sees only their own.
 */
export function getNotifications(userId: string | null): AppNotification[] {
  if (typeof window === "undefined") return [];
  const key = notificationsKey(userId);
  if (!key) return [];
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AppNotification[];
  } catch {
    return [];
  }
}

/**
 * Add a notification for the current user. Pass userId so it's stored under that user.
 */
export function addNotification(notification: AppNotification, userId: string | null) {
  if (typeof window === "undefined") return;
  const key = notificationsKey(userId);
  if (!key) return;
  const existing = getNotifications(userId);
  const deduped = existing.some((item) => item.id === notification.id)
    ? existing
    : [notification, ...existing];
  window.localStorage.setItem(key, JSON.stringify(deduped.slice(0, 100)));
}

export function wasEmailSent(notificationId: string, userId: string | null): boolean {
  if (typeof window === "undefined") return false;
  const key = sentKey(userId);
  if (!key) return false;
  const raw = window.localStorage.getItem(key);
  if (!raw) return false;
  try {
    const sent = JSON.parse(raw) as string[];
    return sent.includes(notificationId);
  } catch {
    return false;
  }
}

export function markEmailSent(notificationId: string, userId: string | null) {
  if (typeof window === "undefined") return;
  const key = sentKey(userId);
  if (!key) return;
  const raw = window.localStorage.getItem(key);
  const sent = raw ? (JSON.parse(raw) as string[]) : [];
  if (!sent.includes(notificationId)) {
    sent.push(notificationId);
    window.localStorage.setItem(key, JSON.stringify(sent.slice(-200)));
  }
}
