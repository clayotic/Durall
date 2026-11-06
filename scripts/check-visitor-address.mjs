// Checks that the spam limits count visitors, not Cloudflare (src/server/cloudflare.ts):
// CF-Connecting-IP is believed only from Cloudflare's own addresses.
//
//   node scripts/check-visitor-address.mjs
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const { visitorAddress } = await createJiti(import.meta.url).import("../src/server/cloudflare.ts");

// Through Cloudflare: the visitor named by Cloudflare.
assert.equal(visitorAddress("172.68.10.4", "49.36.1.2"), "49.36.1.2");
assert.equal(visitorAddress("2400:cb00:1::5", "2401:4900::9"), "2401:4900::9");
// Straight to Netlify: a claimed address is ignored.
assert.equal(visitorAddress("49.36.1.2", "1.1.1.1"), "49.36.1.2");
// Through Cloudflare without the header, or with junk in it: Cloudflare's address.
assert.equal(visitorAddress("172.68.10.4", undefined), "172.68.10.4");
assert.equal(visitorAddress("172.68.10.4", "not-an-ip"), "172.68.10.4");
// Nothing recorded: nothing to go on.
assert.equal(visitorAddress(undefined, "49.36.1.2"), undefined);
console.log("visitor address: ok");
