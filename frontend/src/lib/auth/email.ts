const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "10minutemail.com",
  "tempmail.com",
  "guerrillamail.com",
  "yopmail.com",
  "fakeinbox.com",
  "trashmail.com",
  "temp-mail.org",
  "getnada.com",
  "dispostable.com",
  "maildrop.cc",
  "sharklasers.com",
]);

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  const normalized = normalizeEmail(email);
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  if (!regex.test(normalized)) return false;
  const domain = normalized.split("@")[1];
  if (!domain) return false;
  if (DISPOSABLE_DOMAINS.has(domain)) return false;
  return true;
}
