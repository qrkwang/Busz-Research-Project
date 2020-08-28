import React, {Component} from 'react';
import {Text, View, ActivityIndicator, Button} from 'react-native';
import MapView from 'react-native-maps';
import styles from './styles';

// Disable yellow box warning messages
console.disableYellowBox = true;

navigator.geolocation = require('@react-native-community/geolocation');

export default class TestBluetooth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      region: {
        latitude: 10,
        longitude: 10,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      },
      isMapReady: false,
      marginTop: 1,
      userLocation: '',
      regionChangeProgress: false,
    };
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        };
        this.setState({
          region: region,
          loading: false,
          error: null,
        });
      },
      (error) => {
        alert(error);
        this.setState({
          error: error.message,
          loading: false,
        });
      },
      {enableHighAccuracy: false, timeout: 200000, maximumAge: 5000},
    );
  }

  onMapReady = () => {
    this.setState({isMapReady: true, marginTop: 0});
  };

  // Fetch location details as a JOSN from google map API
  fetchAddress = () => {
    fetch(
      'https://maps.googleapis.com/maps/api/geocode/json?address=' +
        this.state.region.latitude +
        ',' +
        this.state.region.longitude +
        '&key=' +
        'AIzaSyDyHobQxn1VQux2U7yxZmAOPG7p28JX1x0',
    )
      .then((response) => response.json())
      .then((responseJson) => {
        const userLocation = responseJson.results[0].formatted_address;
        this.setState({
          userLocation: userLocation,
          regionChangeProgress: false,
        });
      });
  };

  // Update state on region change
  onRegionChange = (region) => {
    this.setState(
      {
        region,
        regionChangeProgress: true,
      },
      () => this.fetchAddress(),
    );
  };

  // Action to be taken after select location button click
  onLocationSelect = () => alert(this.state.userLocation);

  animate() {
    let r = {
      latitude: 42.5,
      longitude: 15.2,
      latitudeDelta: 7.5,
      longitudeDelta: 7.5,
    };

    if (this.map) {
      this.map.animateToRegion(r, 2000);
    }
  }

  render() {
    if (this.state.loading) {
      return (
        <View style={styles.spinnerView}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <View style={{flex: 2}}>
            {!!this.state.region.latitude && !!this.state.region.longitude && (
              <MapView
                ref={(ref) => (this.map = ref)}
                style={{...styles.map, marginTop: this.state.marginTop}}
                initialRegion={this.state.region}
                showsMyLocationButton={true}
                showsTraffic={true}
                showsUserLocation={true}
                onMapReady={this.onMapReady}
                onRegionChangeComplete={this.onRegionChange}
                region={this.state.region}>
                {/* <MapView.Marker
                  coordinate={{ "latitude": this.state.region.latitude, "longitude": this.state.region.longitude }}
                  title={"Your Location"}
                  draggable
                /> */}
              </MapView>
            )}

            <View style={styles.mapMarkerContainer}>
              <Text
                style={{
                  fontFamily: 'fontawesome',
                  fontSize: 42,
                  color: '#ad1f1f',
                }}>
                &#xf041;
              </Text>
            </View>
          </View>
          <View style={styles.deatilSection}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                fontFamily: 'roboto',
                marginBottom: 5,
              }}>
              Move map for location
            </Text>
            <Text style={{fontSize: 10, color: '#999'}}>LOCATION</Text>
            <Text
              numberOfLines={2}
              style={{
                fontSize: 14,
                paddingVertical: 10,
                borderBottomColor: 'silver',
                borderBottomWidth: 0.5,
              }}>
              {!this.state.regionChangeProgress
                ? this.state.userLocation
                : 'Identifying Location...'}
            </Text>
            <View style={styles.btnContainer}>
              <Button
                title="PICK THIS LOCATION"
                disabled={this.state.regionChangeProgress}
                onPress={this.animate()}></Button>
            </View>
          </View>
        </View>
      );
    }
  }
}
