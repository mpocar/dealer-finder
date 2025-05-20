import { useState, useCallback } from "react";

interface LocationCoordinates {
  lat: number;
  lng: number;
}

interface LocationServiceResult {
  userLocation: LocationCoordinates | null;
  locationError: string | null;
  isLocating: boolean;
  getUserLocation: () => Promise<LocationCoordinates | null>;
}

export function useLocationService(): LocationServiceResult {
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(
    null
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const getUserLocation =
    useCallback(async (): Promise<LocationCoordinates | null> => {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by your browser");
        return null;
      }

      setIsLocating(true);
      setLocationError(null);

      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            });
          }
        );

        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setUserLocation(location);
        setIsLocating(false);
        return location;
      } catch (error) {
        if (error instanceof GeolocationPositionError) {
          let errorMessage = "Failed to get your location";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location access denied. Please enable location services in your browser.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Your current location is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again.";
              break;
          }

          setLocationError(errorMessage);
        } else {
          setLocationError(
            "An unexpected error occurred while getting your location."
          );
        }

        setIsLocating(false);
        return null;
      }
    }, []);

  return {
    userLocation,
    locationError,
    isLocating,
    getUserLocation,
  };
}
