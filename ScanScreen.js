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
} from 'react-native';

import ListView from 'deprecated-react-native-listview';

import {createStackNavigator} from '@react-navigation/stack';
import {Picker} from '@react-native-community/picker';

import BleManager from 'react-native-ble-manager'; // for talking to BLE peripherals
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule); // create an event emitter for the BLE Manager module
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

  BleManager.enableBluetooth()
    .then(() => {
      // Success code
      console.log('The bluetooth is already enabled or the user confirm');
    })
    .catch((error) => {
      // Failure code
      console.log('The user refuse to enable bluetooth');
    });

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

class ScanScreen extends Component {
  // renderRow({item}) {
  //   return <ListItem library={item} />;
  // }
  constructor(props) {
    super(props);

    const dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
    });
    this.devices = [];
    this.state = {
      dataSource: dataSource.cloneWithRows(this.devices),
    };
  }
  handleDiscoverPeripheral(data) {
    console.log('Got ble data', data);
    this.setState({ble: data});
  }
  async componentDidMount() {
    await requestLocationPermission();
    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);

    NativeAppEventEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      this.handleDiscoverPeripheral,
    );
    // NativeAppEventEmitter.addListener(
    //   'BleManagerDiscoverPeripheral',
    //   (data) => {
    //     console.timeLog(data);
    //     let device = 'device found: ' + data.name + '(' + data.id + ')';

    //     if (this.devices.indexOf(device) == -1) {
    //       this.devices.push(device);
    //     }

    //     let newState = this.state;
    //     newState.dataSource = newState.dataSource.cloneWithRows(this.devices);
    //     this.setState(newState);
    //   },
    // );
    BleManager.start({showAlert: false}).then(() => {
      // Success code
      console.log('Module initialized');
    });
  }

  // startScanning() {
  //   console.log('start scanning');
  //   BleManager.scan([], 120);
  // }

  scanNearByDevices(serviceUUIDList, duration, isAllowDuplicates) {
    BleManager.scan(serviceUUIDList, duration, isAllowDuplicates).then(
      (results) => {
        console.log('Scanning...');
        // this.setState({scanning: true});
      },
    );
  }

  render() {
    return (
      <View>
        <Text>Bluetooth scanner</Text>
        <Button
          onPress={() => this.scanNearByDevices(this.devices, 2, true)}
          title="Start scanning"
        />
        {/* <FlatList data={this.devices} renderItem={this.renderRow} />
         */}
        <ListView
          dataSource={this.state.dataSource}
          renderRow={(rowData) => <Text>{rowData}</Text>}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
    backgroundColor: '#FFF',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  submitButton: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: '#7a42f4',
    marginTop: 40,
    padding: 5,
  },
  submitButtonText: {
    alignSelf: 'center',
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  text: {
    // fontSize: 30,
    // alignSelf: 'center',
    // color: 'red'
  },
});

export default ScanScreen;
