import { useEffect, useRef, useState } from "react";

export default function MapView({ location }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [foundPlace, setFoundPlace] = useState(null);

  useEffect(() => {
    import("leaflet").then((L) => {
      if (!mapInstanceRef.current && mapRef.current) {
        const map = L.map(mapRef.current, { center: [12.9716, 77.5946], zoom: 12, zoomControl: true });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
        mapInstanceRef.current = map;
      }
    });
    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (!location || !mapInstanceRef.current) return;
    setStatus("loading");
    const query = encodeURIComponent(location + ", India");
    const url = "https://nominatim.openstreetmap.org/search?q=" + query + "&format=json&limit=1";
    fetch(url)
      .then((r) => r.json())
      .then(async (data) => {
        const L = await import("leaflet");
        if (!data || data.length === 0) { setStatus("error"); return; }
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const displayName = data[0].display_name;
        if (markerRef.current) markerRef.current.remove();
        const iconHtml = "<div style='width:36px;height:36px;background:#FFA07A;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;'></div>";
        const icon = L.divIcon({ html: iconHtml, className: "", iconSize: [36, 36], iconAnchor: [18, 36] });
        const marker = L.marker([lat, lon], { icon }).addTo(mapInstanceRef.current);
        markerRef.current = marker;
        mapInstanceRef.current.flyTo([lat, lon], 15, { duration: 1.5 });
        setFoundPlace(displayName.split(",").slice(0, 2).join(", "));
        setStatus("found");
      })
      .catch(() => setStatus("error"));
  }, [location]);

  const osmUrl = location ? "https://www.openstreetmap.org/search?query=" + encodeURIComponent(location) : "#";
  const googleUrl = location ? "https://www.google.com/maps/search/" + encodeURIComponent(location) : "#";
  return (
    <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #FFD4C2", boxShadow: "0 2px 12px rgba(255,160,122,0.1)" }}>
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "white", borderBottom: "1px solid #FFD4C2" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🗺️</span>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#3D1A0A", fontFamily: "'Syne'" }}>Map View</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {status === "loading" && <span style={{ fontSize: "12px", color: "#C4826A" }}>Locating...</span>}
          {status === "found" && <span style={{ fontSize: "12px", color: "#059669", fontWeight: 600 }}>✓ {foundPlace}</span>}
          {status === "error" && <span style={{ fontSize: "12px", color: "#ef4444" }}>Not found</span>}
          {location && (
            <div style={{ display: "flex", gap: "6px" }}>
              <a href={osmUrl} target="_blank" rel="noreferrer" style={{ fontSize: "12px", padding: "6px 10px", borderRadius: "8px", background: "#FFF5F0", border: "1px solid #FFD4C2", color: "#C4826A", textDecoration: "none", fontWeight: 500 }}>
                OSM ↗
              </a>
              <a href={googleUrl} target="_blank" rel="noreferrer" style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "8px", background: "linear-gradient(135deg, #FFA07A, #FF6B35)", color: "white", textDecoration: "none", fontWeight: 600 }}>
                🗺️ Navigate →
              </a>
            </div>
          )}
        </div>
      </div>

      <div ref={mapRef} style={{ height: "350px", width: "100%" }} />

      {status === "found" && (
        <div style={{ padding: "10px 16px", background: "white", borderTop: "1px solid #FFD4C2", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "12px", color: "#C4826A" }}>📍 {foundPlace}</span>
          <a href={googleUrl} target="_blank" rel="noreferrer" style={{ fontSize: "12px", padding: "6px 16px", borderRadius: "20px", background: "linear-gradient(135deg, #FFA07A, #FF6B35)", color: "white", textDecoration: "none", fontWeight: 600 }}>
            Open in Google Maps →
          </a>
        </div>
      )}
    </div>
  );
}