import { createDecipheriv } from "node:crypto";

const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

export function decryptAesGcm(encryptedBase64, keyBase64, aad) {
  const decoded = Buffer.from(encryptedBase64, "base64");
  const key = Buffer.from(keyBase64, "base64");

  const iv = decoded.subarray(0, IV_LENGTH);
  const authTag = decoded.subarray(decoded.length - AUTH_TAG_LENGTH);
  const ciphertext = decoded.subarray(IV_LENGTH, decoded.length - AUTH_TAG_LENGTH);

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  decipher.setAAD(Buffer.from(aad));

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

export function decryptField(value) {
  if (!value) return null;
  const key = process.env.TOSS_DECRYPT_KEY;
  const aad = process.env.TOSS_DECRYPT_AAD;
  if (!key || !aad) return null;
  try {
    return decryptAesGcm(value, key, aad);
  } catch (error) {
    console.warn("decrypt_field_failed", error?.message);
    return null;
  }
}
