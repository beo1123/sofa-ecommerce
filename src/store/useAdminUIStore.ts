import { create } from "zustand";

interface AdminUIState {
  mobileSidebarOpen: boolean;
  activeOrderId: number | null;
  activeCustomerId: number | null;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  setActiveOrderId: (id: number | null) => void;
  setActiveCustomerId: (id: number | null) => void;
}

export const useAdminUIStore = create<AdminUIState>((set) => ({
  mobileSidebarOpen: false,
  activeOrderId: null,
  activeCustomerId: null,
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
  setActiveOrderId: (id) => set({ activeOrderId: id }),
  setActiveCustomerId: (id) => set({ activeCustomerId: id }),
}));
