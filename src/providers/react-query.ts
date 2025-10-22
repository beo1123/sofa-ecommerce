import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import localforage from "localforage";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60 * 2, // 2 hours
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export function setupQueryPersistance(queryClient: QueryClient) {
  const persister = createAsyncStoragePersister({
    storage: localforage,
    key: "tanstack-react-query",
  });

  persistQueryClient({ queryClient, persister, maxAge: 1000 * 60 * 60 * 2 });
  return { queryClient, persister };
}
