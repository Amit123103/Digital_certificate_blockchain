import { ethers } from "ethers";

/**
 * Calculates Keccak-256 cryptographic hash of a text string or Buffer.
 */
export function calculateKeccak256(data: string | Uint8Array): string {
  if (typeof data === "string") {
    return ethers.keccak256(ethers.toUtf8Bytes(data));
  }
  return ethers.keccak256(data);
}

/**
 * Generates a unique Certificate ID formatted like CERT-YYYY-XXXX.
 */
export function generateCertificateId(): string {
  const year = new Date().getFullYear();
  const randomHex = Math.floor(1000 + Math.random() * 9000);
  return `CERT-${year}-${randomHex}`;
}

/**
 * Generates a unique Product ID formatted like PROD-YYYY-XXXX.
 */
export function generateProductId(): string {
  const year = new Date().getFullYear();
  const randomHex = Math.floor(1000 + Math.random() * 9000);
  return `PROD-${year}-${randomHex}`;
}
