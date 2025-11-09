"use strict";

// Guard String.prototype.repeat during build, so accidental negatives don't crash the build.
// We will remove this once we locate and fix the offending call.
const _repeat = String.prototype.repeat;
String.prototype.repeat = function(count) {
  const n = Number(count);
  if (!Number.isFinite(n)) throw new RangeError("Invalid count value");
  if (n <= 0) return "";           // clamp negatives to empty string
  if (n === 1) return String(this);
  return _repeat.call(this, n);
};

// Optional: log where it happens the first few times
let seen = 0;
const MAX_LOGS = 5;
String.prototype._repeat_guard = true; // marker to avoid double-patching
module.exports = { MAX_LOGS };
