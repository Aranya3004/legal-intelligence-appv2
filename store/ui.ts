import { create } from 'zustand';
interface UIState { selectedCitationId: string | null; select: (id: string | null) => void }
export const useUI = create<UIState>((set) => ({ selectedCitationId: null, select: (id) => set({ selectedCitationId: id }) }));
