import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const mapOptions = {
  zoomControl: false,
  scrollWheelZoom: false,
};

const LunchMap = ({ restaurants, activeId, onMapReady, onMarkerClick }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const markerLayerRef = useRef(null);
  const iconRef = useRef(null);

  // KHỞI TẠO MAP (Chạy 1 lần duy nhất khi mount)
  useEffect(() => {
    if (!mapContainerRef.current) return; // Nếu đã có map rồi thì không tạo lại

    // Setup Icon
    iconRef.current = L.icon({
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // Init Map
    const defaultCenter = [35.6895, 139.6917]; // Tokyo (hoặc tọa độ mặc định của bạn)

    const mapInstance = L.map(mapContainerRef.current, mapOptions).setView(
      defaultCenter,
      13
    );

    mapRef.current = mapInstance;

    // Setup Tile Layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapInstance);

    // Setup Marker Layer Group
    markerLayerRef.current = L.layerGroup().addTo(mapInstance);

    if (typeof onMapReady === "function") {
      onMapReady(mapInstance);
    }

    // Cleanup khi unmount hẳn component
    return () => {
      mapInstance.remove();
      mapRef.current = null;
      markersRef.current = {};
      markerLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerLayerRef.current) return;

    // Xóa marker cũ
    markerLayerRef.current.clearLayers();
    markersRef.current = {};

    // Thêm marker mới
    restaurants.forEach((restaurant) => {
      // Xử lý an toàn cho tọa độ
      let lat, lng;
      if (restaurant.coordinates) {
        lat = restaurant.coordinates.lat;
        lng = restaurant.coordinates.lng;
      } else {
        lat = restaurant.latitude || restaurant.lat;
        lng = restaurant.longitude || restaurant.lng;
      }

      if (lat && lng) {
        const marker = L.marker([lat, lng], { icon: iconRef.current })
          .addTo(markerLayerRef.current)
          .bindPopup(restaurant.name);

        marker.on("click", () => {
          if (typeof onMarkerClick === "function") {
            onMarkerClick(restaurant.id);
          }
        });

        markersRef.current[restaurant.id] = marker;
      }
    });
  }, [restaurants, onMarkerClick]);

  useEffect(() => {
    if (!activeId || !markersRef.current) return;

    const marker = markersRef.current[activeId];
    if (marker) {
      marker.openPopup();
    }
  }, [activeId]);

  return (
    <div
      ref={mapContainerRef}
      className="h-[400px] w-full"
      aria-label="Lunch map"
    />
  );
};

export default LunchMap;
