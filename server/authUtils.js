import crypto from 'crypto';

/**
 * Hashes a plain-text password using SHA-512 PBKDF2 with a random 16-byte salt.
 * Returns formatted string `salt:hash`.
 */
export function hashPassword(password) {
  if (!password) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a plain-text password against a stored hashed password.
 * Supports legacy plain-text fallback for backward compatibility, with primary verification using PBKDF2 salt:hash.
 */
export function verifyPassword(password, storedPasswordHash) {
  if (!password || !storedPasswordHash) return false;

  const parts = storedPasswordHash.split(':');
  if (parts.length !== 2) {
    // Fallback for unhashed legacy plain-text passwords
    return password === storedPasswordHash;
  }

  const [salt, originalHash] = parts;
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
  } catch (err) {
    return false;
  }
}

export default {
  hashPassword,
  verifyPassword
};
