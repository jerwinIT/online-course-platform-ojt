/**
 * Shared auth validation (client + server). No regex for email that blocks
 * valid addresses; we keep it simple: non-empty and contains @ and a dot.
 */
const EMAIL_MIN_LENGTH = 3;
const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const NAME_MIN_LENGTH = 1;
const NAME_MAX_LENGTH = 100;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): { ok: true } | { ok: false; error: string } {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return { ok: false, error: "Email is required." };
  if (trimmed.length < EMAIL_MIN_LENGTH) return { ok: false, error: "Email is too short." };
  if (trimmed.length > EMAIL_MAX_LENGTH) return { ok: false, error: "Email is too long." };
  if (!EMAIL_REGEX.test(trimmed)) return { ok: false, error: "Please enter a valid email address." };
  return { ok: true };
}

export function validatePassword(value: string): { ok: true } | { ok: false; error: string } {
  if (!value) return { ok: false, error: "Password is required." };
  if (value.length < PASSWORD_MIN_LENGTH)
    return { ok: false, error: "Password must be at least 8 characters." };
  if (value.length > PASSWORD_MAX_LENGTH)
    return { ok: false, error: "Password must be at most 128 characters." };
  if (!/[A-Z]/.test(value))
    return { ok: false, error: "Password must contain at least one uppercase letter." };
  if (!/[a-z]/.test(value))
    return { ok: false, error: "Password must contain at least one lowercase letter." };
  if (!/[0-9]/.test(value))
    return { ok: false, error: "Password must contain at least one number." };
  return { ok: true };
}

export function validateLoginPassword(value: string): { ok: true } | { ok: false; error: string } {
  if (!value) return { ok: false, error: "Password is required." };
  if (value.length < PASSWORD_MIN_LENGTH)
    return { ok: false, error: "Password must be at least 8 characters." };
  return { ok: true };
}

export function validateName(value: string): { ok: true } | { ok: false; error: string } {
  const trimmed = value.trim();
  if (!trimmed) return { ok: false, error: "Name is required." };
  if (trimmed.length < NAME_MIN_LENGTH) return { ok: false, error: "Name is required." };
  if (trimmed.length > NAME_MAX_LENGTH)
    return { ok: false, error: "Name must be at most 100 characters." };
  return { ok: true };
}

export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): { ok: true } | { ok: false; error: string } {
  if (password !== confirmPassword) return { ok: false, error: "Passwords do not match." };
  return { ok: true };
}
