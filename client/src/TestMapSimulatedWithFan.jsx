// src/components/Map/MapWithBackendSimulationFan.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  DirectionsRenderer,
  Autocomplete,   // ✅ Correct import
  useJsApiLoader,
} from '@react-google-maps/api';
import axios from 'axios';
import Draggable from "react-draggable";
// import ReactDOM from 'react-dom'; // For React Portals (Removed as modals are handled differently)

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
import logWithDebugInfo from './utility/getDebugInfo';
import FloatingPanel from './components/FloatingPanel';
import Spinner from './components/Spinner';

//const backendUrl = import.meta.env.VITE_BACKEND_LIVE_DEV_URL || import.meta.env.VITE_BACKEND_LIVE_DEV_URL; // Ensure this environment variable is correctly set
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

const libraries = ['places', 'geometry']; // ✅ Correct libraries for Autocomplete and geometry calculations

const MapWithBackendSimulationFan = () => {
  // 1) Load Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const [map, setMap] = useState(null);
  const [isGeoLoading, setIsGeoLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);

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

  // utilities
  const [isFanOpen, setIsFanOpen] = useState(false); // To control fan expansion
  const [selectedOption, setSelectedOption] = useState(null); // Track selected option
  const [isPinned, setIsPinned] = useState(false); // To control pinning

  // Lists fetched from backend
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [trips, setTrips] = useState([]);

  // Selected records for simulation
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Modal visibility states
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);

  // Form states for creating new records
  const [newDriver, setNewDriver] = useState({ name: '', vehicle: '', licensePlate: '' });
  const [newCustomer, setNewCustomer] = useState({ name: '', mobile: '', address: '', vehicle: '', licensePlate: '' });
  const [newTrip, setNewTrip] = useState({
    driverId: '',
    customerId: '',
    driverVehicle: '',
    driverLicensePlate: '',
    customerVehicle: '',
    customerLicensePlate: '',
    startLocation: { address: '', coordinates: { lat: 0, lng: 0 } },
    endLocation: { address: '', coordinates: { lat: 0, lng: 0 } },
    distance: 0, // in km
    duration: 0, // in minutes
    cost: 0, // in Rs.
    slot: 2, // in hours
    status: 'Pending',
  });

  // Trip Cost Calculation States
  const [tripCostRate, setTripCostRate] = useState(20); // Rs. 20/km
  const [tripPausedTime, setTripPausedTime] = useState(0); // in seconds
  const pausedTimerRef = useRef(null);

  const followCarRef = useRef(false);

  // Autocomplete Refs
  const startAutocompleteRef = useRef(null);
  const endAutocompleteRef = useRef(null);

  useEffect(() => {
    followCarRef.current = followCar;
  }, [followCar]);

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

          logWithDebugInfo(`curr Lat ${userLat} and curr Lng ${userLng}`);
          // Reverse geocode so the startAddress is set
          reverseGeocode(userLat, userLng)
            .then((addr) => setCurrAddress(addr))
            .catch((err) => {
              // ❌ Issue 2: Incorrect syntax in catch block
              // Fixed by closing the curly brace properly
              logWithDebugInfo("reverse geocode current location fetch error", err)
            })
            .finally(() => {
              // ✅ Fix Issue 1: Set initialCenter only once to prevent map from re-centering repeatedly
              setInitialCenter({ lat: userLat + 0.01, lng: userLng + 0.01 });
              setIsGeoLoading(false)
            });
        },
        (err) => {
          //console.error('Geolocation error:', err);
          logWithDebugInfo('Geolocation error', err);
          // Fallback to default center
          setInitialCenter({ 
            lat: defaultCenter.lat + 0.01, 
            lng: defaultCenter.lng + 0.01 
          });
          setIsGeoLoading(false);
        }
      );
    } else {
      logWithDebugInfo("An Error Occurred", "Geolocation not supported")
      //console.error('Geolocation not supported.');
      // Fallback to default center
      setInitialCenter({
        lat: defaultCenter.lat + 0.01,
        lng: defaultCenter.lng + 0.01,
      });
      setIsGeoLoading(false);
    }
  }, [isLoaded]);

  // Fetch existing Drivers, Customers, Trips from backend
  useEffect(() => {
    if (!isLoaded) return;

    // Fetch Drivers
    const fetchDrivers = async () => {
      try {
        const response = await axios.get(`${backendUrl}/drivers`);
        logWithDebugInfo("data", response.data);
        setDrivers(response.data);
      } catch (error) {
        logWithDebugInfo('Error fetching drivers:', error.response?.data || error.message);
      }
    };

    // Fetch Customers
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(`${backendUrl}/customers`);
        setCustomers(response.data);
      } catch (error) {
        logWithDebugInfo('Error fetching customers:', error.response?.data || error.message);
      }
    };

    // Fetch Trips
    const fetchTrips = async () => {
      try {
        const response = await axios.get(`${backendUrl}/trips`);
        setTrips(response.data);
      } catch (error) {
        logWithDebugInfo('Error fetching trips:', error.response?.data || error.message);
      }
    };

    fetchDrivers();
    fetchCustomers();
    fetchTrips();
  }, [isLoaded]);

   // Whenever carPaused state changes, keep the ref in sync:
   useEffect(() => {
    carPausedRef.current = carPaused;
  }, [carPaused]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsFanOpen(false); // Close fan on selection
  };

  const handlePinToggle = () => {
    setIsPinned(!isPinned);
  };

  const handleClosePanel = () => {
    setSelectedOption(null); // Close the floating panel
  };

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
        // console.error(error)
        logWithDebugInfo("An Error Occurred",error)
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
      logWithDebugInfo("An Error Occurred", error)
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
      // console.error(error);
      logWithDebugInfo("An Error Occurred", error)
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
      // console.error(err);
      logWithDebugInfo("An Error Occurred", err)
    }
  };

  /// this we will work later .. we need customer address to auto fetch. 
  const handleCustAddressBlur = async () => {
    //if (!typedStart) return;
    try {
      const coords = await forwardGeocode(typedStart);
      setStartLat(coords.lat);
      setStartLng(coords.lng);
      setStartAddress(typedStart);
      if (map) map.panTo(coords);

      // Update trip in backend
      await updateTripStartLocation(coords.lat, coords.lng, typedStart);
    } catch (err) {
      // console.error(err);
      logWithDebugInfo("An Error Occurred", err)
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
      // console.error(err);
      logWithDebugInfo("An Error Occurred", err)
    }
  };


    //////////////////////////////////////////////////////////////////////////
  // C) HANDLE ADDRESS INPUTS WITH AUTOCOMPLETE
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
        // console.error(error);
        logWithDebugInfo("An Error Occurred",error)
       
      }
    };

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
          logWithDebugInfo("An Error Occurred",error)
        }
      };
    

  const handleStartPlaceChanged = () => {
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

        // ✅ Fix Issue 2: Preventing repeated updates by checking if trip is selected
        if (selectedTrip) {
          // Update trip in backend
          updateTripStartLocation(lat, lng, place.formatted_address || place.name);
        }
      }
    }
  };

  const handleEndPlaceChanged = () => {
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

        // ✅ Fix Issue 2: Preventing repeated updates by checking if trip is selected
        if (selectedTrip) {
          // Update trip in backend
          updateTripEndLocation(lat, lng, place.formatted_address || place.name);
        }
      }
    }
  };

  //////////////////////////////////////////////////////////////////////////
  // D) Show Directions When a Trip is Selected
  //////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (!isLoaded) return;
    if (!selectedTrip) return;

    console.log('Effect triggered. Dependencies changed:', { selectedTrip, isLoaded });

    const fetchDirections = async () => {
      try {
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
          {
            origin: {
              lat: selectedTrip.startLocation.coordinates.lat || startLat,
              lng: selectedTrip.startLocation.coordinates.lng || startLng,
            },
            destination: {
              lat: selectedTrip.endLocation.coordinates.lat || endLat,
              lng: selectedTrip.endLocation.coordinates.lng || endLng,
            },
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          async (result, status) => {
            if (status === 'OK') {
              setDirections(result);

              // Extract distance and duration
              const route = result.routes[0].legs[0];
              const distanceInKm = route.distance.value / 1000; // meters to km
              const durationInMinutes = route.duration.value / 60; // seconds to minutes

              // Calculate cost
              let cost = 1000; // Flat rate
              if (distanceInKm > 30) {
                cost += 20 * (distanceInKm - 30);
              }

              // 🟢 Fix Issue 2: Add condition to prevent repeated updates
              if (
                selectedTrip.distance !== distanceInKm ||
                selectedTrip.duration !== durationInMinutes ||
                selectedTrip.cost !== cost
              ) {
                // Update trip details in state
                setSelectedTrip((prev) => ({
                  ...prev,
                  distance: distanceInKm,
                  duration: durationInMinutes,
                  cost: cost,
                }));

                // Update trip in backend
                await updateTripDetails(selectedTrip._id, distanceInKm, durationInMinutes, cost);
              }

              // Reset car simulation
              carPathRef.current = result.routes[0].overview_path; // array of LatLng
              setCarPos(null);
              setCarHeading(0);
              setCarIconUrl(carNorthSvg);
              setCarIndex(0);
              stopCarSimulation(); // clear any old intervals

              // Optionally, update trip status to 'Ongoing'
              await updateTripStatus(selectedTrip._id, 'Ongoing');
            } else {
              logWithDebugInfo('Directions request failed:', status);
              setDirections(null);
            }
          }
        );
      } catch (error) {
        logWithDebugInfo('Error fetching directions:', error);
      }
    };

    fetchDirections();
