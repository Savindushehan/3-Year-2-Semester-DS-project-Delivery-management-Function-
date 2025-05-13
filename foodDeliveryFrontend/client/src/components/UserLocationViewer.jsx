import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';

const containerStyle = {
  width: '100%',
  height: '400px',
};

function UserLocationViewer({ userId = 'R1' }) {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('Loading...');
  
  userId="R2";
  var orderId="R00";
  useEffect(() => {
    const fetchLocation = async () => {
      try {

      //  const response = await axios.get(`http://localhost:8083/api/location/user/${userId}/order/${orderId}`);
      const response = await axios.get(`http://localhost:8089/api/location/user/${userId}/order/${orderId}`);
        const locations = response.data;

        if (Array.isArray(locations) && locations.length > 0) {
          const last = locations[locations.length - 1]; // get last recorded location
          setLocation({
            lat: parseFloat(last.latitude),
            lng: parseFloat(last.longitude)
          });
          setStatus(`Latest location found for user: ${userId}`);
        } else {
          setStatus('No location found for user');
        }
      } catch (error) {
        console.error('Error fetching location:', error);
        setStatus('Error fetching location');
      }
    };

    fetchLocation();
  }, [userId]);

  return (
    <div>
      <p>{status}</p>
      <LoadScript googleMapsApiKey="AIzaSyCms2-r4afPJIKiStBZUNuRx_4BdU2p9ps">
        {location && !isNaN(location.lat) && !isNaN(location.lng) && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={location}
            zoom={16}
          >
            <Marker position={location} />
          </GoogleMap>
        )}
      </LoadScript>
    </div>
  );
}

export default UserLocationViewer;
