import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapPin, Loader2, X, Clock, Bookmark } from 'lucide-react';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { recentAddressService, RecentAddress } from '../../services/recentAddressService';
import { savedAddressService, SavedAddress } from '../../services/savedAddressService';

interface LocationSearchResult {
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
}

interface LocationSearchProps {
    id: string;
    placeholder?: string;
    value: string;
    onLocationSelect: (address: string, lat: number, lng: number) => void;
    className?: string;
    addressType?: 'pickup' | 'delivery'; // To filter recent addresses by type
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
    id,
    placeholder,
    value,
    onLocationSelect,
    className,
    addressType
}) => {
    const [query, setQuery] = useState(value);
    const [results, setResults] = useState<LocationSearchResult[]>([]);
    const [recentAddresses, setRecentAddresses] = useState<RecentAddress[]>([]);
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingRecent, setIsLoadingRecent] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Fetch recent and saved addresses on mount
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                setIsLoadingRecent(true);
                // Fetch recent addresses
                const recent = await recentAddressService.getRecentAddresses(5);
                const filteredRecent = addressType 
                    ? recent.filter(addr => addr.type === addressType)
                    : recent;
                setRecentAddresses(filteredRecent);

                // Fetch saved addresses
                const saved = await savedAddressService.getAddresses();
                setSavedAddresses(saved);
            } catch (error) {
                console.error("Error fetching addresses:", error);
                // Don't show error to user, just silently fail
            } finally {
                setIsLoadingRecent(false);
            }
        };
        fetchAddresses();
    }, [addressType]);

    // Update query when value prop changes (e.g. initial load or reset)
    useEffect(() => {
        setQuery(value);
    }, [value]);

    // Handle outside click to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length > 2 && showResults) {
                setIsLoading(true);
                try {
                    const response = await axios.get<LocationSearchResult[]>(
                        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`
                    );
                    setResults(response.data);
                } catch (error) {
                    console.error("Error searching location:", error);
                    setResults([]);
                } finally {
                    setIsLoading(false);
                }
            } else if (query.length <= 2) {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, showResults]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setShowResults(true);
    };

    const handleInputFocus = () => {
        setShowResults(true);
    };

    const handleSelect = (result: LocationSearchResult) => {
        setQuery(result.display_name);
        onLocationSelect(
            result.display_name,
            parseFloat(result.lat),
            parseFloat(result.lon)
        );
        setShowResults(false);
    };

    const handleRecentAddressSelect = async (address: RecentAddress) => {
        setQuery(address.address);
        onLocationSelect(address.address, address.lat, address.lng);
        setShowResults(false);
        
        // Update lastUsed timestamp
        try {
            await recentAddressService.updateLastUsed(address.id);
            // Refresh recent addresses to update order
            const addresses = await recentAddressService.getRecentAddresses(5);
            const filtered = addressType 
                ? addresses.filter(addr => addr.type === addressType)
                : addresses;
            setRecentAddresses(filtered);
        } catch (error) {
            console.error("Error updating last used:", error);
            // Don't show error to user
        }
    };

    const handleSavedAddressSelect = (address: SavedAddress) => {
        setQuery(address.address);
        onLocationSelect(address.address, address.latitude, address.longitude);
        setShowResults(false);
    };

    const clearSearch = () => {
        setQuery('');
        onLocationSelect('', 0, 0);
        setResults([]);
        setShowResults(false);
    };

    return (
        <div ref={wrapperRef} className={cn("relative", className)}>
            <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    id={id}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder={placeholder}
                    className="pl-10 pr-10"
                    autoComplete="off"
                />
                {isLoading ? (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                ) : query && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {showResults && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 max-h-[400px] overflow-auto">
                    {/* Saved Addresses Section */}
                    {!isLoadingRecent && savedAddresses.length > 0 && query.length <= 2 && (
                        <>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b sticky top-0 bg-popover">
                                Saved Addresses
                            </div>
                            <ul className="py-1">
                                {savedAddresses.map((address) => (
                                    <li
                                        key={address.id}
                                        onClick={() => handleSavedAddressSelect(address)}
                                        className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                    >
                                        <Bookmark className="mr-2 h-4 w-4 shrink-0 opacity-50 text-orange-500" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{address.label}</span>
                                                {address.isDefault && (
                                                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground line-clamp-1">{address.address}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            {(recentAddresses.length > 0 || results.length > 0) && (
                                <div className="border-t my-1"></div>
                            )}
                        </>
                    )}

                    {/* Recent Addresses Section */}
                    {!isLoadingRecent && recentAddresses.length > 0 && query.length <= 2 && (
                        <>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b">
                                Recent Addresses
                            </div>
                            <ul className="max-h-[150px] overflow-auto py-1">
                                {recentAddresses.map((address) => (
                                    <li
                                        key={address.id}
                                        onClick={() => handleRecentAddressSelect(address)}
                                        className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                    >
                                        <Clock className="mr-2 h-4 w-4 shrink-0 opacity-50 text-primary" />
                                        <div className="flex-1 min-w-0">
                                            <span className="line-clamp-1">{address.address}</span>
                                            {address.type && (
                                                <span className="text-xs text-muted-foreground ml-2">
                                                    ({address.type})
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            {results.length > 0 && (
                                <div className="border-t my-1"></div>
                            )}
                        </>
                    )}

                    {/* Search Results Section */}
                    {results.length > 0 && (
                        <>
                            {query.length > 2 && (
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b">
                                    Search Results
                                </div>
                            )}
                            <ul className="max-h-[200px] overflow-auto py-1">
                                {results.map((result) => (
                                    <li
                                        key={result.place_id}
                                        onClick={() => handleSelect(result)}
                                        className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                    >
                                        <MapPin className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                        <span className="line-clamp-1">{result.display_name}</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    {/* Empty State */}
                    {!isLoading && !isLoadingRecent && query.length > 2 && results.length === 0 && recentAddresses.length === 0 && (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                            No results found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
