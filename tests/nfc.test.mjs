import assert from "node:assert/strict";
import { getNdefIdentifier } from "../nfc.js";

const data = new Uint8Array([2, 101, 110, ...new TextEncoder().encode("wallet:123")]);
assert.equal(getNdefIdentifier({ message: { records: [{ recordType: "text", data: new DataView(data.buffer) }] } }), "wallet:123");
assert.equal(getNdefIdentifier({ message: { records: [] } }), null);
console.log("NFC identifier checks passed.");
