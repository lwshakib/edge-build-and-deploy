import { create } from "zustand";

interface EdgeState {
  // Define your state properties here
  session: any;
}

interface EdgeActions {
  // Define your action methods here
  setSession: (session: any) => void;
}

type EdgeStore = EdgeState & EdgeActions;

export const useEdgeStore = create<EdgeStore>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
}));
