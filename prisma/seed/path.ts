import { fileURLToPath } from "node:url";
import path from "node:path";

export function getDirname(importMetaUrl: string) {
  return path.dirname(fileURLToPath(importMetaUrl));
}
