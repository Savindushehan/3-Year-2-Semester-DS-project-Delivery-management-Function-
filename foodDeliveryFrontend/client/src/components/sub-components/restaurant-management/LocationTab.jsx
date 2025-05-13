import React, { useState, useEffect } from 'react';
import { Label, TextInput } from "flowbite-react";
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

const LocationTab = ({ formData, formErrors, onLocationUpdate, mapCenter }) => {
  const [locationValue, setLocationValue] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Map configuration
  const mapContainerStyle = {
    width: "100%",
    height: "400px",
    borderRadius: "0.5rem",
  };

  // Handle local input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onLocationUpdate({ [name]: value });
  };

  // Handle location selection from Google Places
  const handleLocationSelect = (place) => {
    setLocationValue(place);

    if (place?.value?.place_id && isMapLoaded) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ placeId: place.value.place_id }, (results, status) => {
        if (status === "OK" && results[0]) {
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();

          onLocationUpdate({
            latitude: lat,
            longitude: lng,
            address: place.label,
            formattedAddress: place.label,
          });
        }
      });
    }
  };

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    onLocationUpdate({
      latitude: lat,
      longitude: lng,
    });

    // Only attempt reverse geocoding if map is loaded
    if (isMapLoaded) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          onLocationUpdate({
            latitude: lat,
            longitude: lng,
            address: results[0].formatted_address,
            formattedAddress: results[0].formatted_address,
          });
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      <LoadScript
        googleMapsApiKey="AIzaSyCms2-r4afPJIKiStBZUNuRx_4BdU2p9ps"
        libraries={["places"]}
        onLoad={() => {
          console.log("Google Maps API loaded successfully");
          setIsMapLoaded(true);
        }}
        onError={(error) =>
          console.error("Google Maps API loading failed:", error)
        }
      >
        <div className="mb-4">
          <Label
            htmlFor="location"
            value="Restaurant Location *"
            className="mb-2"
          />
          <GooglePlacesAutocomplete
            apiKey="AIzaSyCms2-r4afPJIKiStBZUNuRx_4BdU2p9ps"
            selectProps={{
              value: locationValue,
              onChange: handleLocationSelect,
              placeholder:
                formData.address || "Search for an address...",
              styles: {
                control: (provided) => ({
                  ...provided,
                  padding: "4px",
                  borderColor: "#D1D5DB",
                  boxShadow: "none",
                }),
              },
            }}
          />
          {formErrors.location && (
            <p className="text-sm text-red-500 mt-1">
              {formErrors.location}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="address" value="Address *" />
          <TextInput
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter full address"
            required
            color={formErrors.address ? "failure" : undefined}
          />
          {formErrors.address && (
            <p className="text-sm text-red-500 mt-1">
              {formErrors.address}
            </p>
          )}
        </div>

        <div>
          <Label
            htmlFor="formattedAddress"
            value="Formatted Address"
          />
          <TextInput
            id="formattedAddress"
            name="formattedAddress"
            value={formData.formattedAddress}
            onChange={handleInputChange}
            placeholder="Enter formatted address (as it should appear)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude" value="Latitude" />
            <TextInput
              id="latitude"
              name="latitude"
              type="number"
              value={formData.latitude}
              onChange={handleInputChange}
              step="0.000001"
            />
          </div>
          <div>
            <Label htmlFor="longitude" value="Longitude" />
            <TextInput
              id="longitude"
              name="longitude"
              type="number"
              value={formData.longitude}
              onChange={handleInputChange}
              step="0.000001"
            />
          </div>
        </div>

        <div className="mt-4">
          <Label value="Pin Location on Map" />
          <p className="text-sm text-gray-500 mb-2">
            Click on the map to set your restaurant location
          </p>
          {isMapLoaded && (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={15}
              center={mapCenter}
              onClick={handleMapClick}
            >
              <Marker position={mapCenter} />
            </GoogleMap>
          )}
        </div>
      </LoadScript>
    </div>
  );
};

export default LocationTab;