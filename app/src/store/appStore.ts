import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, HistoryEntry, StoryMode, Language } from '../types';

interface AppState {
  // Settings
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;

  // History
  viewedArtifacts: HistoryEntry[];
  addToHistory: (artifactId: string, name?: string, category?: string, dynasty?: string) => void;
  clearHistory: () => void;

  // Session context (not persisted)
  sessionArtifacts: string[];  // IDs viewed this session
  addSessionArtifact: (id: string) => void;
  clearSession: () => void;

  // Current state
  currentArtifactId: string | null;
  setCurrentArtifact: (id: string | null) => void;
}

const defaultSettings: AppSettings = {
  storyMode: 'standard',
  language: 'en',
  autoPlay: true,
  hapticFeedback: true,
  offlineMode: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Settings
      settings: defaultSettings,
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      // History
      viewedArtifacts: [],
      addToHistory: (artifactId, name = 'Unknown', category = 'Unknown', dynasty) => {
        const entry: HistoryEntry = {
          id: artifactId,
          name,
          category,
          dynasty,
          viewedAt: Date.now(),
          duration: 0,
        };
        set((state) => ({
          viewedArtifacts: [entry, ...state.viewedArtifacts.filter(a => a.id !== artifactId)],
        }));
      },
      clearHistory: () => set({ viewedArtifacts: [] }),

      // Session (resets on app close)
      sessionArtifacts: [],
      addSessionArtifact: (id) =>
        set((state) => ({
          sessionArtifacts: state.sessionArtifacts.includes(id)
            ? state.sessionArtifacts
            : [...state.sessionArtifacts, id],
        })),
      clearSession: () => set({ sessionArtifacts: [] }),

      // Current
      currentArtifactId: null,
      setCurrentArtifact: (id) => set({ currentArtifactId: id }),
    }),
    {
      name: 'museum-guide-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        viewedArtifacts: state.viewedArtifacts,
      }),
    }
  )
);
