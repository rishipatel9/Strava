import { create } from "zustand";
import { persist } from "zustand/middleware";


interface State {
    name : string;
    location:string
    userExactLocatiom :string
    locationDetails :{
        lat:string;
        lang:string;
    }
    setName : (name : string) => void;
    setUserLocation : (location : string) => void;
    setUserExactLocation : (location : string) => void;
    setLocationDetails : (locationDetails : {lat:string,lang:string}) => void;
}

const useStore = create(
  persist<State>(
    (set) => ({
        name: "",
        location:"",
        userExactLocatiom:"",
        locationDetails:{
            lat:"",
            lang:""
        },
        setName: (name : string) => set({ name }),
        setUserLocation: (location : string) => set({ location }),
        setUserExactLocation: (userExactLocatiom : string) => set({ userExactLocatiom }),
        setLocationDetails: (locationDetails : {lat:string,lang:string}) => set({ locationDetails }),
    }),    
    {
      name: "Store",
    }
  )
);

export default useStore;