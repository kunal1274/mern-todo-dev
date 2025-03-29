import React, { useState, useEffect, useRef } from 'react';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  DirectionsRenderer,
  Autocomplete,    // RED: We import Autocomplete from @react-google-maps/api
  useJsApiLoader,
} from '@react-google-maps/api';
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



// RED: We define helper functions for forward & reverse geocoding in-line
//      so you can see them. Or you'd import from a separate 'geocode.js'.
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
  // heading is from 0..360, where 0 = north, 90 = east, 180 = south, 270 = west typically
  // but note that Google’s computeHeading might define 0 = north, 90 = east, etc. 
  // Bucket into 8 directions each spanning 45 degrees
  // We define midlines for each direction, e.g.:
  //   N = 337.5..360 & 0..22.5
  //   NE = 22.5..67.5
  //   E = 67.5..112.5
  //   SE = 112.5..157.5
  //   S = 157.5..202.5
  //   SW = 202.5..247.5
  //   W = 247.5..292.5
  //   NW = 292.5..337.5

  // Normalize heading to 0..360
  const h = (heading + 360) % 360;

  if ((h >= 337.5 && h < 360) || (h >= 0 && h < 22.5)) {
    return 'N'; // 0 
  } else if (h >= 22.5 && h < 67.5) {
    return 'NE'; // 45
  } else if (h >= 67.5 && h < 112.5) {
    return 'E'; // 90 
  } else if (h >= 112.5 && h < 157.5) {
    return 'SE'; // 135
  } else if (h >= 157.5 && h < 202.5) {
    return 'S'; // 180
  } else if (h >= 202.5 && h < 247.5) {
    return 'SW'; // 225
  } else if (h >= 247.5 && h < 292.5) {
    return 'W'; //270
  } else {
    return 'NW';
  }
}


