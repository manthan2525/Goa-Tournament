import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, MapPin, Crosshair } from 'lucide-react';

// Fix Leaflet's default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to handle map clicks and marker updates
function MapEventsHandler({ position, setPosition, setAddress }) {
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      
      // Reverse geocoding using Nominatim
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
        } else {
          setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      } catch (err) {
        console.error('Error fetching address:', err);
      }
    },
  });

  // Pan to new position when it changes externally (e.g. from search)
  useEffect(() => {
    if (position && position[0]) {
      map.flyTo(position, map.getZoom() < 13 ? 13 : map.getZoom());
    }
  }, [position, map]);

  return position && position[0] ? <Marker position={position} /> : null;
}

const LocationPicker = ({ location, setLocation }) => {
  const defaultCenter = [15.2993, 74.1240]; // Goa center

  const initPos = location?.latitude && location?.longitude 
    ? [location.latitude, location.longitude] 
    : defaultCenter;

  const [position, setPosition] = useState(initPos);
  const [address, setAddress] = useState(location?.address || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Sync to parent when address/position change
  useEffect(() => {
    if (position && position[0] && address) {
      setLocation({
        latitude: position[0],
        longitude: position[1],
        address: address,
      });
    }
  }, [position, address]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setSearchError('');
    
    try {
      // Prioritize Goa in search query if not explicitly mentioned
      const query = searchQuery.toLowerCase().includes('goa') ? searchQuery : `${searchQuery}, Goa`;
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setPosition([lat, lon]);
        setAddress(data[0].display_name);
      } else {
        setSearchError('Location not found. Try dragging the marker instead.');
      }
    } catch (err) {
      setSearchError('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSearchError('Geolocation is not supported by your browser.');
      return;
    }

    setSearching(true);
    setSearchError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch (err) {
          setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setSearching(false);
        }
      },
      (err) => {
        setSearchError('We couldn\'t access your location. You can search manually.');
        setSearching(false);
      }
    );
  };

  return (
    <div className="space-y-4 w-full">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearch} className="flex-1 relative flex">
          <input
            type="text"
            placeholder="Search venue, ground, turf, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-emerald-500 rounded-r-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <button
            type="submit"
            disabled={searching}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 text-sm font-semibold rounded-r-xl border border-emerald-600 disabled:opacity-50"
          >
            {searching ? '...' : 'Search'}
          </button>
        </form>
        <button
          type="button"
          onClick={useCurrentLocation}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-700 whitespace-nowrap"
        >
          <Crosshair className="w-4 h-4 text-emerald-400" />
          Current Location
        </button>
      </div>

      {searchError && (
        <p className="text-xs text-rose-400">{searchError}</p>
      )}

      {/* Map Container */}
      <div className="w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-slate-700 z-0 relative">
        <MapContainer 
          center={position} 
          zoom={11} 
          scrollWheelZoom={false}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEventsHandler position={position} setPosition={setPosition} setAddress={setAddress} />
        </MapContainer>
        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded z-10 pointer-events-none">
          Click map to drop marker
        </div>
      </div>

      {/* Selected Details */}
      <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <div className="flex items-start gap-2 overflow-hidden">
          <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-emerald-400/80 font-semibold mb-0.5">Selected Venue Location</p>
            <p className="text-sm text-white line-clamp-2">
              {address || 'Click on the map to select a location'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
