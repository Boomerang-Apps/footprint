/**
 * PayPlus IP Whitelisting
 *
 * Defense-in-depth layer for webhook verification.
 * Checks incoming webhook IPs against a configurable whitelist.
 * Supports exact IP matching and CIDR range matching.
 */

/**
 * Reads whitelisted IPs from PAYPLUS_WEBHOOK_IPS environment variable.
 * Returns empty array if not configured (allows all IPs in dev mode).
 */
export function getWhitelistedIPs(): string[] {
  const ips = process.env.PAYPLUS_WEBHOOK_IPS;
  if (!ips) return [];
  return ips
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);
}

/**
 * Parses an IPv4 address string to a 32-bit unsigned integer.
 */
function ipToInt(ip: string): number {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return -1;
  }
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

/**
 * Checks if an IP matches a CIDR range (e.g., 192.168.1.0/24).
 */
function matchesCIDR(ip: string, cidr: string): boolean {
  const [network, prefixStr] = cidr.split('/');
  const prefix = parseInt(prefixStr, 10);
  if (isNaN(prefix) || prefix < 0 || prefix > 32) return false;

  const ipInt = ipToInt(ip);
  const networkInt = ipToInt(network);
  if (ipInt === -1 || networkInt === -1) return false;

  const mask = prefix === 0 ? 0 : ((-1 << (32 - prefix)) >>> 0);
  return (ipInt & mask) === (networkInt & mask);
}

/**
 * Checks if a client IP is in the PayPlus whitelist.
 * Supports exact match and CIDR notation.
 */
export function isPayPlusIP(clientIP: string): boolean {
  const whitelist = getWhitelistedIPs();
  if (whitelist.length === 0) return true;

  for (const entry of whitelist) {
    if (entry.includes('/')) {
      if (matchesCIDR(clientIP, entry)) return true;
    } else {
      if (clientIP === entry) return true;
    }
  }

  return false;
}

/**
 * Extracts the client IP from request headers.
 * Tries X-Forwarded-For (first entry), then X-Real-IP.
 * Returns null if neither header is present.
 */
export function extractClientIP(request: Request): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }

  return null;
}
