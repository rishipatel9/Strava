import { create } from "zustand";
import { persist } from "zustand/middleware";


interface State {
    name : string;
    setName : (name : string) => void;
}

const useStore = create(
  persist<State>(
    (set) => ({
        name: "",
        setName: (name : string) => set({ name }),
    }),    
    {
      name: "Store",
    }
  )
);

export default useStore;