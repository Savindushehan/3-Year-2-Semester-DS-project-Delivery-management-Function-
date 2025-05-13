import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';
import { useParams } from "react-router-dom";

const containerStyle = {
  width: '100%',
  height: '400px',
};

const googleMapsApiKey = 'AIzaSyCms2-r4afPJIKiStBZUNuRx_4BdU2p9ps'; // Move to .env later

function CustomerTrackingOrder() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const { orderId, userId } = useParams();

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const url = `http://localhost:8089/api/location/user/${userId}/order/${orderId}`;
        console.log('Fetching location from:', url);
  
        const response = await axios.get(url);
  
        console.log('Response data:', response.data);
  
        if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
          const latestLocation = response.data[0]; // 🚀 Take the first item (latest)
  
          let latitude = Number(latestLocation.latitude);
          let longitude = Number(latestLocation.longitude);
  
          if (!isNaN(latitude) && !isNaN(longitude)) {
            setCurrentLocation({ lat: latitude, lng: longitude });
            console.log('Location fetched successfully!', { latitude, longitude });
          } else {
            console.error('Invalid coordinates received:', { latitude, longitude });
            alert('Invalid location data received.');
          }
        } else {
          console.error('No location data available.');
          alert('No location data available.');
        }
      } catch (error) {
        console.error('Error fetching location:', error.message || error);
        alert('Error fetching location.');
      }
    };
  
    fetchLocation();
  }, [orderId, userId]);
  

  return (
    <div>
      <LoadScript googleMapsApiKey={googleMapsApiKey}>
        {currentLocation ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentLocation}
            zoom={15}
          >
            <Marker position={currentLocation} />
          </GoogleMap>
        ) : (
          <p>Loading map...</p>
        )}
      </LoadScript>
    </div>
  );
}

export default CustomerTrackingOrder;
