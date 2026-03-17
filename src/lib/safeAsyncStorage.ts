import localforage from "localforage";

type AsyncStorageLike = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<string>;
  removeItem(key: string): Promise<void>;
};

const memoryStore = new Map<string, string>();

const memoryStorage: AsyncStorageLike = {
  async getItem(key) {
    return memoryStore.get(key) ?? null;
  },
  async setItem(key, value) {
    memoryStore.set(key, value);
    return value;
  },
  async removeItem(key) {
    memoryStore.delete(key);
  },
};

const localforageInstance = localforage.createInstance({
  name: "sofa-ecom",
  storeName: "sofa_ecom_storage",
  description: "Sofa Ecommerce persisted store (cart + user)",
});

let resolvedStorage: Promise<AsyncStorageLike> | null = null;

async function getResolvedStorage(): Promise<AsyncStorageLike> {
  if (typeof window === "undefined") {
    return memoryStorage;
  }

  if (!resolvedStorage) {
    resolvedStorage = localforageInstance
      .ready()
      .then(() => localforageInstance)
      .catch(() => memoryStorage);
  }

  return resolvedStorage;
}

async function withFallback<T>(operation: (storage: AsyncStorageLike) => Promise<T>): Promise<T> {
  try {
    const storage = await getResolvedStorage();
    return await operation(storage);
  } catch {
    resolvedStorage = Promise.resolve(memoryStorage);
    return operation(memoryStorage);
  }
}

export const safeAsyncStorage: AsyncStorageLike = {
  async getItem(key) {
    return withFallback((storage) => storage.getItem(key));
  },
  async setItem(key, value) {
    return withFallback((storage) => storage.setItem(key, value));
  },
  async removeItem(key) {
    return withFallback((storage) => storage.removeItem(key));
  },
};
