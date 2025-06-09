import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!.padEnd(32, "0"); // must be 32 bytes
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);

  // Decode base64 key correctly
  const keyBuffer = Buffer.from(ENCRYPTION_KEY, "base64");

  if (keyBuffer.length !== 32) {
    throw new Error(`Invalid key length: expected 32 bytes, got ${keyBuffer.length}`);
  }

  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);

  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");

  const result = iv.toString("base64") + ":" + encrypted;

  console.log(`[encrypt] raw: ${text}`);
  console.log(`[encrypt] iv: ${iv.toString("base64")}`);
  console.log(`[encrypt] encrypted: ${encrypted}`);

  return result;
}

export function decrypt(text: string): string {
  console.log("🔓 [decrypt] Raw input:", text);

  if (!text || typeof text !== "string" || !text.includes(":")) {
    throw new Error(`❌ Invalid encrypted format. Expected 'iv:encrypted', got: "${text}"`);
  }

  const [ivBase64, encryptedText] = text.split(":");

  if (!ivBase64 || !encryptedText) {
    throw new Error(`❌ Missing IV or encrypted part. Got iv="${ivBase64}", encrypted="${encryptedText}"`);
  }

  const iv = Buffer.from(text, "base64");
  const keyBuffer = Buffer.from(ENCRYPTION_KEY, "base64");

  console.log("🔐 IV (base64):", ivBase64);
  console.log("🔐 Encrypted text (base64):", encryptedText);
  console.log("🔑 ENCRYPTION_KEY length (base64 decoded):", keyBuffer.length);

  if (keyBuffer.length !== 32) {
    throw new Error(`❌ Invalid ENCRYPTION_KEY length: expected 32 bytes, got ${keyBuffer.length}`);
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);

  let decrypted = decipher.update(encryptedText, "base64", "utf8");
  decrypted += decipher.final("utf8");

  console.log("✅ [decrypt] Decrypted result:", decrypted);

  return decrypted;
}

