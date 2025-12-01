import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./auth.css";
import RidePayment from "../components/RidePayment";
import PageShell from "./PageShell";

import swipeGif from "./assets/flick-down.gif";

function InnerMap({ ride }) {
  const mapRef = useRef();

  useEffect(() => {
    if (!ride) return;

    if (!mapRef.current) {
      mapRef.current = L.map("maproot", {
        center: [ride.pickup_lat || 0, ride.pickup_lng || 0],
        zoom: 13,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;
    const markers = [];

    if (ride.pickup_lat && ride.pickup_lng)
      markers.push(L.marker([ride.pickup_lat, ride.pickup_lng]).addTo(map));

    if (ride.drop_lat && ride.drop_lng)
      markers.push(L.marker([ride.drop_lat, ride.drop_lng]).addTo(map));

    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      try {
        map.fitBounds(group.getBounds().pad(0.4));
      } catch (e) {}
    }

    return () => {
      markers.forEach((m) => {
        try { map.removeLayer(m); } catch {}
      });
    };
  }, [ride]);

  return (
    <div id="maproot" style={{ height: "70vh", width: "100%", borderRadius: 12 }} />
  );
}

export default function MapPage({ fare = 0, ride = null }) {
  const paymentRef = useRef();

  const scrollToPayment = () => {
    paymentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.scrollBy({ top: -20, behavior: "smooth" });
  };

  return (
    <PageShell title={null} closeTo="/dashboard">
      <div style={{ position: "relative", padding: 8 }}>

        <div style={{ marginTop: 12, position: "relative" }}>
          <InnerMap ride={ride ?? { pickup_lat: 0, pickup_lng: 0 }} />

          <div
            className="swipe-overlay"
            tabIndex={0}
            onClick={scrollToPayment}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? scrollToPayment() : null)}
          >
            <img src={swipeGif} alt="Swipe for payment" className="swipe-image" />
            <div className="swipe-label">For payment — swipe down</div>
          </div>
        </div>

        <div ref={paymentRef} style={{ marginTop: 28 }}>
          <RidePayment amount={fare} />
        </div>
      </div>
    </PageShell>
  );
}
