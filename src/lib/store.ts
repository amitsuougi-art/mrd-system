"use client";

import { create } from "zustand";
import { Deal } from "@/types/deal";
import { User } from "@/types/user";
import { MOCK_DEALS, MOCK_USERS } from "./mock-data";

interface AppState {
  currentUser: User | null;
  deals: Deal[];
  setCurrentUser: (user: User | null) => void;
  addDeal: (deal: Deal) => void;
  updateDeal: (dealId: string, updater: (d: Deal) => Deal) => void;
  getDeal: (dealId: string) => Deal | undefined;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: MOCK_USERS[0],
  deals: [...MOCK_DEALS],
  setCurrentUser: (user) => set({ currentUser: user }),
  addDeal: (deal) => set((s) => ({ deals: [deal, ...s.deals] })),
  updateDeal: (dealId, updater) =>
    set((s) => ({
      deals: s.deals.map((d) => (d.dealId === dealId ? updater(d) : d)),
    })),
  getDeal: (dealId) => get().deals.find((d) => d.dealId === dealId),
}));
