import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";

interface ActionSearchBarProps {
  onSelectPlace: (place: google.maps.places.PlaceResult) => void;
  setDestination: (selectedLocation: { lat: number; lng: number }) => void;
}

const ActionSearchBar = ({ onSelectPlace, setDestination }: ActionSearchBarProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);

  useEffect(() => {
    if (!autocompleteServiceRef.current && window.google) {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
    }
  }, []);

  useEffect(() => {
    if (query.length > 2 && autocompleteServiceRef.current) {
      autocompleteServiceRef.current.getPlacePredictions({ input: query }, (predictions) => {
        if (predictions) {
          setSuggestions(predictions);
        }
      });
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSelect = async (placeId: string) => {
    const placesService = new google.maps.places.PlacesService(document.createElement("div"));
    placesService.getDetails({ placeId }, (place) => {
      if (place && place.geometry?.location) {
        const selectedLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        onSelectPlace(place);
        setDestination(selectedLocation);

        setQuery(place.name || "");
        setSuggestions([]);
      }
    });
  };

  return (
    <div className="w-full border-t  ">
      <div className="relative w-full">
        <div className="w-full sticky top-0 bg-background z-10 pt-4 pb-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block" htmlFor="search">
            Search Location
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for a place..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-3 pr-9 py-2 text-sm rounded-lg w-full"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            

            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="absolute left-0 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-auto z-50"
                >
                  {suggestions.map((suggestion) => (
                    <motion.li
                      key={suggestion.place_id}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleSelect(suggestion.place_id)}
                    >
                      {suggestion.description}
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionSearchBar;
