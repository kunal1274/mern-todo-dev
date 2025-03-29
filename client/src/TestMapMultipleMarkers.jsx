// import "./styles.css";
// GoogleMapComponent.jsx
import React, { useCallback, useRef, useState } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";



// import PlaceInfo from "./PlaceInfo";  // We'll import our marker logic from here

const libraries = ["places"];

// The map container style
const mapContainerStyle = {
  width: "100%",
  height: "60vh",
};

// Some map options for disabling UI, etc. (customize as needed)
const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

export default function TestMap() {
  // 🔴 Replace with your real Google Maps API Key:
  const googleMapsApiKey = "AIzaSyAyPn2j-knCACTYr1oBdFARHqoOthWDvW8";

  // 1) Load the script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey,
    libraries,
  });

  // 2) We'll store a reference to the map instance
  const mapRef = useRef();

  // 3) Callback when map finishes loading
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // 4) Handle error/loading
  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  // 5) Render the map + the PlaceInfo
  return (
    <GoogleMap
      id="map"
      mapContainerStyle={mapContainerStyle}
      zoom={14}
      center={{ lat: 28.3860429083234, lng: 77.02693376912908 }}
      options={options}
      onLoad={onMapLoad}
    >
      <PlaceInfo />
    </GoogleMap>
  );
}

export function PlaceInfo() {
  // We define some static places. Replace with your own data or fetch from an API.
  const places = [
    {
      info: "YSKe-com (Main Office)",
      location: { lat: 28.382748, lng: 77.025688 },
    },
    {
      info: "YSKe-com (Do-Kasuga)",
      location: { lat: 28.382687875856664, lng: 77.026688 },
    },
    {
      info: "YSKe-com (Do-ChuoV)",
      location: { lat: 28.3828, lng: 77.026788 },
    },
  ];

  // State to track which place (if any) is selected
  const [selected, setSelected] = useState(null);

  return (
    <>
      {/* Render a marker for each place */}
      {places.map((marker) => (
        <Marker
          key={`${marker.location.lat}-${marker.location.lng}`}
          position={{ lat: marker.location.lat, lng: marker.location.lng }}
          onMouseOver={() => {
            // Show info window on mouse-over
            setSelected(marker);
          }}
          icon={{
            // Use a custom icon
            url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(15, 15),
            scaledSize: new window.google.maps.Size(30, 30),
          }}
        />
      ))}

      {/* If a place is selected, show its InfoWindow */}
      {selected && (
        <InfoWindow
          position={{
            lat: selected.location.lat,
            lng: selected.location.lng,
          }}
          onCloseClick={() => {
            setSelected(null);
          }}
        >
          <div>{selected.info}</div>
        </InfoWindow>
      )}
    </>
  );
}
