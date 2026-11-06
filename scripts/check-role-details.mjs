// Checks how a role's details are read (src/content/role-details.ts).
//
//   node scripts/check-role-details.mjs
import assert from "node:assert/strict";
import { createJiti } from "jiti";

const { roleDetails } = await createJiti(import.meta.url).import("../src/content/role-details.ts");

assert.deepEqual(
  roleDetails(
    "Skills:\n- AutoCAD\n  - Revit\n\nPay: competitive\n₹35,000 – ₹60,000 per month\n- Bonus",
  ),
  [
    { kind: "heading", text: "Skills:" },
    { kind: "list", items: ["AutoCAD", "Revit"] },
    // A colon inside the line is not a heading.
    { kind: "paragraph", text: "Pay: competitive" },
    { kind: "paragraph", text: "₹35,000 – ₹60,000 per month" },
    { kind: "list", items: ["Bonus"] },
  ],
);
// A hyphen without a space is text, not a list item.
assert.deepEqual(roleDetails("-3 years"), [{ kind: "paragraph", text: "-3 years" }]);
assert.deepEqual(roleDetails(""), []);
console.log("role details: ok");
