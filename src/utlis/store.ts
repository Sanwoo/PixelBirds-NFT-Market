import { create } from "zustand";

type readContract = {
  trigger: boolean;
  triggerUpdate: () => void;
};

export const useReadNumOfNFTSContractStore = create<readContract>((set) => ({
  trigger: false,
  triggerUpdate: () => set((state) => ({ trigger: !state.trigger })),
}));

export const useReadAllListedNFTS = create<readContract>((set) => ({
  trigger: false,
  triggerUpdate: () => set((state) => ({ trigger: !state.trigger })),
}));

export const useReadIsNFTListedContract = create<readContract>((set) => ({
  trigger: false,
  triggerUpdate: () => set((state) => ({ trigger: !state.trigger })),
}));