// }, [startLat, startLng, endLat, endLng, startAddress, endAddress, isLoaded]);
  }, [selectedTrip, isLoaded]); // Removed unnecessary dependencies to prevent multiple triggers

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
    setTripPausedTime(0); // Initialize paused time

    // 🟢 Fix Issue 1: Ensure carPathRef has valid LatLng objects
    carIntervalRef.current = setInterval(() => {
      setCarIndex((prevIndex) => {
        if (prevIndex >= carPathRef.current.length - 1) {
          // Ride is completed
          clearInterval(carIntervalRef.current);
          carIntervalRef.current = null;
          // Update trip status to 'Completed'
          updateTripStatus(selectedTrip._id, 'Completed');
          return prevIndex;
        }
        if (carPausedRef.current) {
          // Increment paused time
          setTripPausedTime((prevTime) => {
            const newTime = prevTime + 1;
            if (newTime > 30) {
              // ❌ Issue 2: Incorrect cost calculation
              // Original: const additionalCost = 0.01;
              // Fix: Calculate based on time
              const additionalCost = 0.01 * newTime;
              setSelectedTrip((prev) => ({
                ...prev,
                cost: prev.cost + additionalCost,
              }));
              updateTripCost(selectedTrip._id, additionalCost);
              setTripPausedTime(0); // Reset paused time after cost update
            }
            return newTime;
          });
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
    setCarPaused(true);
    updateTripStatus(selectedTrip._id, 'Paused');

    // Start paused timer
    pausedTimerRef.current = setInterval(() => {
      setTripPausedTime((prevTime) => {
        const newTime = prevTime + 1;
        if (newTime > 30) {
          // ❌ Issue 2: Incorrect cost calculation
          // Original: const additionalCost = 0.01;
          // Fix: Calculate based on paused time
          const additionalCost = 0.01 * newTime;
          setSelectedTrip((prev) => ({
            ...prev,
            cost: prev.cost + additionalCost,
          }));
          updateTripCost(selectedTrip._id, additionalCost);
          return 0; // Reset paused time after cost update
        }
        return newTime;
      });
    }, 1000);
  };

  const resumeCar = () => {
    setCarPaused(false);
    updateTripStatus(selectedTrip._id, 'Ongoing');
    // Clear paused timer
    if (pausedTimerRef.current) {
      clearInterval(pausedTimerRef.current);
      pausedTimerRef.current = null;
      setTripPausedTime(0);
    }
  };

  const stopCarSimulation = () => {
    if (carIntervalRef.current) {
      clearInterval(carIntervalRef.current);
      carIntervalRef.current = null;
      // Optionally, update trip status to 'Stopped'
      updateTripStatus(selectedTrip._id, 'Stopped');
    }
    // Clear paused timer if any
    if (pausedTimerRef.current) {
      clearInterval(pausedTimerRef.current);
      pausedTimerRef.current = null;
      setTripPausedTime(0);
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
    // Reset trip status to 'Pending'
    updateTripStatus(selectedTrip._id, 'Pending');
    // Reset cost
    const previousCost = selectedTrip.cost;
    setSelectedTrip((prev) => ({
      ...prev,
      cost: 1000, // Flat rate
    }));
    // 🟢 Fix Issue 2: Correct cost reset calculation
    const additionalCost = 1000 - previousCost;
    updateTripCost(selectedTrip._id, additionalCost); // Reset to flat rate
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
    if (map) {
      map.panTo({ lat: currLat, lng: currLng });
      // ✅ Fix Issue 3: Remove setting initialCenter to prevent map from re-centering automatically
      // setInitialCenter({ lat: currLat, lng: currLng }); // Removed
    }
  };
  const recenterToStart = () => {
    if (map) {
      map.panTo({ lat: startLat, lng: startLng });
      // setInitialCenter({ lat: startLat, lng: startLng }); // Removed
    }
  };
  const recenterToCar = () => {
    if (!carPos) return;
    if (map) {
      map.panTo(carPos);
      // setInitialCenter({ lat: carPos.lat, lng: carPos.lng }); // Removed
    }
  };

  const recenterToDriver = () => {
    if (!selectedDriver) return;
    // Assuming driver has a current location; otherwise, use a default or last known location
    const driverLocation = { lat: selectedDriver.currentLocation.lat, lng: selectedDriver.currentLocation.lng };
    if (map && driverLocation.lat && driverLocation.lng) {
      map.panTo(driverLocation);
    }
  };

  const recenterToCustomer = () => {
    if (!selectedCustomer) return;
    // Assuming customer has a current location; otherwise, use a default or last known location
    const customerLocation = { lat: selectedCustomer.currentLocation.lat, lng: selectedCustomer.currentLocation.lng };
    if (map && customerLocation.lat && customerLocation.lng) {
      map.panTo(customerLocation);
    }
  };

  const recenterToAllocator = () => {
    if (map) {
      map.panTo({ lat: currLat, lng: currLng });
      // setInitialCenter({ lat: currLat, lng: currLng }); // Removed
    }
  };

  const recenterToDestination = () => {
    if (map) {
      map.panTo({ lat: endLat, lng: endLng });
      // setInitialCenter({ lat: endLat, lng: endLng }); // Removed
    }
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
        //console.error('Geocoder failed due to:', status);
        logWithDebugInfo('Geocoder failed due to:', status);
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

  // Create Driver
  const handleCreateDriver = async (e) => {
    e.preventDefault();
    setIsSpinning(true);
    console.log("new driver", newDriver)
    try {
      const response = await axios.post(`${backendUrl}/drivers`, newDriver);
      console.log("response driver of create", response.data)
      setDrivers([...drivers, response.data]);
      console.log("with new drivers", drivers)
      setNewDriver({ name: '', vehicle: '', licensePlate: '' });
      setIsDriverModalOpen(false);
      alert('Driver added successfully!');
      setIsSpinning(false);
    } catch (error) {
      logWithDebugInfo('Error creating driver:', error.response?.data || error.message);
      alert('Failed to add driver.');
      setIsSpinning(false);
    }
  };

   // Create Customer
   const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setIsSpinning(true);
    
    try {
      const response = await axios.post(`${backendUrl}/customers`, newCustomer);
      setCustomers([...customers, response.data]);
      setNewCustomer({ name: '', mobile: '', address: '', vehicle: '', licensePlate: '' });
      setIsCustomerModalOpen(false);
      alert('Customer added successfully!');
      setIsSpinning(false);
    } catch (error) {
      logWithDebugInfo('Error creating customer:', error.response?.data || error.message);
      alert('Failed to add customer.');
      setIsSpinning(false);
    }
  };

  // Create Trip
  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setIsSpinning(true);
    try {

       // Calculate distance and duration based on selectedTrip
       const distance = selectedTrip ? selectedTrip.distance : 0;
       const duration = selectedTrip ? selectedTrip.duration : 0;
       const cost = selectedTrip ? selectedTrip.cost : 1000;

      const response = await axios.post(`${backendUrl}/trips`, newTrip);
      setTrips([...trips, response.data]);
      setNewTrip({
        driverId: '',
        customerId: '',
        driverVehicle: '',
        driverLicensePlate: '',
        customerVehicle: '',
        customerLicensePlate: '',
        startLocation: { address: '', coordinates: { lat: 0, lng: 0 } },
        endLocation: { address: '', coordinates: { lat: 0, lng: 0 } },
        distance: 0,
        duration: 0,
        cost: 0,
        slot: 2,
        status: 'Pending',
      });
      setIsTripModalOpen(false);
      alert('Trip added successfully!');
      setIsSpinning(false);
    } catch (error) {
      logWithDebugInfo('Error creating trip:', error.response?.data || error.message);
      alert('Failed to add trip.');
      setIsSpinning(false);
    }
  };

  // Update Trip Status
  const updateTripStatus = async (tripId, status) => {
    try {
      const response = await axios.put(`${backendUrl}/trips/${tripId}`, { status });
      logWithDebugInfo('Trip status updated:', response.data);
    } catch (error) {
      logWithDebugInfo('Error updating trip status:', error.response?.data || error.message);
    }
  };

  // Update Trip Cost
  const updateTripCost = async (tripId, additionalCost) => {
    try {
      const trip = trips.find((t) => t._id === tripId);
      if (!trip) return;
      const newCost = trip.cost + additionalCost;
      const response = await axios.put(`${backendUrl}/trips/${tripId}`, { cost: newCost });
      logWithDebugInfo('Trip cost updated:', response.data);
    } catch (error) {
      logWithDebugInfo('Error updating trip cost:', error.response?.data || error.message);
    }
  };

  // Update Trip Details (Distance, Duration, Cost)
  const updateTripDetails = async (tripId, distance, duration, cost) => {
    try {
      const updateData = { distance, duration, cost };
      const response = await axios.put(`${backendUrl}/trips/${tripId}`, updateData);
      logWithDebugInfo('Trip details updated:', response.data);
    } catch (error) {
      logWithDebugInfo('Error updating trip details:', error.response?.data || error.message);
    }
  };

  // Update trip's start location in backend
  const updateTripStartLocation = async (lat, lng, address) => {
    if (!selectedTrip) return;
    try {
      const tripId = selectedTrip._id;
      const updateData = {
        startLocation: {
          address,
          coordinates: { lat, lng },
        },
      };
      const response = await axios.put(`${backendUrl}/trips/${tripId}`, updateData);
      logWithDebugInfo('Trip start location updated:', response.data);
    } catch (error) {
      logWithDebugInfo('Error updating trip start location:', error.response?.data || error.message);
    }
  };

  // Update trip's end location in backend
  const updateTripEndLocation = async (lat, lng, address) => {
    if (!selectedTrip) return;
    try {
      const tripId = selectedTrip._id;
      const updateData = {
        endLocation: {
          address,
          coordinates: { lat, lng },
        },
      };
      const response = await axios.put(`${backendUrl}/trips/${tripId}`, updateData);
      logWithDebugInfo('Trip end location updated:', response.data);
    } catch (error) {
      logWithDebugInfo('Error updating trip end location:', error.response?.data || error.message);
    }
  };

  // Update trip's current location in backend
  const updateTripCurrentLocation = async (lat, lng) => {
    if (!selectedTrip) return;
    try {
      const tripId = selectedTrip._id;
      const updateData = {
        currentLocation: { lat, lng },
      };
      const response = await axios.put(`${backendUrl}/trips/${tripId}`, updateData);
      logWithDebugInfo('Trip current location updated:', response.data);
    } catch (error) {
      logWithDebugInfo('Error updating trip current location:', error.response?.data || error.message);
    }
  };

  // Reset trip's current location and status in backend
  const resetTripCurrentLocation = async () => {
    if (!selectedTrip) return;
    try {
      const tripId = selectedTrip._id;
      const updateData = {
        currentLocation: { lat: selectedTrip.startLocation.coordinates.lat, lng: selectedTrip.startLocation.coordinates.lng },
        status: 'Pending',
        cost: 1000, // Reset to flat rate
      };
      const response = await axios.put(`${backendUrl}/trips/${tripId}`, updateData);
      logWithDebugInfo('Trip current location reset:', response.data);
    } catch (error) {
      logWithDebugInfo('Error resetting trip current location:', error.response?.data || error.message);
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
          onPlaceChanged={handleStartPlaceChanged}
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
          onPlaceChanged={handleEndPlaceChanged}
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

      <p>Old Version</p>

      {/* Dropdowns and Modal Triggers */}
      <div className="w-full max-w-4xl mb-6 flex flex-col space-y-4">
        {/* Select Driver */}
        <div className="flex items-center space-x-2">
          <label htmlFor="selectDriver" className="w-24 text-gray-700 font-semibold">
            Driver:
          </label>
          <select
            id="selectDriver"
            value={selectedDriver ? selectedDriver._id : ''}
            onChange={(e) => {
              const driver = drivers.find((d) => d._id === e.target.value);
              setSelectedDriver(driver || null);
              setNewTrip((prev) => ({ ...prev, driverId: driver ? driver._id : '' })); // Update newTrip
            }}
            className="flex-1 p-2 border border-gray-300 rounded"
          >
            <option value="">Select Driver</option>
            {drivers?.map((driver) => (
              <option key={driver._id} value={driver._id}>
                {driver.name} ({driver.licensePlate})
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsDriverModalOpen(true)}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add
          </button>
        </div>

        {/* Select Customer */}
        <div className="flex items-center space-x-2">
          <label htmlFor="selectCustomer" className="w-24 text-gray-700 font-semibold">
            Customer:
          </label>
          <select
            id="selectCustomer"
            value={selectedCustomer ? selectedCustomer._id : ''}
            onChange={(e) => {
              const customer = customers.find((c) => c._id === e.target.value);
              setSelectedCustomer(customer || null);
              setNewTrip((prev) => ({ ...prev, customerId: customer ? customer._id : '' })); // Update newTrip
            }}
            className="flex-1 p-2 border border-gray-300 rounded"
          >
            <option value="">Select Customer</option>
            {customers?.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.name} ({customer.mobile})
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add
          </button>
        </div>

        {/* Select Trip */}
        <div className="flex items-center space-x-2">
          <label htmlFor="selectTrip" className="w-24 text-gray-700 font-semibold">
            Trip:
          </label>
          <select
            id="selectTrip"
            value={selectedTrip ? selectedTrip._id : ''}
            onChange={(e) => {
              const trip = trips.find((t) => t._id === e.target.value);
              setSelectedTrip(trip || null);
              if (trip) {
                // Automatically populate driver and customer based on trip
                const customer = customers.find((c) => c._id === trip.customerId);
                const driver = drivers.find((d) => d._id === trip.driverId);
                console.log("line 1324", customer, driver )

                setSelectedCustomer(customer || null);
                setSelectedDriver(driver || null);

                // Update newTrip data
                setNewTrip((prev) => ({
                  ...prev,
                  driverId: driver ? driver._id : '',
                  customerId: customer ? customer._id : '',
                }));
                // Set simulation based on selected trip
                setStartLat(trip.startLocation.coordinates.lat);
                setStartLng(trip.startLocation.coordinates.lng);
                setStartAddress(trip.startLocation.address);
                setEndLat(trip.endLocation.coordinates.lat);
                setEndLng(trip.endLocation.coordinates.lng);
                setEndAddress(trip.endLocation.address);
              }
            }}
            className="flex-1 p-2 border border-gray-300 rounded"
          >
            <option value="">Select Trip</option>
            {trips?.map((trip) => (
              <option key={trip._id} value={trip._id}>
                Trip {trip._id} - {trip.startLocation.address} to {trip.endLocation.address}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsTripModalOpen(true)}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add
          </button>
        </div>
      </div>

      {/* Driver Modal */}
      {isDriverModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-2xl font-bold mb-4">Add New Driver</h2>
            {isSpinning && <Spinner />}
            <form onSubmit={handleCreateDriver}>
              <label className="block mb-2">
                Name:
                <input
                  type="text"
                  value={newDriver.name}
                  onChange={(e) => {
                    setNewDriver({ ...newDriver, name: e.target.value });
                    logWithDebugInfo("new driver name", newDriver.name);
                  }}
                  required
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </label>
              <label className="block mb-2">
                Vehicle:
                <input
                  type="text"
                  value={newDriver.vehicle}
                  onChange={(e) => setNewDriver({ ...newDriver, vehicle: e.target.value })}
                  required
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </label>
              <label className="block mb-4">
                License Plate:
                <input
                  type="text"
                  value={newDriver.licensePlate}
                  onChange={(e) => setNewDriver({ ...newDriver, licensePlate: e.target.value })}
                  required
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </label>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsDriverModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-2xl font-bold mb-4">Add New Customer</h2>
            {isSpinning && <Spinner />}
            <form onSubmit={handleCreateCustomer}>
              <label className="block mb-2">
                Name:
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  required
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </label>
              <label className="block mb-2">
                Mobile:
                <input
                  type="text"
                  value={newCustomer.mobile}
                  onChange={(e) => setNewCustomer({ ...newCustomer, mobile: e.target.value })}
                  required
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </label>
              
              <label className="block mb-4">
                Address:
                {/* 🟢 Fix Issue 3: Removed Autocomplete for address to prevent map from interfering */}
                <textarea
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  required
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </label>
              <label className="block mb-2">
                Vehicle:
                <input
                  type="text"
                  value={newCustomer.vehicle}
                  onChange={(e) => setNewCustomer({ ...newCustomer, vehicle: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </label>
              <label className="block mb-2">
                License Plate:
                <input
                  type="text"
                  value={newCustomer.licensePlate}
                  onChange={(e) => setNewCustomer({ ...newCustomer, licensePlate: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </label>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trip Modal */}
      {isTripModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-2xl font-bold mb-4">Add New Trip</h2>
            {isSpinning && <Spinner />}
            <form onSubmit={handleCreateTrip}>
              <label className="block mb-2">
                Driver:
                <select
                  value={newTrip.driverId}
                  onChange={(e) => setNewTrip({ ...newTrip, driverId: e.target.value })}
                  required
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                >
                  <option value="">Select Driver</option>
                  {drivers.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.name} ({driver.licensePlate})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block mb-2">
                Driver Vehicle:
                <input
                  type="text"
                  value={newTrip.driverVehicle}
                  onChange={(e) => setNewTrip({ ...newTrip, driverVehicle: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </label>
              <label className="block mb-2">
                Driver License Plate:
                <input
                  type="text"
                  value={newTrip.driverLicensePlate}
                  onChange={(e) => setNewTrip({ ...newTrip, driverLicensePlate: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </label>
              <label className="block mb-2">
                Customer:
                <select
                  value={newTrip.customerId}
                  onChange={(e) => setNewTrip({ ...newTrip, customerId: e.target.value })}
                  required
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} ({customer.mobile})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block mb-2">
                Customer Vehicle:
                <input
                  type="text"
                  value={newTrip.customerVehicle}
                  onChange={(e) => setNewTrip({ ...newTrip, customerVehicle: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </label>
              <label className="block mb-2">
                Customer License Plate:
                <input
                  type="text"
                  value={newTrip.customerLicensePlate}
                  onChange={(e) => setNewTrip({ ...newTrip, customerLicensePlate: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </label>


<label className="block mb-2">
  Start Address:
  <Autocomplete
    onLoad={(autocomplete) => (startAutocompleteRef.current = autocomplete)}
    onPlaceChanged={async () => {
      if (startAutocompleteRef.current) {
        const place = startAutocompleteRef.current.getPlace();
        console.log("place", place);
        if (place && place.geometry) {
          const { lat, lng } = place.geometry.location;
          const formattedAddress = place.formatted_address || '';

          // Update newTrip state with fetched address and coordinates
          setNewTrip((prev) => ({
            ...prev,
            startLocation: {
              address: formattedAddress,
              coordinates: { lat: lat(), lng: lng() },
            },
          }));

          setStartLat(lat());
          setStartLng(lng());
          setStartAddress(formattedAddress);
          setTypedStart(formattedAddress);

          if (map) {
            map.panTo({ lat: lat(), lng: lng() });
          }

          // Optionally, update the backend if required
          try {
            await updateTripStartLocation(lat(), lng(), formattedAddress);
          } catch (err) {
            console.error("Error updating start location in backend:", err);
          }
        }
      }
    }}
  >
    <input
      type="text"
      value={newTrip.startLocation.address}
      onChange={(e) =>
        setNewTrip((prev) => ({
          ...prev,
          startLocation: {
            ...prev.startLocation,
            address: e.target.value,
          },
        }))
      }
      placeholder="Enter start address"
      className="w-full p-2 border border-gray-300 rounded mt-1"
      required
    />
  </Autocomplete>
</label>



<label className="block mb-2">
  End Address:
  <Autocomplete
    onLoad={(autocomplete) => (endAutocompleteRef.current = autocomplete)}
    onPlaceChanged={async () => {
      if (endAutocompleteRef.current) {
        const place = endAutocompleteRef.current.getPlace();
        console.log("end place", place);
        if (place && place.geometry) {
          const { lat, lng } = place.geometry.location;
          const formattedAddress = place.formatted_address || '';

          // Update newTrip state with fetched address and coordinates
          setNewTrip((prev) => ({
            ...prev,
            endLocation: {
              address: formattedAddress,
              coordinates: { lat: lat(), lng: lng() },
            },
          }));

          setEndLat(lat());
          setEndLng(lng());
          setEndAddress(formattedAddress);
          setTypedEnd(formattedAddress);

          if (map) {
            map.panTo({ lat: lat(), lng: lng() });
          }

          // Optionally, update the backend if required
          try {
            await updateTripEndLocation(lat(), lng(), formattedAddress);
          } catch (err) {
            console.error("Error updating End location in backend:", err);
          }
        }
      }
    }}
  >
    <input
      type="text"
      value={newTrip.endLocation.address}
      onChange={(e) =>
        setNewTrip((prev) => ({
          ...prev,
          endLocation: {
            ...prev.endLocation,
            address: e.target.value,
          },
        }))
      }
      placeholder="Enter end address"
      className="w-full p-2 border border-gray-300 rounded mt-1"
      required
    />
  </Autocomplete>
</label>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsTripModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trip Details Display */}
      {selectedTrip && (
        <div className="w-full max-w-md mb-4 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Trip Details</h2>
          <p><strong>Distance:</strong> {selectedTrip.distance.toFixed(2)} km</p>
          <p><strong>Duration:</strong> {selectedTrip.duration.toFixed(2)} minutes</p>
          <p><strong>Cost:</strong> Rs. {selectedTrip.cost.toFixed(2)}</p>
          <p><strong>Status:</strong> {selectedTrip.status}</p>
        </div>
      )}

      {/* Car Simulation Controls */}
      <div className="w-full max-w-md mb-6 flex flex-col space-y-4">
        {/* Trip Simulation Buttons */}
        <div className="flex space-x-4">
          {/**Start Car */}
          <button
            onClick={startCarSimulation}
            disabled={!directions || !selectedTrip}
            className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none ${
              !directions || !selectedTrip ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Start Car Simulation
          </button>
          {/**Pause Car */}
          <button
            onClick={pauseCar}
            disabled={!carIntervalRef.current || carPaused} // ✅ Fix Issue 2: Prevent pausing if already paused
            className={`px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 focus:outline-none ${
              !carIntervalRef.current || carPaused ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Pause
          </button>
          {/** Resume Car */}
          <button
            onClick={resumeCar}
            disabled={!carIntervalRef.current || !carPaused} // ✅ Fix Issue 2: Only resume if paused
            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none ${
              !carIntervalRef.current || !carPaused ? 'opacity-50 cursor-not-allowed' : ''
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
          // ❌ Issue 3: Center prop causes the map to re-center automatically on state changes
          // Remove the center prop to allow manual panning and zooming
          // center={initialCenter} // Removed
          zoom={14}
          onLoad={(m) => {
            setMap(m);
            if (initialCenter) {
              m.panTo(initialCenter);
            }
          }}
        >
          {/* Current Location Marker */}
          <Marker
            position={{ lat: currLat, lng: currLng }}
            icon={{
              url: currentLocationRawSvgDataUrl,
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(15, 30),
              scaledSize: new window.google.maps.Size(15, 30),
            }}
          />

          {/* Start Marker */}
          <Marker
            position={{ lat: startLat, lng: startLng }}
            draggable
            icon={{
              url: startSvgDataUrl,
              scaledSize: new window.google.maps.Size(30, 40),
              anchor: new window.google.maps.Point(30, 40),
            }}
            onDragEnd={handleStartDragEnd}
          />

          {/* End Marker */}
          <Marker
            position={{ lat: endLat, lng: endLng }}
            draggable
            icon={{
              url: endSvgDataUrl,
              scaledSize: new window.google.maps.Size(30, 40),
              anchor: new window.google.maps.Point(30, 40),
            }}
            onDragEnd={handleEndDragEnd}
          />

          {/* Directions Renderer */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  strokeColor: '#00304d',
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
              {/* Car Marker */}
              <Marker
                position={carPos}
                icon={{
                  url: carIconUrl, // Car SVG icon
                  scaledSize: new window.google.maps.Size(50, 50),
                  anchor: new window.google.maps.Point(25, 25),
                }}
                onClick={() => setSelectedMarker("car")}
              />
              {selectedMarker === 'car' && (
                <InfoWindow
                  position={carPos}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="p-2">
                    <h3 className="font-semibold">Car Information</h3>
                    <p>Model: {selectedTrip && selectedTrip.driverVehicle ? selectedTrip.driverVehicle : 'N/A'}</p>
                    <p>License Plate: {selectedTrip ? selectedTrip.driverLicensePlate : 'N/A'}</p>
                    <p>Transmission: Automatic</p>
                  </div>
                </InfoWindow>
              )}
            </>
          )}

          {/* Polyline Click Handling */}
          {directions && directions.routes[0].overview_path.map((point, idx) => (
            <Marker
              key={`path-${idx}`}
              position={point}
              visible={false} // Hidden markers to attach events
              onClick={handlePolylineClick}
            />
          ))}
        </GoogleMap>

        {/* Fan Menu */}
        <div className="absolute bottom-10 left-10 z-20">
          <div className="relative">
            {/* Central Button */}
            <button
              onClick={() => setIsFanOpen(!isFanOpen)}
              className="w-16 h-16 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center"
            >
              Menu
            </button>

            {/* Fan Options */}
            {isFanOpen && (
              <div className="absolute -top-24 -left-24 w-48 h-48">
                <div className="relative w-full h-full">
                  {/* Driver Option */}
                  <button
                    onClick={() => handleOptionSelect("driver")}
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-green-500 rounded-full shadow-md"
                  >
                    D
                  </button>
                  {/* Car Option */}
                  <button
                    onClick={() => handleOptionSelect("car")}
                    className="absolute top-1/2 left-0 transform -translate-y-1/2 w-12 h-12 bg-yellow-500 rounded-full shadow-md"
                  >
                    C
                  </button>
                  {/* Customer Option */}
                  <button
                    onClick={() => handleOptionSelect("customer")}
                    className="absolute top-1/2 right-0 transform -translate-y-1/2 w-12 h-12 bg-red-500 rounded-full shadow-md"
                  >
                    U
                  </button>
                  {/* Trip Option */}
                  <button
                    onClick={() => handleOptionSelect("trip")}
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-purple-500 rounded-full shadow-md"
                  >
                    T
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Panel */}
        {selectedOption && (
          <Draggable disabled={isPinned}>
            <div className="absolute top-20 left-20 z-30 bg-white border shadow-lg rounded-md p-4 w-64">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold capitalize">{selectedOption} Information</h3>
                <button
                  onClick={handleClosePanel}
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                >
                  Close
                </button>
              </div>
              {selectedOption === "driver" && (
                <>
                  <p><strong>Name:</strong> {selectedDriver?.name || "N/A"}</p>
                  <p><strong>Status:</strong> {selectedDriver?.status || "N/A"}</p>
                  <p><strong>License Plate:</strong> {selectedDriver?.licensePlate || "N/A"}</p>
                </>
              )}
              {selectedOption === "car" && (
                <>
                  <p><strong>Model:</strong> {selectedTrip?.driverVehicle || "N/A"}</p>
                  <p><strong>License Plate:</strong> {selectedTrip?.driverLicensePlate || "N/A"}</p>
                  <p><strong>Transmission:</strong> Automatic</p>
                </>
              )}
              {selectedOption === "customer" && (
                <>
                  <p><strong>Name:</strong> {selectedCustomer?.name || "N/A"}</p>
                  <p><strong>Mobile:</strong> {selectedCustomer?.mobile || "N/A"}</p>
                  <p><strong>Address:</strong> {selectedCustomer?.address || "N/A"}</p>
                </>
              )}
              {selectedOption === "trip" && (
                <>
                  <p><strong>Driver:</strong> {selectedDriver?.name || "N/A"}</p>
                  <p><strong>Customer:</strong> {selectedCustomer?.name || "N/A"}</p>
                  <p><strong>Destination:</strong> {selectedTrip?.endLocation?.address || "N/A"}</p>
                  <p><strong>Status:</strong> {selectedTrip?.status || "N/A"}</p>
                </>
              )}
              <button
                onClick={handlePinToggle}
                className="mt-2 text-blue-500 hover:underline focus:outline-none"
              >
                {isPinned ? "Unpin" : "Pin"}
              </button>
            </div>
          </Draggable>
        )}
      

       
      </div>
    </div>
  );
};

export default MapWithBackendSimulationFan;
