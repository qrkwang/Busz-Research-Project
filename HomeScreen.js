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
import {createStackNavigator} from '@react-navigation/stack';
import {Picker} from '@react-native-community/picker';
import {BleManager} from 'react-native-ble-plx';
// import {getLocation} from './location-service';
import {getLocation} from './location-service';

navigator.geolocation = require('@react-native-community/geolocation');

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
      // alert('You can use the location');
    } else {
      console.log('location permission denied');
      alert('Location permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
}

class HomeScreen extends Component {
  constructor(props) {
    super(props);

    this.matchMac = this.matchMac.bind(this);
  }
  state = {
    busValues: [],
    selectedValue: '',
    beaconMacArray: [],
    scannedMacArray: [],
    matchedBeacons: [],
    busRoute: 0,
    count: 0,
  };

  //Match the MAC addy and then set to picker for it to show
  matchMac() {
    const scannedMac = [...this.state.scannedMacArray];
    const beaconMac = [...this.state.beaconMacArray];
    const matchedBeacons = [];
    const busValues = [...this.state.busValues];
    for (let [key, value] of scannedMac) {
      for (var i = 0; i < beaconMac.length; i++) {
        console.log(key, ' | ', beaconMac[i]);

        if (key === beaconMac[i]) {
          console.log('MATCHEDDD');
          matchedBeacons.push(key + ' ' + value);
          break;
        }
      }
    }
    console.log(matchedBeacons);

    //If only 1 beacon detected
    if (matchedBeacons.length == 1) {
      console.log(matchedBeacons[0]);
      var firstElement = matchedBeacons[0].split(' ');
      var mac_addy = firstElement[0];
      console.log('size is 1!!!');
      var filteredArray = busValues.filter(
        (bus) => bus.beacon_mac === mac_addy,
      );
      console.log(filteredArray);
      this.setState({
        busValues: filteredArray,
      });
    }

    //If more than 1 beacon detected
    //If location is close to route 1/2 departure:
    //Set param to route 1/2
    //Set picker to show bus service numbers & plates
    if (matchedBeacons.length > 1) {
      console.log('More than 1 beacons detected!!!');
      var multipleFilteredArray = [];

      //Do location here to set route

      for (var i = 0; i < matchedBeacons.length; i++) {
        var element = matchedBeacons[i].split(' ');
        var mac_addy = element[0];
        var filteredArray = busValues.filter(
          (bus) => bus.beacon_mac === mac_addy,
        );
        console.log(filteredArray);
        //Filter array with elements
        if (filteredArray != null) {
          console.log('FOUND', mac_addy);
          multipleFilteredArray.push(filteredArray[0]);
        }
      }
      console.log(multipleFilteredArray);
      this.setState({
        busValues: multipleFilteredArray,
      });
    }

    if (matchedBeacons.length == 0) {
      console.log('No beacons detected!!!');
    }
    //If matchedbeacon.length == 0

    // for (var i = 0; i < beaconMac.length; i++) {
    //   for (var j = 0; j < scannedMac.length; j++) {
    //     var split = scannedMac[j].split(' ');
    //     console.log(beaconMac[i], ' | ', split[0]);
    //     if (beaconMac[i] === split[0]) {
    //       matchedBeacons.push(scannedMac[j]);
    //       console.log('MATCHEDDDDD', split[0]);
    //     }
    //   }
    // }
    return scannedMac;
  }
  async componentDidMount() {
    //Fetch database beacon macs
    await this.GetRealData();

    //Get location permission
    await requestLocationPermission();

    //Fetch user location to determine route
    this.getLoc();

    //Match the MAC addy and then set to picker for it to show
    this.scan();

    // this.matchMac();
    // console.log('third');

    // console.log(this.state.scannedMacArray);

    // Geolocation.getCurrentPosition(
    //   (position) => {
    //     const initialPosition = JSON.stringify(position);
    //     console.log(position.coords.latitude);
    //     console.log(position.coords.longitude);

    //     console.log('position' + initialPosition);
    //   },
    //   (error) => {
    //     // See error code charts below.
    //     console.log(error.code, error.message);
    //   },
    //   {
    //     enableHighAccuracy: true,
    //     timeout: 10000,
    //     maximumAge: 10000,
    //   },
    // );
    // const url = 'http://192.168.10.10/getBusInfo';
    // fetch(url, {
    //   method: 'POST',
    //   headers: {
    //     // Accept: "application/json",
    //     // "Content-Type": "application/json",
    //   },
    //   // body: JSON.stringify({}),
    // })
    //   .then((response) => response.json())
    //   .then((responseJson) => {
    //     var beaconMacArray = new Array(responseJson.length);
    //     for (var i = 0; i < responseJson.length; i++) {
    //       // console.log(i);
    //       var obj = responseJson[i];
    //       beaconMacArray[i] = obj.beacon_mac;
    //       // console.log(obj.beacon_mac);
    //     }
    //     // const objOfArray = {
    //     //   beaconMacArray: array,
    //     // };
    //     // console.log(objOfArray);
    //     this.setState({
    //       beaconMacArray: beaconMacArray,
    //     });
    //   });
  }
  scan() {
    let sayings = new Map();

    const subscription = DeviceManager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        var sMacArray = [];
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
            sayings.set(device.id, device.rssi);

            // sMacArray.push(device.id + ' ' + device.rssi),
            this.setState({
              count: this.state.count + 1,
            });
            console.log('count' + this.state.count);
            if (this.state.count > 20) {
              DeviceManager.stopDeviceScan();

              // console.log(sMacArray);
              this.setState({
                scannedMacArray: sayings,
              });
              this.matchMac();
              // console.log(this.state.scannedMacArray);
            }
          }
        });
        subscription.remove();
      }
    }, true);
  }

  //get location and set route
  getLoc() {
    getLocation().then((data) => {
      console.log(data);
      // this.setState({
      //   region: {
      //     latitude: data.latitude,
      //     longitude: data.longitude,
      //     latitudeDelta: 0.003,
      //     longitudeDelta: 0.003,
      //   },
      // });
    });
    //route 1 - departure terminal
    //1.662585, 103.598608
    //   route 2 - departure terminal
    // 1.463400,103.764932
  }

  // GetFakeData = () => {
  //   fetch('https://jsonplaceholder.typicode.com/users')
  //     .then((response) => response.json())
  //     .then((json) => {
  //       console.log(json);
  //       this.setState({
  //         userValues: json,
  //       });
  //     });
  // };

  // GetBeaconMacs = () => {
  //   fetch('http://192.168.10.10/getBusInfo', {
  //     method: 'POST',
  //   })
  //     .then((response) => response.json())
  //     .then((json) => {
  //       console.log(json);
  //       this.setState({
  //         busValues: json,
  //       });
  //     });
  // };
  GetRealData = async () => {
    fetch('http://192.168.68.74/getBusInfo', {
      method: 'POST',
    })
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        // console.log(json[1].beacon_mac);
        var bMacArray = [];

        for (var i = 0; i < json.length; i++) {
          // console.log(json[i].beacon_mac);
          bMacArray.push(json[i].beacon_mac);
        }

        this.setState({
          busValues: json,
          beaconMacArray: bMacArray,
        });
        // console.log('beaconMacArray', this.state.beaconMacArray[0]);
      });
  };

  render() {
    let myUsers = this.state.busValues.map((myValue, myIndex) => {
      // console.log('myValue: ' + myValue.bus_service_no);
      return (
        <Picker.Item
          label={myValue.bus_service_no + ' - ' + myValue.plate_no}
          value={myValue.bus_service_no + ' ' + myValue.plate_no}
          key={myIndex}
        />
      );
    });

    return (
      <View style={styles.container}>
        <Image
          style={{marginTop: 20, alignSelf: 'center'}}
          source={{
            width: 200,
            height: 200,
            uri: 'https://picsum.photos/id/1026/200',
          }}
        />

        <Text
          style={{
            alignSelf: 'center',
            fontWeight: 'bold',
            fontSize: 30,
            marginTop: 40,
          }}>
          Enter Bus Plate / No.
        </Text>
        <Picker
          style={{alignSelf: 'center', marginTop: 20, width: 200}}
          selectedValue={this.state.selectedValue}
          onValueChange={(value) => this.setState({selectedValue: value})}>
          {myUsers}
        </Picker>
        {/* <Picker
            style={{alignSelf: 'center', marginTop: 20, width: 200}}
            selectedValue={this.state.busInstance}
            onValueChange={(itemValue, itemIndex) =>
              this.setState({busInstance: itemValue})
            }>
            <Picker.Item label="Bus 47 | BJM4231" value="Bus 47" />
            <Picker.Item label="Bus 50 | BJA1234" value="Bus 50" />
          </Picker> */}
        {/* <Text style = {styles.text}>{this.state.busInput}</Text> */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() =>
            this.props.navigation.navigate('SecondScreen', {
              selectedValue: this.state.selectedValue,
            })
          }>
          <Text style={styles.submitButtonText}> Submit </Text>
        </TouchableOpacity>
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

export default HomeScreen;
