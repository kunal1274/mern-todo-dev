import React, { useState, useEffect, useRef } from 'react';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  DirectionsRenderer,
  Autocomplete,   // RED: We import Autocomplete from @react-google-maps/api
  useJsApiLoader,
} from '@react-google-maps/api';
import axios from 'axios';

// Import your SVGs
import endMapPin from '../src/assets/images/end-pin.png';
import carNorthSvg from '../src/assets/images/car-n.svg'; // 0
import carNorthEastSvg from '../src/assets/images/car-ne.svg'; // 45
import carEastSvg from '../src/assets/images/car-e.svg'; // 90
import carSouthEastSvg from '../src/assets/images/car-se.svg'; //135
import carSouthSvg from '../src/assets/images/car-s.svg'; // 180
import carSouthWestSvg from '../src/assets/images/car-sw.svg'; // 225
import carWestSvg from '../src/assets/images/car-w.svg'; // 270
import carNorthWestSvg from '../src/assets/images/car-nw.svg'; // 315
import currentLocationRawSvgDataUrl from '../src/assets/images/currentLocation.svg';
import startSvgDataUrl from '../src/assets/images/startLocation.svg';
import endSvgDataUrl from '../src/assets/images/endLocation.svg';
import dPatrick from '../src/assets/images/d-patrick.svg';
import driverSvgDataUrl from '../src/assets/images/driver.svg';
import cSunidhi from '../src/assets/images/c-sunidhi.svg';
import officeSvgDataUrl from '../src/assets/images/office.svg';
import allocatorSvgDataUrl from '../src/assets/images/allocator.svg';
import recenterSvg from '../src/assets/images/recenter.svg';


// const backendUrl = import.meta.env.VITE_BACKEND_URL //|| import.meta.env.VITE_BACKEND_LIVE_DEV_URL;// || 'http://localhost:5001/api/v1';
const backendUrl = import.meta.env.VITE_BACKEND_URL;



// Geocoding helper functions
function reverseGeocode(lat, lng) {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject('Google Maps JS not loaded.');
      return;
    }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        resolve(results[0].formatted_address);
      } else {
        reject('Reverse geocode failed: ' + status);
      }
    });
  });
}

function forwardGeocode(address) {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject('Google Maps JS not loaded.');
      return;
    }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const loc = results[0].geometry.location;
        resolve({ lat: loc.lat(), lng: loc.lng() });
      } else {
        reject('Forward geocode failed: ' + status);
      }
    });
  });
}

function headingToDirection(heading) {
  // Normalize heading to 0..360
  const h = (heading + 360) % 360;

  if ((h >= 337.5 && h < 360) || (h >= 0 && h < 22.5)) {
    return 'N';
  } else if (h >= 22.5 && h < 67.5) {
    return 'NE';
  } else if (h >= 67.5 && h < 112.5) {
    return 'E';
  } else if (h >= 112.5 && h < 157.5) {
    return 'SE';
  } else if (h >= 157.5 && h < 202.5) {
    return 'S';
  } else if (h >= 202.5 && h < 247.5) {
    return 'SW';
  } else if (h >= 247.5 && h < 292.5) {
    return 'W';
  } else {
    return 'NW';
  }
}

function getCarIcon(direction) {
  switch (direction) {
    case 'N':
      return carNorthSvg;
    case 'NE':
      return carNorthEastSvg;
    case 'E':
      return carEastSvg;
    case 'SE':
      return carSouthEastSvg;
    case 'S':
      return carSouthSvg;
    case 'SW':
      return carSouthWestSvg;
    case 'W':
      return carWestSvg;
    case 'NW':
      return carNorthWestSvg;
    default:
      return carNorthSvg;
  }
}

// Basic container style
const containerStyle = {
  width: '100%',
  height: '500px',
};

// Default location (fallback if geolocation fails)
const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};

const libraries = ['places', 'geometry']; // RED: 'places' for Autocomplete

