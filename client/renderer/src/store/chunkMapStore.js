import create from 'zustand';
import { persist } from 'zustand/middleware';

const useChunkMapStore = create(
  persist((set) => ({
    chunkMap: new Map(),
    setChunkMap: (newChunkMap) => set({ chunkMap: newChunkMap }),
    updateArrayForKey: (key, newArray) => {
      set((state) => {
        const newChunkMap = new Map(state.chunkMap);
        newChunkMap.set(key, newArray);
        return { chunkMap: newChunkMap };
      });
    }
  }), {
    name: 'chunkMap-store',
    getStorage: () => localStorage
  })
);

export default useChunkMapStore;
