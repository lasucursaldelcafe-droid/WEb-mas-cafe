import { createHash } from "crypto";

const SALT = "mas-cafe-admin-v1";

export function hashPassword(password) {
  return createHash("sha256").update(`${SALT}:${password}`).digest("hex");
}
