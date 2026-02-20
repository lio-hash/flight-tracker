
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
  const emoji = aircraftEmoji(f);
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

  // Military / government patterns
  if (
    cs.startsWith("RCH") ||    // USAF Reach 
    cs.startsWith("SHELL") ||  // Tankers
    cs.startsWith("MC") ||     // Marine Corps
    cs.startsWith("NAVY") ||
    cs.startsWith("ARMY") 
  ) {
    return "Military";
  }

  // Commercial airlines
  if (cs.match(/AAL|DAL|UAL|SWA|JBU|FFT|ASA|POE|NKS|ROU|AAY|SCX|LPE|VOI|TAP|GXA|CFG|PDT|EIN|BAW|KAL|AFR|JSX|MXY|FLE|ACA|ENY|WJA|TAM|TAI|EDV|BHS|VXP|AVA|RPA|TFL|THY/)) {
    return "Passenger";
  }
// Business jet
if (cs.match(/EJA|LXJ|JTL|ASP|RNI|SGX|VJA|EJM|KOW|RKJ|NEW|HPJ|TCN/)) {
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

