
import { MapContainer, TileLayer, Marker, Popup, LayersControl, Polyline } from "react-leaflet";
import * as L from "leaflet";
import { useEffect, useState, useRef } from "react";
import planeBg from "./assets/a320.jpg";

function aircraftEmoji(f) {
  // Pick what you already have available in your data
  const c = f.aircraftCategory || "";

  if (c.includes("Heli")) return "🚁";
  if (c.includes("Military")) return "🛩️";
  if (c.includes("Business")) return "✈️";
  if (c.includes("General")) return "🛫";
  if (c.includes("Passenger")) return "🛬";
  return "✈️";
}

function makeAircraftDivIcon(f) {
  const emoji = f.onGround ? "🛬" : aircraftEmoji(f);
  return L.divIcon({
    className: "", // prevent default leaflet styles
    html: `<div style="
      font-size: 22px;
     display: inline-block;
     transform: translate(-50%, -50%) rotate(${Number.isFinite(f?.trueTrack) ? f.trueTrack : 0}deg);

      line-height: 1;
      text-shadow: 0 0 3px #fff;
    ">${emoji}</div>`,
    iconSize: [1, 1], // we position with transform
    iconAnchor: [0, 0],
  });
}
function AircraftPhoto({ hex }) {
  const [photo, setPhoto] = useState(null);
  const [info, setInfo] = useState(null);   //
  const [error, setError] = useState(false);

  useEffect(() => {
  if (!hex) {
  setError(true);
  return;
}
setInfo(null);

   fetch(`https://api.planespotters.net/pub/photos/hex/${encodeURIComponent(hex.toLowerCase())}`)
      .then(res => res.json())
      .then(data => {
        if (data.photos && data.photos.length > 0) {
          setPhoto(data.photos[0]);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
      fetch(`https://api.planespotters.net/pub/aircraft/hex/${encodeURIComponent(hex.toLowerCase())}`)
  .then(res => res.json())
  .then(data => {
    setInfo(data);
  })
  .catch(() => setInfo(null));

}, [hex]);

  if (error) return <div>No aircraft photo</div>;
  if (!photo) return <div>Loading photo…</div>;

  return (
    <div style={{ textAlign: "center" }}>
      <img
        src={photo.thumbnail.src}
        alt="Aircraft"
        style={{ width: "100%", borderRadius: "8px" }}
      />
      <div style={{ fontSize: 12, marginTop: 6 }}>
  {info?.aircraft?.model && (
  <div><strong>Model:</strong> {info.aircraft.model}</div>
)}
{info?.aircraft?.registration && (
  <div><strong>Reg:</strong> {info.aircraft.registration}</div>
)}

</div>

      <small>
        © {photo.photographer}{" "}
        <a href={photo.link} target="_blank" rel="noreferrer">
          Planespotters
        </a>
      </small>
    </div>
  );
}


const airports = [
  { icao: "KPBI", name: "West Palm Beach International Airport", lat: 26.6832, lon: -80.0956 },
  { icao: "KFLL", name: "Fort Lauderdale–Hollywood International Airport", lat: 26.0726, lon: -80.1527 },
  { icao: "KMIA", name: "Miami International Airport", lat: 25.7959, lon: -80.2870 },
  { icao: "KLNA", name: "Palm Beach County Park Airport", lat: 26.5930, lon: -80.0851 },
  { icao: "KBCT", name: "Boca Raton Airport", lat: 26.3785, lon: -80.1077 },
  { icao: "KMCO", name: "Orlando International Airport", lat: 28.424216, lon: -81.310522 },
  { icao: "KJFK", name: "John F. Kennedy International Airport", lat: 40.644637, lon: -73.779175 },
  { icao: "KLGA", name: "LaGuardia Airport", lat: 40.776225, lon: -73.874291 },
  { icao: "KBOS", name: "Boston Logan International Airport", lat: 42.365474, lon: -71.009645 },
  { icao: "KEWR", name: "Newark Liberty International Airport", lat: 40.688493, lon: -74.176742 },
  { icao: "KPHX", name: "Phoenix Sky Harbor International Airport", lat: 33.435215, lon: -112.010179 },
  { icao: "KLAX", name: "Los Angeles Internationl Airport", lat: 33.942151, lon:  -118.403587 },
  { icao: "KSFO", name: "San Francisco International Airport", lat: 37.619293, lon: -122.381256 },
  { icao: "KIAH", name: "George Bush Intercontinental Airport", lat: 29.993313, lon: -95.341399 },
  { icao: "KDFW", name: "Dallas Fort Worth International Airport", lat: 32.892895, lon: -97.038470 },
  { icao: "KATL", name: "Hartsfield-Jackson Atlanta International Airport", lat: 33.632864, lon: -84.432782 },
  { icao: "KHVN", name: "Tweed New Haven Airport", lat: 41.263119, lon: -72.886435 },
  { icao: "KACY", name: "Atlantic City International AIrport", lat: 39.452864, lon: -74.571563 },
  { icao: "KILG", name: "Wilmington Airport", lat: 39.678778, lon: -75.606320 },
  { icao: "JAX", name: "Jacksonville International Airport", lat: 30.494194, lon: -81.686985 },
  { icao: "KIAD", name: "Washington Dulles International Airport", lat: 38.944533, lon: -77.455806 },
  { icao: "KBWI", name: "Baltimore/Washington International Thurgood Marshall Airport", lat: 39.175361, lon: -76.668333 },
  { icao: "KDCA", name: "Ronald Reagan Washington National Airport", lat: 38.852083, lon: -77.037722 },
  { icao: "KORD", name: "Chicago O'Hare International Airport", lat: 41.974162, lon: -87.907321 },
  { icao: "KMDW", name: "Chicago Midway International Airport", lat: 41.785972, lon: -87.752906 },
  { icao: "KDEN", name: "Denver International Airport", lat: 39.856096, lon: -104.673737 },
  { icao: "KSEA", name: "Seattle-Tacoma International Airport", lat: 47.448936, lon: -122.309311 },
  { icao: "KMEM", name: "Memphis International Airport", lat: 35.042417, lon: -89.976667 },
  { icao: "KMSP", name: "Minneapolis–Saint Paul International Airport", lat: 44.884803, lon: -93.222327 },
  { icao: "KSTL", name: "St. Louis Lambert International Airport", lat: 38.748697, lon: -90.370028 },
  { icao: "KTPA", name: "Tampa International Airport", lat: 27.975476, lon: -82.533205 },
  { icao: "KCLL", name: "Easterwood Airport", lat: 30.588611, lon: -96.363056 },
  { icao: "KSJC", name: "San Jose Mineta International Airport", lat: 37.3626, lon: -121.9290 },
  { icao: "KSAN", name: "San Diego International Airport", lat: 32.7338, lon: -117.1933 },
  { icao: "KPDX", name: "Portland International Airport", lat: 45.5887, lon: -122.5975 },
  { icao: "KMSY", name: "Louis Armstrong New Orleans International Airport", lat: 29.9934, lon: -90.2580 },
  { icao: "KCLT", name: "Charlotte Douglas International Airport", lat: 35.2163, lon: -80.9529 },
  { icao: "KPHL", name: "Philadelphia International Airport", lat: 39.8719, lon: -75.2411 },
  { icao: "KCVG", name: "Cincinnati/Northern Kentucky International Airport", lat: 39.0489, lon: -84.6678 },
  { icao: "KMSN", name: "Dane County Regional Airport", lat: 43.1396, lon: -89.3378 },
  { icao: "KROC", name: "Greater Rochester International Airport", lat: 43.1189, lon: -77.6728 },
  { icao: "KSYR", name: "Syracuse Hancock International Airport", lat: 43.1112, lon: -76.1063 },
  { icao: "KALB", name: "Albany International Airport", lat: 42.7483, lon: -73.8027 },
  { icao: "KBUF", name: "Buffalo Niagara International Airport", lat: 42.9405, lon: -78.7322 },
  { icao: "KHPN", name: "Westchester County Airport", lat: 41.0670, lon: -73.7076 },
  { icao: "KSWF", name: "Stewart International Airport", lat: 41.5041, lon: -74.1048 },
  { icao: "KISP", name: "Long Island MacArthur Airport", lat: 40.7952, lon: -73.1002 },
  { icao: "TJSJ", name: "Luis Muñoz Marín International Airport", lat: 18.4394, lon: -66.0018 },
  { icao: "MKJP", name: "Norman Manley International Airport", lat: 17.9359, lon: -76.7878 },
  {icao: "TTPP", name: "Piarco International Airport", lat: 10.5959, lon: -61.3372 },
  {icao: "MROC", name: "Juan Santamaría International Airport", lat: 9.9939, lon: -84.2088 },
  {icao: "MMMX", name: "Mexico City International Airport", lat: 19.4361, lon: -99.0719 },
  {icao: "MMUN", name: "Cancún International Airport", lat: 21.0365, lon: -86.8771 },
  {icao: "MMGL", name: "General Rafael Buelna International Airport", lat: 19.144860, lon: -96.186609 },
  {icao: "MMMT", name: "General Francisco J. Mujica International Airport", lat: 19.8497, lon: -102.2556 },
  {icao: "MMMY", name: "General Mariano Escobedo International Airport", lat: 25.7781, lon: -100.1067 },
  {icao: "MMPR", name: "Licenciado Gustavo Díaz Ordaz International Airport", lat: 20.8864, lon: -105.2542 },
  {icao: "MMES", name: "General Rodolfo Sánchez Taboada International Airport", lat: 32.5149, lon: -117.0382 },
  {icao: "MMHO", name: "General Ignacio Pesqueira García International Airport", lat: 29.0958, lon: -110.9617 },
  {icao: "MMBT", name: "General Abelardo L. Rodríguez International Airport", lat: 32.5336, lon: -116.9805 },
  {icao: "MMTJ", name: "General Francisco Javier Mina International Airport", lat: 22.2456, lon: -97.8708 },
  {icao: "MMAN", name: "Alberto Acuña Ongay International Airport", lat: 21.7056, lon: -102.3172 },
  {icao: "MMVR", name: "General Heriberto Jara International Airport", lat: 19.1458, lon: -96.1872 },
  {icao: "MMCT", name: "General Mariano Matamoros Airport", lat: 18.6111, lon: -99.2617 },
  {icao: "MMCL", name: "General José María Yáñez International Airport", lat: 24.8319, lon: -107.3942 },
  {icao: "MMMD", name: "General Guadalupe Victoria International Airport", lat: 24.125808, lon: -104.533531 },
];
export default function App() {
  const [filter, setFilter] = useState("all");
  const [lat, setLat] = useState(26.649509);
  const [lon, setLon] = useState(-80.185902);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [trails, setTrails] = useState({});
    const alertedIcaoRef = useRef(new Set());
    useEffect(() => {
  setTrails((prev) => {
    const next = { ...prev };

    // add/update points for every current flight
    for (const f of flights) {
      if (!f?.icao24 || f.latitude == null || f.longitude == null) continue;

      const id = f.icao24;
      const pt = [f.latitude, f.longitude];

      const arr = next[id] ? [...next[id]] : [];
      const last = arr[arr.length - 1];

      // only add if changed
      if (!last || last[0] !== pt[0] || last[1] !== pt[1]) arr.push(pt);

      // keep last N points (trail length)
      const MAX = 60;
      if (arr.length > MAX) arr.splice(0, arr.length - MAX);

      next[id] = arr;
    }

    // remove trails for planes no longer in the list
    const seen = new Set(flights.map((f) => f?.icao24).filter(Boolean));
    for (const id of Object.keys(next)) {
      if (!seen.has(id)) delete next[id];
    }

    return next;
  });
}, [flights]);
function aircraftPhotoLink(f) {
  if (!f?.icao24) return null;
 return `https://www.planespotters.net/hex/${f.icao24}`;
}

  async function refresh() {
    setLoading(true);
    setErr("");
    try {
      const url = `http://localhost:8000/api/flights?lat=${lat}&lon=${lon}&radiusDeg=0.5`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Request failed");

      setFlights(data.flights || []);
      setLastUpdated(new Date().toLocaleString());
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
function classifyAircraft(f) {
  const cs = (f.callsign || "").toUpperCase();

 // Military/Government
if (cs.match(/SAM|SCH|SCHD|SCHM|SCHP|RCH/)) {
    return "Military";
  }

  // Commercial airlines
  if (cs.match(/AAL|DAL|UAL|SWA|JBU|FFT|ASA|POE|NKS|ROU|AAY|SCX|LPE|VOI|TAP|GXA|CFG|PDT|EIN|BAW|KAL|AFR|JSX|MXY|FLE|ACA|ENY|WJA|TAM|TAI|EDV|BHS|VXP|AVA|RPA|TFL|THY|AZU/)) {
    return "Passenger";
  }
// Business jet
if (cs.match(/EJA|LXJ|JTL|ASP|RNI|SGX|VJA|EJM|KOW|RKJ|NEW|HPJ|TCN|PVA|KNT/)) {
  return "Business Jet"
  }
 
// Cargo
if (cs.match(/FDX|UPS|GTI|CKS|CSB|ABX/)) {
  return "Cargo"
  }

  return "General Aviation";
}

  return (
 <div
  style={{
    padding: 20,
    fontFamily: "Mountains of Christmas",
    minHeight: "100vh",
    backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${planeBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    color: "white",
  }}
>

      <h1>OpenSky Flight Tracker ✈️</h1>

     <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start", width: "100%" }}>
        <label>
          Lat:{" "}
          <input value={lat} onChange={(e) => setLat(e.target.value)} style={{ width: 120 }} />
        </label>
        <label>
          Lon:{" "}
          <input value={lon} onChange={(e) => setLon(e.target.value)} style={{ width: 120 }} />
        </label>
        

        <button onClick={refresh} disabled={loading}>
          {/* MAP */}
<div style={{ height: "500px", marginTop: 20, flex: 1, width: "100%", minWidth: 600 }}>
  <MapContainer
    center={[lat, lon]}
    zoom={9}
    style={{ height: "100%", width: "100%" }}
  >
    <LayersControl position="topright">
  <LayersControl.BaseLayer checked name="Map">
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution="© OpenStreetMap contributors"
    />
  </LayersControl.BaseLayer>

  <LayersControl.BaseLayer name="Satellite">
    <TileLayer
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      attribution="Tiles © Esri"
    />
  </LayersControl.BaseLayer>
</LayersControl>
{/* ✈️ Airports */}
{airports.map((ap) => (
  <Marker key={ap.icao} position={[ap.lat, ap.lon]}>
    <Popup>
      <b>{ap.icao}</b><br />
      {ap.name}
    </Popup>
  </Marker>
))}
{Object.entries(trails).map(([id, pts]) =>
  pts.length >= 2 ? (
    <Polyline
      key={`trail-${id}`}
      positions={pts}
      pathOptions={{ weight: 3, opacity: 0.9 }}
    />
  ) : null
)}
    {flights.map((f) =>
    
      f.latitude && f.longitude ? (
      <Marker
  key={f.icao24}
  position={[f.latitude, f.longitude]}
  icon={makeAircraftDivIcon(f)}
>
          <Popup>
            <b>{f.callsign || "Unknown"}</b>
            <br />
            Alt: {Math.round(f.geoAltitude || 0)} m
            <br />
          <AircraftPhoto hex={f.icao24} />
            {classifyAircraft(f)}
          </Popup>
        </Marker>
      ) : null
    )}
  </MapContainer>
</div>

          {loading ? "Loading..." : "Refresh"}
        </button>
        <div style={{ height: 520, marginTop: 16, borderRadius: 12, overflow: "hidden" }}>
  <MapContainer
    center={[Number(lat), Number(lon)]}
    zoom={9}
    style={{ height: "100%", width: "100%" }}
  >
    <TileLayer
      attribution='&copy; OpenStreetMap contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    {flights
      .filter((f) => f.latitude != null && f.longitude != null)
      .map((f) => (
        <Marker key={f.icao24} position={[f.latitude, f.longitude]}>
          <Popup>
            <div style={{ fontFamily: "Arial" }}>
              <div><b>{f.callsign || f.icao24}</b></div>
              <div>Country: {f.originCountry}</div>
              <div>On ground: {f.onGround ? "Yes" : "No"}</div>
              <div>Alt (m): {f.geoAltitude ?? "?"}</div>
              <div>Speed (m/s): {f.velocity ?? "?"}</div>
              <div>Track: {f.trueTrack ?? "?"}</div>
              <div>On ground: {f.onGround ? "Yes" : "No"}</div>
              <div>Squawk: {f.squawk ?? ""}</div>
            </div>.
          </Popup>
        </Marker>
      ))}
  </MapContainer>
</div>

<select
  value={filter}
  onChange={(e) => setFilter(e.target.value)}
  style={{ padding: 4 }}
>
  <option value="all">All</option>
  <option value="Military">Military</option>
  <option value="Passenger">Passenger</option>
  <option value="Cargo">Cargo</option>
  <option value="General Aviation">General Aviation</option>
</select>
<option value="On Ground">On Ground</option>
<option value="In Air">In Air</option>
        {lastUpdated && <span>Last updated: {lastUpdated}</span>}
      </div>

      {err && (
        <p style={{ marginTop: 12 }}>
          <b>Error:</b> {err}
        </p>
      )}

      <div style={{ marginTop: 16, overflowX: "auto" }}>
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", minWidth: 900 }}>
          <thead>
            <tr>
              <th>ICAO24</th>
              <th>Call sign</th>
              <th>Country</th>
              <th>Latitude</th>
              <th>Longtitude</th>
              <th>Altitude (ft)</th>
              <th>Speed (m/s)</th>
              <th>Track (°)</th>
              <th>On Ground</th>
              <th>Squawk</th>
              <th>Aircraft Type</th>
              <th>Aircraft Catagory</th>

            </tr>
          </thead>
          <tbody>
            {flights.map((f) => (
              <tr key={f.icao24}>
                <td>{f.icao24}</td>
                <td>{f.callsign}</td>
                <td>{f.originCountry}</td>
                <td>{f.latitude ?? ""}</td>
                <td>{f.longitude ?? ""}</td>
                <td>{f.geoAltitude ?? ""}</td>
                <td>{f.velocity ?? ""}</td>
                <td>{f.trueTrack ?? ""}</td>
                <td>{f.onGround ? "Yes" : "No"}</td>
                <td>{f.squawk ?? ""}</td>
                <td>{f.aircraftType || "N/A"}</td>
                <td>{classifyAircraft(f)}</td>
              </tr>
            ))}
            {flights.length === 0 && (
              <tr>
                <td colSpan="10" style={{ textAlign: "center" }}>
                  No flights found (or backend not running yet).
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