const MapWithBackend = () => {
  // 1) Load Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const [map, setMap] = useState(null);
  const [isGeoLoading, setIsGeoLoading] = useState(true);

  // Current Position which will never change and can't be changed by the user
  const [currLat, setCurrLat] = useState(defaultCenter.lat);
  const [currLng, setCurrLng] = useState(defaultCenter.lng);
  const [currAddress, setCurrAddress] = useState('');

  // Start & End location states
  const [typedStart, setTypedStart] = useState('');
  const [startLat, setStartLat] = useState(currLat + 0.01);
  const [startLng, setStartLng] = useState(currLng + 0.01);
  const [startAddress, setStartAddress] = useState('');

  const [typedEnd, setTypedEnd] = useState('');
  const [endLat, setEndLat] = useState(currLat + 0.02);
  const [endLng, setEndLng] = useState(currLng + 0.02);
  const [endAddress, setEndAddress] = useState('');

  // Store the map's initial center
  const [initialCenter, setInitialCenter] = useState(null);

  // Car simulation states
  const [carPos, setCarPos] = useState(null);
  const [carHeading, setCarHeading] = useState(0); // angle in degrees
  const [carIconUrl, setCarIconUrl] = useState(carNorthSvg);

  const [carIndex, setCarIndex] = useState(0);
  const [carPaused, setCarPaused] = useState(false); // is the simulation paused?
  const carPathRef = useRef([]); // store the route path
  const carIntervalRef = useRef(null);
  const carPausedRef = useRef(false);

  // Directions state
  const [directions, setDirections] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  // Follow Car State
  const [followCar, setFollowCar] = useState(false);
  const followCarRef = useRef(false);

  useEffect(() => {
    followCarRef.current = followCar;
  }, [followCar]);

  // Autocomplete Refs
  const startAutocompleteRef = useRef(null);
  const endAutocompleteRef = useRef(null);

 //////////////////////////////////////////////////////////////////////////
  // A) ON LOAD => GET USER’S CURRENT POSITION + REVERSE GEOCODE
  //////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (!isLoaded) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { // added async v2
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          setCurrLat(userLat);
          setCurrLng(userLng);
          // Also shift start & end a bit
          setStartLat(userLat + 0.01);
          setStartLng(userLng + 0.01);
          setEndLat(userLat + 0.02);
          setEndLng(userLng + 0.02);

          console.log(`curr Lat ${userLat} and curr Lng ${userLng}`);
          // Reverse geocode so the startAddress is set
          // commented in v2-start
          reverseGeocode(userLat, userLng)
            .then((addr) => setCurrAddress(addr))
            .catch((err) => console.error(err))
            .finally(() => {
              // RED: Now set the initial center to startLat, startLng
              setInitialCenter({ lat: userLat + 0.01, lng: userLng + 0.01 });
              setIsGeoLoading(false)
            });
          // commented in v2-end
          // modified in v2- using async await functionality ( better approach )
          // try {
          //   const addr = await reverseGeocode(userLat, userLng);
          //   setCurrAddress(addr);
          // } catch (err) {
          //   console.error(err);
          // } finally {
          //   setIsGeoLoading(false);
          // }
        },
        (err) => {
          console.error('Geolocation error:', err);
          // fallback
          // setCurrLat(defaultCenter.lat);
          // setCurrLng(defaultCenter.lng);
          // setStartLat(defaultCenter.lat + 0.01);
          // setStartLng(defaultCenter.lng + 0.01);
          // setEndLat(defaultCenter.lat + 0.02);
          // setEndLng(defaultCenter.lng + 0.02);

          // set initial center as the fallback
          setInitialCenter({ 
            lat: defaultCenter.lat + 0.01, 
            lng: defaultCenter.lng + 0.01 
          });
          setIsGeoLoading(false);
        }
      );
    } else {
      console.error('Geolocation not supported.');
      // Fallback to default center
      setInitialCenter({
        lat: defaultCenter.lat + 0.01,
        lng: defaultCenter.lng + 0.01,
      });
      setIsGeoLoading(false);
    }
  }, [isLoaded]);

   // Whenever carPaused state changes, keep the ref in sync:
   useEffect(() => {
    carPausedRef.current = carPaused;
  }, [carPaused]);

  const handleCurrAddressChange = async (e) => {
    const newAddr = e.target.value
    setCurrAddress(newAddr)
    
  }

  const handleCurrAddressBlur = async () => {
    if (!currAddress) return
    try {
      const coords = await forwardGeocode(currAddress)
      setLat(coords.lat)
      setLng(coords.lng)
      if (map) {
        map.panTo(coords)
      }
    } catch (error) {
      console.error(error)
    }
  }

    // Mock user movement 

  // Mock function to simulate user moving
  const updateCurrentPosition = () => {
    setCurrLat((prev) => prev + 0.001);
    setCurrLng((prev) => prev - 0.001);
  };

  //////////////////////////////////////////////////////////////////////////
  // B) Handle Draggable Marker Drag End
  //////////////////////////////////////////////////////////////////////////
  const handleStartDragEnd = async (e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    setStartLat(newLat);
    setStartLng(newLng);

    try {
      const addr = await reverseGeocode(newLat, newLng);
      setTypedStart(addr);
      setStartAddress(addr);
      // Update trip in backend
      await updateTripStartLocation(newLat, newLng, addr);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEndDragEnd = async (e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    setEndLat(newLat);
    setEndLng(newLng);

    try {
      const addr = await reverseGeocode(newLat, newLng);
      setTypedEnd(addr);
      setEndAddress(addr);
      // Update trip in backend
      await updateTripEndLocation(newLat, newLng, addr);
    } catch (error) {
      console.error(error);
    }
  };

  //////////////////////////////////////////////////////////////////////////
  // C) Handle Typing in Start & End Inputs
  //////////////////////////////////////////////////////////////////////////
  const handleStartChange = (e) => {
    setTypedStart(e.target.value);
  };

  const handleStartBlur = async () => {
    if (!typedStart) return;
    try {
      const coords = await forwardGeocode(typedStart);
      setStartLat(coords.lat);
      setStartLng(coords.lng);
      setStartAddress(typedStart);
      if (map) map.panTo(coords);

      // Update trip in backend
      await updateTripStartLocation(coords.lat, coords.lng, typedStart);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEndChange = (e) => {
    setTypedEnd(e.target.value);
  };

  const handleEndBlur = async () => {
    if (!typedEnd) return;
    try {
      const coords = await forwardGeocode(typedEnd);
      setEndLat(coords.lat);
      setEndLng(coords.lng);
      setEndAddress(typedEnd);
      if (map) map.panTo(coords);

      // Update trip in backend
      await updateTripEndLocation(coords.lat, coords.lng, typedEnd);
    } catch (err) {
      console.error(err);
    }
  };


    //////////////////////////////////////////////////////////////////////////
  // C) USER TYPES OR SELECTS START ADDRESS => FORWARD GEOCODE
  //    BUT STILL ALLOW ANY TYPED INPUT IF AUTOCOMPLETE MISSES
  //////////////////////////////////////////////////////////////////////////
  const onStartPlaceChanged = () => {
    if (startAutocompleteRef.current !== null) {
      const place = startAutocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setTypedStart(place.formatted_address || place.name);
        setStartLat(lat);
        setStartLng(lng);
        setStartAddress(place.formatted_address || place.name);
        if (map) map.panTo({ lat, lng });

        // Update trip in backend
        updateTripStartLocation(lat, lng, place.formatted_address || place.name);
      }
    }
  };

  const handleStartAddressBlur = async () => {
    try {
      if (startAddress) {
        const coords = await forwardGeocode(startAddress);
        setStartLat(coords.lat);
        setStartLng(coords.lng);
        if (map) {
          map.panTo(coords);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  //////////////////////////////////////////////////////////////////////////
  // D) USER TYPES OR SELECTS END ADDRESS => FORWARD GEOCODE
  //    But also allow custom typed input
  //////////////////////////////////////////////////////////////////////////
  const onEndPlaceChanged = () => {
    if (endAutocompleteRef.current !== null) {
      const place = endAutocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setTypedEnd(place.formatted_address || place.name);
        setEndLat(lat);
        setEndLng(lng);
        setEndAddress(place.formatted_address || place.name);
        if (map) map.panTo({ lat, lng });

        // Update trip in backend
        updateTripEndLocation(lat, lng, place.formatted_address || place.name);
      }
    }
  };

  const handleEndAddressBlur = async () => {
    try {
      if (endAddress) {
        const coords = await forwardGeocode(endAddress);
        setEndLat(coords.lat);
        setEndLng(coords.lng);
        if (map) {
          map.panTo(coords);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  //////////////////////////////////////////////////////////////////////////
  // D) Show Directions When Both Start & End Addresses Are Valid
  //////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (!isLoaded) return;
    if (!startAddress || !endAddress) {
      setDirections(null);
      return;
    }

    // Fetch directions
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: startLat, lng: startLng },
        destination: { lat: endLat, lng: endLng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      async (result, status) => {
        if (status === 'OK') {
          setDirections(result);
          // Reset car simulation
          carPathRef.current = result.routes[0].overview_path; // array of LatLng
          setCarPos(null);
          setCarHeading(0);
          setCarIconUrl(carNorthSvg);
          setCarIndex(0);
          stopCarSimulation(); // clear any old intervals

          // Optionally, create or update trip in backend
          await createOrUpdateTrip();
        } else {
          console.error('Directions request failed:', status);
          setDirections(null);
        }
      }
    );
  }, [startLat, startLng, endLat, endLng, startAddress, endAddress, isLoaded]);

  //////////////////////////////////////////////////////////////////////////
  // E) Car Simulation Functions
  //////////////////////////////////////////////////////////////////////////
  const computeCarHeading = (fromPos, toPos) => {
    const heading = window.google.maps.geometry.spherical.computeHeading(fromPos, toPos);
    return (heading + 360) % 360;
  };

  const startCarSimulation = () => {
    if (!carPathRef.current.length) return;
    if (carIntervalRef.current) return; // already running

    setCarIndex(0);
    setCarPos({
      lat: carPathRef.current[0].lat(),
      lng: carPathRef.current[0].lng(),
    });
    setCarHeading(0);
    setCarIconUrl(carNorthSvg);
    setCarPaused(false);

    // Move the car every 1 second
    carIntervalRef.current = setInterval(() => {
      setCarIndex((prevIndex) => {
        if (prevIndex >= carPathRef.current.length - 1) {
          // Ride is completed
          clearInterval(carIntervalRef.current);
          carIntervalRef.current = null;
          return prevIndex;
        }
        if (carPausedRef.current) {
          return prevIndex; // if paused, do nothing
        }
        // Car is moving
        const nextIndex = prevIndex + 1;
        let fromLatLng = carPathRef.current[prevIndex];
        let toLatLng = carPathRef.current[nextIndex];

        // Update car heading
        const newHeading = computeCarHeading(fromLatLng, toLatLng);
        const newDirection = headingToDirection(newHeading); // one of 'N','NE','E','SE','S','SW','W','NW'
        setCarIconUrl(getCarIcon(newDirection));
        setCarHeading(newHeading);

        // Update car position
        setCarPos({
          lat: toLatLng.lat(),
          lng: toLatLng.lng(),
        });

        // Update trip's current location in backend
        updateTripCurrentLocation(toLatLng.lat(), toLatLng.lng());

        return nextIndex;
      });
    }, 1000);
  };

  const pauseCar = () => {
    // Just set a "paused" flag, so the interval stops incrementing
    setCarPaused(true);
  };

  const resumeCar = () => {
    setCarPaused(false);
  };

  const stopCarSimulation = () => {
    if (carIntervalRef.current) {
      clearInterval(carIntervalRef.current);
      carIntervalRef.current = null;
    }
  };

  // Optionally “resetCar” to go back to the beginning
  const resetCar = () => {
    stopCarSimulation();
    setCarIndex(0);
    setCarPos(null);
    setCarHeading(0);
    setCarIconUrl(carNorthSvg);
    // Optionally, reset trip's current location in backend
    resetTripCurrentLocation();
  };

  //////////////////////////////////////////////////////////////////////////
  // F) Auto-Recenter to Car When Follow Car is Enabled
  //////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (followCar && carPos && map) {
      map.panTo(carPos);
    }
  }, [carPos, followCar, map]);

  //////////////////////////////////////////////////////////////////////////
  // G) Recenter Utility Functions
  //////////////////////////////////////////////////////////////////////////
  const recenterToCurrent = () => {
    setInitialCenter({ lat: currLat, lng: currLng });
    if (map) map.panTo({ lat: currLat, lng: currLng });
  };
  const recenterToStart = () => {
    setInitialCenter({ lat: startLat, lng: startLng });
    if (map) map.panTo({ lat: startLat, lng: startLng });
  };
  const recenterToCar = () => {
    if (!carPos) return;
    setInitialCenter({ lat: carPos.lat, lng: carPos.lng });
    map.panTo(carPos);
  };

  const recenterToDriver = () => {
    if (!carPos) return;
    setInitialCenter({ lat: carPos.lat, lng: carPos.lng });
    map.panTo(carPos);
  };

  const recenterToCustomer = () => {
    if (!carPos) return;
    setInitialCenter({ lat: carPos.lat, lng: carPos.lng });
    map.panTo(carPos);
  };

  const recenterToAllocator = () => {
    if (!carPos) return;
    setInitialCenter({ lat: currLat, lng: currLng });
    map.panTo(carPos);
  };

  const recenterToDestination = () => {
    setInitialCenter({ lat: endLat, lng: endLng });
    if (map) map.panTo({ lat: endLat, lng: endLng });
  };

  //////////////////////////////////////////////////////////////////////////
  // H) Handle Polyline Click Events
  //////////////////////////////////////////////////////////////////////////
  const handlePolylineClick = (e) => {
    const clickedLocation = e.latLng;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: clickedLocation }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const regionName = results[0].formatted_address;
        alert(`Clicked at: ${regionName}`);
      } else {
        console.error('Geocoder failed due to:', status);
      }
    });

    // Draw a circle around the clicked point
    new window.google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map: map,
      center: clickedLocation,
      radius: 500, // 500 meters
    });

    // Calculate distance from start and to destination
    if (directions) {
      const origin = directions.routes[0].legs[0].start_location;
      const destination = directions.routes[0].legs[0].end_location;

      const distanceFromStart = window.google.maps.geometry.spherical.computeDistanceBetween(origin, clickedLocation);
      const distanceToDestination = window.google.maps.geometry.spherical.computeDistanceBetween(clickedLocation, destination);

      alert(`Distance from Start: ${(distanceFromStart / 1000).toFixed(2)} km\nDistance to Destination: ${(distanceToDestination / 1000).toFixed(2)} km`);
    }
  };

  //////////////////////////////////////////////////////////////////////////
  // I) Backend API Interaction Functions
  //////////////////////////////////////////////////////////////////////////

  

  // Create a new trip in backend
  const createTrip = async () => {
    try {
      const tripData = {
        driverId: 'driver_id_here', // Replace with actual driver ID or fetch from state/auth
        customerId: 'customer_id_here', // Replace with actual customer ID or fetch from state/auth
        startLocation: {
          address: startAddress,
          coordinates: { lat: startLat, lng: startLng },
        },
        endLocation: {
          address: endAddress,
          coordinates: { lat: endLat, lng: endLng },
        },
      };

      const response = await axios.post(`${backendUrl}/trips`, tripData);
      console.log('Trip created:', response.data);
      // You can store trip ID in state if needed
    } catch (error) {
      console.error('Error creating trip:', error.response?.data || error.message);
    }
  };

  // Create or Update trip based on existing trip ID
  const createOrUpdateTrip = async () => {
    // Implement logic to create or update trip based on your application's flow
    // For simplicity, we'll assume creating a new trip
    await createTrip();
  };

  // Update trip's start location in backend
  const updateTripStartLocation = async (lat, lng, address) => {
    try {
      const tripId = 'trip_id_here'; // Replace with actual trip ID from state
      const updateData = {
        startLocation: {
          address,
          coordinates: { lat, lng },
        },
      };
      const response = await axios.put(`${backendUrl}/trips/${tripId}`, updateData);
      console.log('Trip start location updated:', response.data);
    } catch (error) {
      console.error('Error updating trip start location:', error.response?.data || error.message);
    }
  };

  // Update trip's end location in backend
  const updateTripEndLocation = async (lat, lng, address) => {
    try {
      const tripId = 'trip_id_here'; // Replace with actual trip ID from state
      const updateData = {
        endLocation: {
          address,
          coordinates: { lat, lng },
        },
      };
      const response = await axios.put(`${backendUrl}/trips/${tripId}`, updateData);
      console.log('Trip end location updated:', response.data);
    } catch (error) {
      console.error('Error updating trip end location:', error.response?.data || error.message);
    }
  };

  // Update trip's current location in backend
  const updateTripCurrentLocation = async (lat, lng) => {
    try {
      const tripId = 'trip_id_here'; // Replace with actual trip ID from state
      const updateData = {
        currentLocation: { lat, lng },
      };
      const response = await axios.put(`${backendUrl}/trips/${tripId}`, updateData);
      console.log('Trip current location updated:', response.data);
    } catch (error) {
      console.error('Error updating trip current location:', error.response?.data || error.message);
    }
  };

  // Reset trip's current location in backend
  const resetTripCurrentLocation = async () => {
    try {
      const tripId = 'trip_id_here'; // Replace with actual trip ID from state
      const updateData = {
        currentLocation: { lat: startLat, lng: startLng },
        status: 'Pending',
      };
      const response = await axios.put(`${backendUrl}/trips/${tripId}`, updateData);
      console.log('Trip current location reset:', response.data);
    } catch (error) {
      console.error('Error resetting trip current location:', error.response?.data || error.message);
    }
  };


    //////////////////////////////////////////////////////////////////////////
  // I) Handle Map Loading & Errors
  //////////////////////////////////////////////////////////////////////////
  if (loadError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error loading Google Maps.
      </div>
    );
  }

  if (!isLoaded || isGeoLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-700">Loading map...</div>
      </div>
    );
  }

  //////////////////////////////////////////////////////////////////////////
  // J) Render Component
  //////////////////////////////////////////////////////////////////////////
  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Uber-like Map with Autocomplete & Directions</h1>

      {/* Current Address Field */}
      <div className="w-full max-w-md mb-6">
        <label htmlFor="currentAddress" className="block text-gray-700 font-semibold mb-2">
          Current Address (Read-Only):
        </label>
        <input
        id="currentAddress"
            type='text'
            value={currAddress}
            onChange={handleCurrAddressChange}
            onBlur={handleCurrAddressBlur}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={currAddress ? true : false}
          
        />
        <div className="mt-2 text-sm text-gray-500">
          Latitude: {currLat.toFixed(5)}, Longitude: {currLng.toFixed(5)}
        </div>
      </div>

      {/* Full Current Address Field */}
      <div className="w-full max-w-md mb-6">
        <label htmlFor="fullCurrentAddress" className="block text-gray-700 font-semibold mb-2">
          Full Current Address
        </label>
        <textarea
          id="fullCurrentAddress"
          value={currAddress}
          onChange={handleCurrAddressChange}
          onBlur={handleCurrAddressBlur}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={currAddress ? true : false}
          rows="4"
        />
        <div className="mt-2 text-sm text-gray-500">
          <button
            onClick={updateCurrentPosition}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
          >
            Update Current Position
          </button>
        </div>
      </div>

      {/* Start Location Field */}
      <div className="w-full max-w-md mb-6">
        <label htmlFor="startLocation" className="block text-gray-700 font-semibold mb-2">
          Start Location:
        </label>
        <h2 className="text-lg font-medium text-gray-800">Start Position</h2>
        <p className="text-sm text-gray-600">Lat: {startLat.toFixed(5)}</p>
        <p className="text-sm text-gray-600">Lng: {startLng.toFixed(5)}</p>
        <Autocomplete
          onLoad={(autocomplete) => (startAutocompleteRef.current = autocomplete)}
          onPlaceChanged={onStartPlaceChanged}
        >
          <input
            type="text"
            id="startLocation"
            value={typedStart}
            onChange={handleStartChange}
            onBlur={handleStartBlur}
            placeholder="Type or Pick a Start Location"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </Autocomplete>
        <div className="mt-2 text-sm text-gray-500">
          Confirmed Start: <strong>{startAddress ? `${startAddress} (${startLat.toFixed(5)}, ${startLng.toFixed(5)})` : "(none)"}</strong>
        </div>
      </div>

      {/* End Location Field */}
      <div className="w-full max-w-md mb-6">
        <label htmlFor="endLocation" className="block text-gray-700 font-semibold mb-2">
          End Location:
        </label>
        <h2 className="text-lg font-medium text-gray-800">End Position</h2>
        <p className="text-sm text-gray-600">Lat: {endLat.toFixed(5)}</p>
        <p className="text-sm text-gray-600">Lng: {endLng.toFixed(5)}</p>
        <Autocomplete
          onLoad={(autocomplete) => (endAutocompleteRef.current = autocomplete)}
          onPlaceChanged={onEndPlaceChanged}
        >
          <input
            type="text"
            id="endLocation"
            value={typedEnd}
            onChange={handleEndChange}
            onBlur={handleEndBlur}
            placeholder="Type or Pick an End Location"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </Autocomplete>
        <div className="mt-2 text-sm text-gray-500">
          Confirmed End: <strong>{endAddress ? `${endAddress} (${endLat.toFixed(5)}, ${endLng.toFixed(5)})` : "(none)"}</strong>
        </div>
      </div>

      {/* Car Simulation Controls */}
      <div className="w-full max-w-md mb-6 flex flex-col space-y-4">
        {/* Trip Simulation Buttons */}
        <div className="flex space-x-4">
          {/**Start Car */}
          <button
            onClick={startCarSimulation}
            disabled={!directions}
            className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none ${
              !directions ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Start Car Simulation
          </button>
          {/**Pause Car */}
          <button
            onClick={pauseCar}
            disabled={!carIntervalRef.current}
            className={`px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 focus:outline-none ${
              !carIntervalRef.current ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Pause
          </button>
          {/** Resume Car */}
          <button
            onClick={resumeCar}
            disabled={!carIntervalRef.current}
            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none ${
              !carIntervalRef.current ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Resume
          </button>
          {/**Stop the Trip */}
          <button
            onClick={stopCarSimulation}
            disabled={!carIntervalRef.current}
            className={`px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 focus:outline-none ${
              !carIntervalRef.current ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Stop
          </button>
          {/**Reset */}
          <button
            onClick={resetCar}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
          >
            Reset
          </button>
        </div>

        {/* Recenter Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={recenterToCurrent}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none"
          >
            Recenter to Current
          </button>
          <button
            onClick={recenterToStart}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none"
          >
            Recenter to Start
          </button>
          <button
            onClick={recenterToCar}
            disabled={!carPos}
            className={`px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none ${
              !carPos ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Recenter to Car
          </button>
          <button
            onClick={recenterToDestination}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none"
          >
            Recenter to Destination
          </button>
        </div>

        {/* Follow Car Checkbox */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="followCar"
            checked={followCar}
            onChange={(e) => setFollowCar(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="followCar" className="text-gray-700">
            Follow Car (Auto-recenter)
          </label>
        </div>
      </div>

      {/* The Map */}
      <div className="w-full max-w-4xl">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={initialCenter}
          zoom={14}
          onLoad={(m) => setMap(m)}
        >
          {/* Current Location Marker */}
          <Marker
            position={{ lat: currLat, lng: currLng }}
            icon={{
              url: currentLocationRawSvgDataUrl,
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(20, 40),
              scaledSize: new window.google.maps.Size(40, 40),
            }}
          />

          {/* Start Marker */}
          <Marker
            position={{ lat: startLat, lng: startLng }}
            draggable
            icon={{
              url: startSvgDataUrl,
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 40),
            }}
            onDragEnd={handleStartDragEnd}
          />

          {/* End Marker */}
          <Marker
            position={{ lat: endLat, lng: endLng }}
            draggable
            icon={{
              url: endSvgDataUrl,
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 40),
            }}
            onDragEnd={handleEndDragEnd}
          />

          {/* Directions Renderer */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  strokeColor: '#1390d8',
                  strokeWeight: 4,
                  strokeOpacity: 0.7,
                },
                suppressMarkers: true, // We use custom markers
              }}
            />
          )}

          {/* Car Marker */}
          {carPos && (
            <>
              {/* Driver Marker */}
              <Marker
                position={{
                  lat: carPos.lat + 0.0002, // Slightly above the car
                  lng: carPos.lng,
                }}
                icon={{
                  url: dPatrick, // Driver SVG icon
                  anchor: new window.google.maps.Point(15, 15),
                  scaledSize: new window.google.maps.Size(30, 30),
                }}
                onClick={() => setSelectedMarker("driver")}
              />
              {selectedMarker === "driver" && (
                <InfoWindow
                  position={{
                    lat: carPos.lat + 0.0002,
                    lng: carPos.lng,
                  }}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="p-2">
                    <h3 className="font-semibold">Driver Information</h3>
                    <p>Name: D Partick</p>
                    <p>Status: Active</p>
                    <p>DL: DL53975358</p>
                    <p>Aadhar: 9485 8545 2378</p>
                  </div>
                </InfoWindow>
              )}

              {/* Car Marker */}
              <Marker
                position={carPos}
                icon={{
                  url: carIconUrl, // Car SVG icon
                  scaledSize: new window.google.maps.Size(30, 30),
                  anchor: new window.google.maps.Point(15, 15),
                }}
                onClick={() => setSelectedMarker("car")}
              />
              {selectedMarker === "car" && (
                <InfoWindow
                  position={carPos}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="p-2">
                    <h3 className="font-semibold">Car Information</h3>
                    <p>Model: Tesla Model 3</p>
                    <p>License Plate: XYZ-1234</p>
                    <p>Transmission: Automatic</p>
                  </div>
                </InfoWindow>
              )}

              {/* Customer Marker */}
              <Marker
                position={{
                  lat: carPos.lat - 0.0002, // Slightly below the car
                  lng: carPos.lng,
                }}
                icon={{
                  url: cSunidhi, // Customer SVG icon
                  anchor: new window.google.maps.Point(15, 15),
                  scaledSize: new window.google.maps.Size(30, 30),
                }}
                onClick={() => setSelectedMarker("customer")}
              />
              {selectedMarker === "customer" && (
                <InfoWindow
                  position={{
                    lat: carPos.lat - 0.0002,
                    lng: carPos.lng,
                  }}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="p-2">
                    <h3 className="font-semibold">Customer Information</h3>
                    <p>Name: Sunidhi Chauhan</p>
                    <p>Mobile: 89494 75859</p>
                    <p>Address: Sector 65, BPTP, #456, Gurgaon</p>
                    <p>Purpose: Marriage - Urgent</p>
                    <p>Destination: 123 Main St, IIT Delhi Campus</p>
                  </div>
                </InfoWindow>
              )}
            </>
          )}

          {/* Polyline Click Handling (Optional Enhancement) */}
          {directions && directions.routes[0].overview_path.map((point, idx) => (
            <Marker
              key={`path-${idx}`}
              position={point}
              visible={false} // Hidden markers to attach events
              onClick={handlePolylineClick}
            />
          ))}
        </GoogleMap>
      </div>
    </div>
  );
};

export default MapWithBackend;
