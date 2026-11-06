import { BlockList, isIP } from "node:net";

/* Cloudflare's own addresses, from https://www.cloudflare.com/ips/ (November 2026). */
// ponytail: a fixed copy of Cloudflare's list. It rarely changes; if it does,
// visitors behind a new range are counted by Cloudflare's address instead of
// their own (sharing one spam limit) until this list is updated.
const RANGES = [
  "173.245.48.0/20",
  "103.21.244.0/22",
  "103.22.200.0/22",
  "103.31.4.0/22",
  "141.101.64.0/18",
  "108.162.192.0/18",
  "190.93.240.0/20",
  "188.114.96.0/20",
  "197.234.240.0/22",
  "198.41.128.0/17",
  "162.158.0.0/15",
  "104.16.0.0/13",
  "104.24.0.0/14",
  "172.64.0.0/13",
  "131.0.72.0/22",
  "2400:cb00::/32",
  "2606:4700::/32",
  "2803:f800::/32",
  "2405:b500::/32",
  "2405:8100::/32",
  "2a06:98c0::/29",
  "2c0f:f248::/32",
];

const cloudflare = new BlockList();
for (const range of RANGES) {
  const [address = "", bits] = range.split("/");
  cloudflare.addSubnet(address, Number(bits), isIP(address) === 6 ? "ipv6" : "ipv4");
}

/**
 * The visitor's own address. durallsystems.com reaches Netlify through
 * Cloudflare, so the connection Netlify records is one of Cloudflare's,
 * shared by every visitor it passes on; Cloudflare names the visitor in
 * CF-Connecting-IP. That header is believed only when the connection really
 * is Cloudflare's, so nobody else can claim an address of their choosing.
 */
export function visitorAddress(
  connection: string | undefined,
  cloudflareSays: string | undefined,
): string | undefined {
  const kind = connection ? isIP(connection) : 0;
  const viaCloudflare = kind !== 0 && cloudflare.check(connection!, kind === 6 ? "ipv6" : "ipv4");
  return viaCloudflare && cloudflareSays && isIP(cloudflareSays) ? cloudflareSays : connection;
}
