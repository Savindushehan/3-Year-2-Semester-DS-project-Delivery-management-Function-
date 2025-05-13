import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';
import { useParams } from "react-router-dom";
import { Button } from '@mui/material'; // ✅ Import MUI Button properly

const containerStyle = {
  width: '100%',
  height: '400px',
};

function LocationMap() {
  const [currentLocation, setCurrentLocation] = useState(null);
 const { orderId, userId } = useParams();


  useEffect(() => {
    console.log("Order ID:"+orderId);
    console.log("User ID:"+userId);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Could not get your current location.');
        // Optional fallback
        setCurrentLocation({ lat: 6.9271, lng: 79.8612 });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // Cleanup on unmount
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleSendLocation = async () => {
    try {
      if (!currentLocation) {
        alert('Location not available yet!');
        return;
      }

      //  const response = await axios.post('http://localhost:8083/api/location', {
      const response = await axios.post('http://localhost:8089/api/location', {
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        userId:userId,
        orderId:orderId,
      });

      if (response.status === 200) {
        alert('Location sent successfully!');
      } else {
        alert('Failed to send location.');
      }
    } catch (error) {
      console.error('Error sending location:', error);
      alert('Error sending location.');
    }
  };

  return (
    <div>
      <LoadScript googleMapsApiKey="AIzaSyCms2-r4afPJIKiStBZUNuRx_4BdU2p9ps">
        {currentLocation && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentLocation}
            zoom={15}
          >
            <Marker position={currentLocation} />
          </GoogleMap>
        )}
      </LoadScript>

      <div style={{ marginTop: '32px', marginBottom:"2rem",display: 'flex', justifyContent: 'center' }}>
  <Button
    variant="contained"
    size="small"
    onClick={handleSendLocation}
    sx={{
      textTransform: "none",
      fontWeight: "bold",
      borderRadius: 2,
      boxShadow: 1,
      backgroundColor: "#52be80",
      "&:hover": {
        backgroundColor: "#45a163",
      },
    }}
  >
    Send Location
  </Button>
</div>
    </div>
  );
}

export default LocationMap;
