import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  DeviceEventEmitter,
  AppRegistry,
  Platform,
  NativeAppEventEmitter,
  PermissionsAndroid, // for checking if certain android permissions are enabled
  NativeEventEmitter, // for emitting events for the BLE manager
  NativeModules, // for getting an instance of the BLE manager module
  Button,
  ToastAndroid, // for showing notification if there's a new attendee
  FlatList, // for creating lists
  Alert,
  TouchableHighlight,
} from 'react-native';

import ListView from 'deprecated-react-native-listview';

import {createStackNavigator} from '@react-navigation/stack';
import {Picker} from '@react-native-community/picker';

import {BleManager} from 'react-native-ble-plx';

const DeviceManager = new BleManager();

export async function requestLocationPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Example App',
        message: 'Example App access to your location ',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can use the location');
      alert('You can use the location');
    } else {
      console.log('location permission denied');
      alert('Location permission denied');
    }
  } catch (err) {
    console.warn(err);
  }

  // BleManager.enableBluetooth()
  //   .then(() => {
  //     // Success code
  //     console.log('The bluetooth is already enabled or the user confirm');
  //   })
  //   .catch((error) => {
  //     // Failure code
  //     console.log('The user refuse to enable bluetooth');
  //   });

  // // Tells the library to detect iBeacons
  // Beacons.detectIBeacons();

  // // Start detecting all iBeacons in the nearby
  // try {
  //   await Beacons.startRangingBeaconsInRegion('REGION1');
  //   console.log(`Beacons ranging started succesfully!`);
  // } catch (err) {
  //   console.log(`Beacons ranging not started, error: ${error}`);
  // }

  // // Print a log of the detected iBeacons (1 per second)
  // DeviceEventEmitter.addListener('beaconsDidRange', (data) => {
  //   console.log('Found beacons!', data.beacons);
  // });
}

class ScanScreenV2 extends Component {
  constructor() {
    super();
  }

  state = {
    count: 0,
  };

  async componentDidMount() {
    await requestLocationPermission();
    const subscription = DeviceManager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        DeviceManager.startDeviceScan(null, null, (error, device) => {
          if (error) {
            console.log('error', error);
          }
          if (device !== null) {
            console.log(
              'device found ----> [id,name]',
              device.id,
              device.name,
              device.rssi,
            );
            this.setState({
              count: this.state.count + 1,
            });
            console.log(this.state.count);
            if (this.state.count > 20) {
              DeviceManager.stopDeviceScan();
            }
          }
        });

        subscription.remove();
      }
    }, true);
  }

  render() {
    const container = {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5FCFF',
    };

    return <View style={container}></View>;
  }
}
export default ScanScreenV2;
