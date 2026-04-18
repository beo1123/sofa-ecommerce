// src/lib/persistUtils.ts
import { persistor } from "@/store";

export async function purgePersisted() {
  await persistor.purge();
}

export async function flushPersisted() {
  await persistor.flush();
}

export function waitRehydrated(timeout = 5000) {
  return new Promise<void>((resolve, reject) => {
    const start = Date.now();
    const unsub = persistor.subscribe(() => {
      const state = (persistor as any).getState?.();
      if (state?.bootstrapped) {
        unsub();
        resolve();
      } else if (Date.now() - start > timeout) {
        unsub();
        reject(new Error("rehydration timeout"));
      }
    });
  });
}