function getCarIcon(direction) {
  // 8 possible icons
  switch (direction) {
    case 'N':  return carNorthSvg;  
    case 'NE': return carNorthEastSvg; 
    case 'E':  return carEastSvg;
    case 'SE': return carSouthEastSvg;
    case 'S':  return carSouthSvg;
    case 'SW': return carSouthWestSvg;
    case 'W':  return carWestSvg;
    case 'NW': return carNorthWestSvg;
    default:   return carNorthSvg; // fallback
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

// const currentLocationRawSvgDataUrl = `data:image/svg+xml;base64,${btoa(currentLocationRawSvg)}`;
// const startSvgDataUrl = `data:image/svg+xml;base64,${btoa(startRawSvg)}`;
// const endSvgDataUrl = `data:image/svg+xml;base64,${btoa(endRawSvg)}`;
// const carRawSvgDataUrl = `data:image/svg+xml;base64,${btoa(carSouthEastSvg)}`;


const libraries = ['places', 'geometry']; // RED: 'places' for Autocomplete

const MapWithDraggablePinAndDirections = () => {
  // 1) Map loading states
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const [map, setMap] = useState(null);
  const [isGeoLoading, setIsGeoLoading] = useState(true);

  // Current Position which will never change and can't be changed by the user
  const [currLat,setCurrLat] = useState(defaultCenter.lat);
  const [currLng,setCurrLng] = useState(defaultCenter.lng);
  const [currAddress,setCurrAddress] = useState('');

  // 2) Start & End location states
  // RED: We have separate states for lat/lng & address for both START & END
  const [typedStart, setTypedStart] = useState("");
  const [startLat, setStartLat] = useState(currLat + 0.01);
  const [startLng, setStartLng] = useState(currLng + 0.01);
  const [startAddress, setStartAddress] = useState('');

  const [typedEnd, setTypedEnd] = useState("");
  const [endLat, setEndLat] = useState(currLat + 0.02);
  const [endLng, setEndLng] = useState(currLng + 0.02);
  const [endAddress, setEndAddress] = useState('');

   // RED: We'll store the map's initial center here. 
  // We only set it once after geolocation or fallback. 
  const [initialCenter, setInitialCenter] = useState(null);

  // RED: Car simulation states
  const [carPos, setCarPos] = useState(null);
  const [carHeading, setCarHeading] = useState(0); // angle in degrees
  const [carIconUrl,setCarIconUrl] = useState(carNorthSvg);

  const [carIndex, setCarIndex] = useState(0);
  const [carPaused, setCarPaused] = useState(false); // is the simulation paused?
  const carPathRef = useRef([]); // store the route path
  const carIntervalRef = useRef(null);
  const carPausedRef = useRef(false);

 
 

  // 4) Directions state
  // RED: If both addresses are known, we’ll show directions
  const [directions, setDirections] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);


  // RED: We'll have a boolean for "followCar" to auto-recenter every 30s
  const [followCar, setFollowCar] = useState(false)

   // 3) Refs for autocomplete
  // RED: We create references for the Autocomplete inputs
  const startAutocompleteRef = useRef(null);
  const endAutocompleteRef = useRef(null);

  const followCarRef = useRef(false)


  useEffect(() => {
    followCarRef.current = followCar
  }, [followCar])

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


  // Current address for record purpose 

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
      setStartAddress(addr); // finalize
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
    } catch (error) {
      console.error(error);
    }
  };

  //////////////////////////////////////////////////////////////////////////
  // C) Handle Typing in Start & End Inputs
  //////////////////////////////////////////////////////////////////////////
  // START
  const handleStartChange = (e) => {
    setTypedStart(e.target.value);
  };
  const handleStartBlur = async () => {
    if (!typedStart) return;
    try {
      const coords = await forwardGeocode(typedStart);
      setStartLat(coords.lat);
      setStartLng(coords.lng);
      setStartAddress(typedStart); // finalize
      if (map) map.panTo(coords);
    } catch (err) {
      console.error(err);
    }
  };

  // END
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
      if (place && place.formatted_address) {
        // If Google recognized it
       // setStartAddress(place.formatted_address);
       setTypedStart(place.formatted_address);
      } else {
        // If user typed something not recognized, do nothing special yet
        // We'll handle it on blur
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
      if (place && place.formatted_address) {
        //setEndAddress(place.formatted_address);
        setTypedEnd(place.formatted_address);
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
  // E) SHOW DIRECTIONS WHEN BOTH START & END ADDRESSES ARE VALID
  //////////////////////////////////////////////////////////////////////////
  // RED: Whenever startLat/Lng + endLat/Lng change, attempt directions
  //      if both have valid addresses
  useEffect(() => {
    if (!isLoaded) return;
    if (!startAddress || !endAddress) {
      setDirections(null);
      return};
    //if (!endAddress) return;

    // Attempt to fetch directions
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: startLat, lng: startLng },
        destination: { lat: endLat, lng: endLng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
          // RED: Reset car simulation
          carPathRef.current = result.routes[0].overview_path; // array of latlng
          setCarPos(null);
          setCarHeading(0);
          setCarIconUrl(carNorthSvg);
          setCarIndex(0);
          stopCarSimulation(); // clear any old intervals
        } else {
          console.error('Directions request failed:', status);
          setDirections(null);
        }
      }
    );
  }, [startLat, startLng, endLat, endLng, startAddress, endAddress, isLoaded]);

  /////////////////////////////////////
  // 6) Car Simulation
  //////////////////////////////////////



  const computeCarHeading = (fromPos, toPos) => {
    // fromPos, toPos are google.maps.LatLng objects
    // geometry.spherical.computeHeading => angle in degrees from -180...180
    const heading = window.google.maps.geometry.spherical.computeHeading(fromPos, toPos);
    // Marker rotation usually wants 0..360. Let's ensure positive angles.
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

    // step every 1 second
    carIntervalRef.current = setInterval(() => {
      // setCarIndex((prev) => {
      //   const next = prev + 1;
      //   if (next < carPathRef.current.length) {
      //     const latLng = carPathRef.current[next];
      //     setCarPos({ lat: latLng.lat(), lng: latLng.lng() });
      //     return next;
      //   } else {
      //     // done
      //     clearInterval(carIntervalRef.current);
      //     carIntervalRef.current = null;
      //     return prev;
      //   }
      // });
      setCarIndex((prevIndex) => {
        if (prevIndex >= carPathRef.current.length - 1) {
          // ride is completed 
          clearInterval(carIntervalRef.current);
          carIntervalRef.current = null;
          return prevIndex;
        }
        // car is paused then what to do 
        if (carPausedRef.current) {
          return prevIndex; // if paused, do nothing
        }
        // car is moving 
        const nextIndex = prevIndex + 1;
        let fromLatLng = carPathRef.current[prevIndex];
        let toLatLng = carPathRef.current[nextIndex];

        // update car heading
        const newHeading = computeCarHeading(fromLatLng, toLatLng);
        const newDirection = headingToDirection(newHeading); // one of 'N','NE','E','SE','S','SW','W','NW'
        setCarIconUrl(getCarIcon(newDirection));
        setCarHeading(newHeading);

        // update car position
        setCarPos({
          lat: toLatLng.lat(),
          lng: toLatLng.lng(),
        });

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
  };

  //  // RED: An effect that runs every 30s to auto-recenter if "followCar" is on
  //  useEffect(() => {
  //   // Only do this once we have a map and a center
  //   if (!map || !initialCenter) return
  //   // We'll set an interval of 30s
  //   const intervalId = setInterval(() => {
  //     console.log("Auto-center check: followCar =", followCarRef.current, "carPos =", carPos);
  //     if (followCarRef.current && carPos) {
  //       console.log("Auto-recentering on car now!");
  //       // Recenter on the car
  //       setInitialCenter({ 
  //         lat: carPos.lat + 0.001, 
  //         lng: carPos.lng + 0.001 
  //       })
  //     }
  //   }, 10000)

  //   return () => clearInterval(intervalId)
  // }, [map, initialCenter, carPos])

  //////////////////////////////////////////////////////////////////////////
  // F) Auto-Recenter to Car When Follow Car is Enabled
  //////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (followCar && carPos && map) {
      map.panTo(carPos);
    }
  }, [carPos, followCar, map]);

   // We'll define some recenter utility:
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
  // RENDER
  //////////////////////////////////////////////////////////////////////////
  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Uber-like Map with Autocomplete & Directions</h2>

      {/* Current Address Field */}
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <label>
          Current Position ( Read-Only ):
          <input
            type='text'
            value={currAddress}
            onChange={handleCurrAddressChange}
            onBlur={handleCurrAddressBlur}
            style={{ marginLeft: '0.5rem', width: '300px' }}
            disabled={currAddress ? true : false}
          />
        </label>
      </div>

      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
  <label>
    Full Current Address
    <textarea
      value={currAddress}
      onChange={handleCurrAddressChange}
      onBlur={handleCurrAddressBlur}
      style={{ marginLeft: '0.5rem', width: '300px', height: '100px' }} // Adjusted for textarea size
      disabled={currAddress ? true : false}
    />
  </label>
  <h2>Current Position</h2>
        <p>Lat: {currLat}</p>
        <p>Lng: {currLng}</p>
        <button onClick={updateCurrentPosition}>Update Current Position</button>
</div>



      {/* START Field */}
      <div style={{ margin: '0.5rem auto', width: '90%', maxWidth: '400px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          Start Location:
        </label>
        <h2>Start Position</h2>
        <p>Lat: {startLat}</p>
        <p>Lng: {startLng}</p>
        <Autocomplete
          onLoad={(autocomplete) => (startAutocompleteRef.current = autocomplete)}
          onPlaceChanged={onStartPlaceChanged}
        >
          <input
            type="text"
            //value={startAddress}
            value={typedStart}
            //onChange={(e) => setStartAddress(e.target.value)}
            //onBlur={handleStartAddressBlur}
            onChange={handleStartChange}
            onBlur={handleStartBlur}
            placeholder="Type or Pick a Start Location"
            style={{ width: '100%', padding: '8px' }}
          />
        </Autocomplete>
        <p>
          Confirmed Start:{" "}
          <strong>
            {startAddress
              ? `${startAddress} (${startLat.toFixed(5)}, ${startLng.toFixed(5)})`
              : "(none)"}
          </strong>
        </p>
      </div>

      {/* END Field */}
      <div style={{ margin: '0.5rem auto', width: '90%', maxWidth: '400px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          End Location:
        </label>
        <h2>End Position</h2>
        <p>Lat: {endLat}</p>
        <p>Lng: {endLng}</p>
        <Autocomplete
          onLoad={(autocomplete) => (endAutocompleteRef.current = autocomplete)}
          onPlaceChanged={onEndPlaceChanged}
        >
          <input
            type="text"
            value={typedEnd}
            //onChange={(e) => setEndAddress(e.target.value)}
            //onBlur={handleEndAddressBlur}
            onChange={handleEndChange}
            onBlur={handleEndBlur}
            placeholder="Type or pick an end"
            style={{ width: '100%', padding: '8px' }}
          />
        </Autocomplete>
        <p>
          Confirmed End:{" "}
          <strong>
            {endAddress
              ? `${endAddress} (${endLat.toFixed(5)}, ${endLng.toFixed(5)})`
              : "(none)"}
          </strong>
        </p>
      </div>

       {/* Buttons for car simulation */}
       <div style={{ marginBottom: "1rem" }} className='space-x-4 flex'>
        <button onClick={startCarSimulation} disabled={!directions}>
          Start Car Simulation
        </button>
        <button onClick={pauseCar} disabled={!carIntervalRef.current}>
          Pause
        </button>
        <button onClick={resumeCar} disabled={!carIntervalRef.current}>
          Resume
        </button>
        <button onClick={stopCarSimulation} style={{ marginLeft: "1rem" }}>
          Stop Car
        </button>
        <button onClick={resetCar}>Reset</button>

      <div style={{ marginBottom: '1rem' }}>
        <button onClick={recenterToCurrent}>Recenter to CURRENT</button>
        <button onClick={recenterToStart}>Recenter to START</button>
        <button onClick={recenterToCar} disabled={!carPos}>
          Recenter to CAR
        </button>
        <button onClick={recenterToDestination}>Recenter to DEST</button>
      </div>
      </div>

      {/* RED: A checkbox or button to toggle followCar */}
      <div style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="checkbox"
            checked={followCar}
            onChange={(e) => setFollowCar(e.target.checked)}
          />
          Follow Car (auto-recenter every 30s)
        </label>
      </div>

      

      {/* The Map */}
      <div style={{ width: '90%', maxWidth: '800px', margin: '1rem auto' }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={initialCenter}
          //center={{lat : startLat , lng : startLng}}
          //defaultCenter={{ lat: carPos.lat, lng: carPos.lng }}
          zoom={14}
          onLoad={(m) => setMap(m)}
        >
           {/* landmark Marker */}
           <Marker
            position={{ lat: currLat, lng: currLng }}
            //draggable
            icon={{
              url : currentLocationRawSvgDataUrl,
              origin: new window.google.maps.Point(0, 0),
                anchor: new window.google.maps.Point(20, 40),
                scaledSize: new window.google.maps.Size(40, 40),
            }}
            //onDragEnd={handleStartDragEnd}
          />

          {/* START Marker */}
          <Marker
            position={{ lat: startLat, lng: startLng }}
            draggable
            icon={{
                // Use a custom icon
                //url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                url : startSvgDataUrl,
                // origin: new window.google.maps.Point(0, 0),
                // anchor: new window.google.maps.Point(15, 15),
                // scaledSize: new window.google.maps.Size(30, 30),
                scaledSize: new window.google.maps.Size(40, 40),
                anchor: new window.google.maps.Point(20, 40),
              }}
            onDragEnd={handleStartDragEnd}
          />
          {/* END Marker */}
          <Marker
            position={{ lat: endLat, lng: endLng }}
            draggable
            icon={{
                // Use a custom icon
                //url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                url : endSvgDataUrl,
                origin: new window.google.maps.Point(0, 0),
                anchor: new window.google.maps.Point(20, 40),
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            onDragEnd={handleEndDragEnd}
          />

          {/* If directions exist, show them */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                // For a more custom route line:
                polylineOptions: {
                  strokeColor: '#0000FF',
                  strokeWeight: 4,
                  strokeOpacity: 0.7,
                },
                suppressMarkers: true, // We show custom Start/End markers
              }}
            />
          )}

          {/* RED: Car marker if we have a position */}
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
              // label={{
              //   text: "Driver",
              //   fontSize: "12px",
              //   color: "#FF0000", // Red color for driver label
              //   className: "bg-white px-1 rounded shadow text-center",
              // }}
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
          <p>DL : DL53975358</p>
          <p>Aadhar : 9485 8545 2378</p>
        </div>
      </InfoWindow>
    )}
        
            {/* Car Marker */}
            <Marker
              position={carPos}
              icon={{
                url: carIconUrl, // Car SVG icon
                anchor: new window.google.maps.Point(15, 15),
                scaledSize: new window.google.maps.Size(30, 30),
              }}
              onClick={() => setSelectedMarker("car")}
              // label={{
              //   text: "Car",
              //   fontSize: "12px",
              //   color: "#0000FF", // Blue color for car label
              //   className: "bg-white px-1 rounded shadow text-center",
              // }}
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
          <p>Transmission : Automatic</p>
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
              // label={{
              //   text: "Customer",
              //   fontSize: "12px",
              //   color: "#00FF00", // Green color for customer label
              //   className: "bg-white px-1 rounded shadow text-center",
              // }}
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
          <p>Mobile : 89494 75859</p>
          <p>Address : Sector 65 , BPTP , # 456 , Gurgaon </p>
          <p>Purpose : Marriage - Urgent</p>
          <p>Destination: 123 Main St, iit delhi campus</p>
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

export default MapWithDraggablePinAndDirections;
