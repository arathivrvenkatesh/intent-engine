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
        const map = L.map(mapRef.current, {
          center: [12.9716, 77.5946],
          zoom: 12,
          zoomControl: true,
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
        }).addTo(map);
        mapInstanceRef.current = map;
      }
    });
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
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
        if (markerRef.current) { markerRef.current.remove(); }
        const iconHtml = "<div style='width:36px;height:36px;background:#6c63ff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;'></div>";
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

  return (
    <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid var(--border)" }}>
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--panel)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🗺️</span>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--bright)" }}>Map View</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {status === "loading" && <span style={{ fontSize: "12px", color: "var(--muted)" }}>Locating...</span>}
          {status === "found" && <span style={{ fontSize: "12px", color: "#43ffaf" }}>✓ {foundPlace}</span>}
          {status === "error" && <span style={{ fontSize: "12px", color: "#ff6584" }}>Not found</span>}
          {location && (
            <a href={osmUrl} target="_blank" rel="noreferrer" style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "8px", background: "var(--border)", color: "var(--soft)", textDecoration: "none" }}>
              Open OSM
            </a>
          )}
        </div>
      </div>
      <div ref={mapRef} style={{ height: "300px", width: "100%" }} />
    </div>
  );
}

  