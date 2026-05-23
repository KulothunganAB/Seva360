import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../services/api';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const priorityColors = { critical: '#EF4444', high: '#F97316', medium: '#EAB308', low: '#22C55E' };

const MapView = () => {
  const [complaints, setComplaints] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeLayer, setActiveLayer] = useState('complaints');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/complaints?limit=50').catch(() => ({ data: { data: [] } })),
      api.get('/volunteers/events?limit=20').catch(() => ({ data: { data: [] } })),
    ]).then(([cr, er]) => {
      setComplaints((cr.data.data || []).filter(c => c.latitude && c.longitude));
      setEvents((er.data.data || []).filter(e => e.latitude && e.longitude));
      setLoading(false);
    });
  }, []);

  const center = [13.0827, 80.2707]; // Chennai

  return (
    <div className="animate-fade-in space-y-4">
      <div className="page-header">
        <h1 className="page-title">Map View</h1>
        <p className="page-subtitle">Geographic view of complaints, events and works</p>
      </div>

      <div className="flex gap-2">
        {[['complaints', 'Complaints'], ['events', 'Events']].map(([val, label]) => (
          <button key={val} onClick={() => setActiveLayer(val)} className={`btn btn-sm ${activeLayer === val ? 'btn-primary' : 'btn-ghost border border-gray-200 dark:border-dark-600'}`} id={`map-layer-${val}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="card p-3 flex flex-wrap gap-4">
        {activeLayer === 'complaints' && Object.entries(priorityColors).map(([p, col]) => (
          <div key={p} className="flex items-center gap-2 text-xs capitalize text-dark-600 dark:text-dark-300">
            <div className="w-3 h-3 rounded-full" style={{ background: col }} />
            {p}
          </div>
        ))}
        {activeLayer === 'events' && (
          <div className="flex items-center gap-2 text-xs text-dark-600 dark:text-dark-300">
            <div className="w-3 h-3 rounded-full bg-blue-500" /> Events
          </div>
        )}
      </div>

      <div className="card overflow-hidden" style={{ height: '500px' }}>
        {!loading && (
          <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }} id="main-map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {activeLayer === 'complaints' && complaints.map(c => (
              <CircleMarker
                key={c.id}
                center={[parseFloat(c.latitude), parseFloat(c.longitude)]}
                radius={8}
                color={priorityColors[c.priority] || '#B91C1C'}
                fillColor={priorityColors[c.priority] || '#B91C1C'}
                fillOpacity={0.7}
              >
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold">{c.title}</p>
                    <p>Ticket: {c.ticketNumber}</p>
                    <p>Status: {c.status}</p>
                    <p>Priority: {c.priority}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
            {activeLayer === 'events' && events.map(e => (
              <Marker key={e.id} position={[parseFloat(e.latitude), parseFloat(e.longitude)]}>
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold">{e.title}</p>
                    <p>{new Date(e.date).toLocaleDateString('en-IN')}</p>
                    <p>{e.location}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      <div className="card p-4">
        <p className="text-sm text-dark-500 dark:text-dark-400">
          Showing {activeLayer === 'complaints' ? complaints.length : events.length} geo-tagged {activeLayer} on the map.
          {activeLayer === 'complaints' && complaints.length === 0 && ' (Add latitude/longitude when filing complaints to see them on map)'}
        </p>
      </div>
    </div>
  );
};

export default MapView;
