import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

// Fix Leaflet's default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapPreview = ({ location, venueName }) => {
  if (!location || !location.latitude || !location.longitude) {
    return null;
  }

  const position = [location.latitude, location.longitude];
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;

  return (
    <div className="w-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden mt-6">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-display font-bold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-400" />
          Tournament Venue
        </h3>
        
        <a 
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold rounded-lg transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" />
          Get Directions
        </a>
      </div>

      <div className="h-64 sm:h-72 w-full z-0 relative">
        <MapContainer 
          center={position} 
          zoom={14} 
          scrollWheelZoom={false}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} />
        </MapContainer>
      </div>

      <div className="p-4 bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-white font-bold text-sm mb-1">{venueName || 'Venue'}</p>
          <p className="text-slate-400 text-xs line-clamp-2">{location.address}</p>
        </div>
        
        <a 
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="sm:hidden flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors w-full"
        >
          <Navigation className="w-4 h-4" />
          Get Directions
        </a>
      </div>
    </div>
  );
};

export default MapPreview;
