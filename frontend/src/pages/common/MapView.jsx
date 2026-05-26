import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const priorityColors = { critical: '#EF4444', high: '#F97316', medium: '#EAB308', low: '#22C55E' };

const DISTRICT_CENTERS = {
  Chennai: [13.0827, 80.2707],
  Coimbatore: [11.0168, 76.9558],
  Madurai: [9.9252, 78.1198],
  Tiruchirappalli: [10.7905, 78.7047],
  Salem: [11.6643, 78.1460],
};

const MapView = () => {
  const { t } = useTranslation();
  const { user } = useSelector(s => s.auth);
  const [complaints, setComplaints] = useState([]);
  const [events, setEvents] = useState([]);
  const [charity, setCharity] = useState([]);
  const [activeLayer, setActiveLayer] = useState('complaints');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/complaints?limit=100').catch(() => ({ data: { data: [] } })),
      api.get('/events?limit=50').catch(() => ({ data: { data: [] } })),
      api.get('/charity/campaigns?limit=50').catch(() => ({ data: { data: [] } })),
    ]).then(([cr, er, chr]) => {
      setComplaints((cr.data.data || []).filter(c => c.latitude && c.longitude));
      setEvents((er.data.data || []).filter(e => e.latitude && e.longitude));
      setCharity((chr.data.data || []).filter(c => c.latitude && c.longitude));
      setLoading(false);
    });
  }, []);

  const center = DISTRICT_CENTERS[user?.district] || [11.1271, 78.6569];
  const zoom = user?.district ? 12 : 7;

  const layers = [
    ['complaints', t('complaintsLayer')],
    ['events', t('eventsLayer')],
    ['charity', t('charityLayer')],
  ];

  const count = activeLayer === 'complaints' ? complaints.length
    : activeLayer === 'events' ? events.length : charity.length;

  return (
    <div className="animate-fade-in space-y-4">
      <div className="page-header">
        <h1 className="page-title">{t('mapView')}</h1>
        <p className="page-subtitle">
          {t('mapSubtitle')}
          {user?.district && <> — <strong>{user.district}</strong></>}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {layers.map(([val, label]) => (
          <button
            key={val}
            type="button"
            onClick={() => setActiveLayer(val)}
            className={`btn btn-sm ${activeLayer === val ? 'btn-primary' : 'btn-ghost border border-gray-200 dark:border-primary-900'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="card p-3 flex flex-wrap gap-4">
        {activeLayer === 'complaints' && Object.entries(priorityColors).map(([p, col]) => (
          <div key={p} className="flex items-center gap-2 text-xs capitalize text-dark-600 dark:text-dark-300">
            <div className="w-3 h-3 rounded-full" style={{ background: col }} />
            {p}
          </div>
        ))}
        {activeLayer === 'events' && (
          <div className="flex items-center gap-2 text-xs text-dark-600 dark:text-dark-300">
            <div className="w-3 h-3 rounded-full bg-primary-500" /> {t('eventsLayer')}
          </div>
        )}
        {activeLayer === 'charity' && (
          <div className="flex items-center gap-2 text-xs text-dark-600 dark:text-dark-300">
            <div className="w-3 h-3 rounded-full bg-pink-500" /> {t('charityLayer')}
          </div>
        )}
      </div>

      <div className="card overflow-hidden" style={{ height: '520px' }}>
        {!loading && (
          <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} id="main-map">
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {activeLayer === 'complaints' && complaints.map(c => (
              <CircleMarker
                key={c.id}
                center={[parseFloat(c.latitude), parseFloat(c.longitude)]}
                radius={8}
                color={priorityColors[c.priority] || '#2563EB'}
                fillColor={priorityColors[c.priority] || '#2563EB'}
                fillOpacity={0.75}
              >
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold">{c.title}</p>
                    <p>{c.district}</p>
                    <p>{c.ticketNumber}</p>
                    <p>{c.status}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
            {activeLayer === 'events' && events.map(e => (
              <Marker key={e.id} position={[parseFloat(e.latitude), parseFloat(e.longitude)]}>
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold">{e.title}</p>
                    <p>{e.district}</p>
                    <p>{new Date(e.date).toLocaleDateString('en-IN')}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
            {activeLayer === 'charity' && charity.map(c => (
              <Marker key={c.id} position={[parseFloat(c.latitude), parseFloat(c.longitude)]}>
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold">{c.title}</p>
                    <p>{c.district}</p>
                    <p>{c.type}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      <div className="card p-4">
        <p className="text-sm text-dark-500 dark:text-dark-400">
          Showing {count} geo-tagged {activeLayer} on the map.
        </p>
      </div>
    </div>
  );
};

export default MapView;
