/**
 * Mock/Pinata compatible IPFS storage adapter.
 * Generates an ipfs:// CID URI for certificate/product metadata.
 */

export interface ProductMetadata {
  name: string;
  description: string;
  productId: string;
  certificateId: string;
  certificateHash: string;
  manufacturer: string;
  image?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

export function uploadToIPFS(metadata: Record<string, any>): string {
  const hashString = JSON.stringify(metadata) + Date.now().toString();
  const mockCid = "Qm" + Array.from(hashString)
    .map((c) => c.charCodeAt(0).toString(16))
    .join("")
    .slice(0, 44);
  return `ipfs://${mockCid}`;
}

export function getIPFSGatewayURL(ipfsUri: string): string {
  if (!ipfsUri) return "/placeholder.png";
  if (ipfsUri.startsWith("http://") || ipfsUri.startsWith("https://")) {
    return ipfsUri;
  }
  const cid = ipfsUri.replace("ipfs://", "");
  return `https://ipfs.io/ipfs/${cid}`;
}
