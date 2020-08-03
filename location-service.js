// import Geocoder from 'react-native-geocoding';
// import geolocation from '@react-native-community/geolocation';

export const getLocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (data) => resolve(data.coords),
      (err) => reject(err),
    );
  });
};
