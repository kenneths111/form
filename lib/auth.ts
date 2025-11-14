// Simple password protection for responses
// Store hashed password in environment variable

export function checkPassword(password: string): boolean {
  const correctPassword = process.env.RESPONSES_PASSWORD || "gst2024";
  return password === correctPassword;
}

export function hashPassword(password: string): string {
  // Simple hash for cookie storage (not cryptographic, just obfuscation)
  return Buffer.from(password).toString("base64");
}

export function verifyHash(hash: string): boolean {
  try {
    const password = Buffer.from(hash, "base64").toString("utf-8");
    return checkPassword(password);
  } catch {
    return false;
  }
}
