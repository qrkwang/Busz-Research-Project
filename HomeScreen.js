import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  PermissionsAndroid, // for checking if certain android permissions are enabled
  NativeEventEmitter, // for emitting events for the BLE manager
  NativeModules, // for getting an instance of the BLE manager module
  Button,
  ToastAndroid, // for showing notification if there's a new attendee
  FlatList, // for creating lists
  Alert,
  TouchableHighlight,
  Dimensions,
} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {Picker} from '@react-native-community/picker';
import {BleManager} from 'react-native-ble-plx';

import {
  BluetoothStatus,
  useBluetoothStatus,
} from 'react-native-bluetooth-status';

navigator.geolocation = require('@react-native-community/geolocation');
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';

const DeviceManager = new BleManager();

function onBlueTooth() {
  BluetoothStatus.enable(true);
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
    bluetoothState: undefined,
  };
  async requestLocationPermission() {
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
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
      interval: 10000,
      fastInterval: 5000,
    })
      .then((data) => {
        this.scan();
      })
      .catch((err) => {});
  }

  // async requestIMEIPermission() {
  //   try {
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
  //       {
  //         title: 'Bus App Permission',
  //         message: 'Bus App needs access to your phone  ',
  //         buttonNeutral: 'Ask Me Later',
  //         buttonNegative: 'Cancel',
  //         buttonPositive: 'OK',
  //       },
  //     );
  //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //       console.log('You can read the IMEI');
  //       // const data = await this.camera.takePictureAsync();
  //       // let saveResult = CameraRoll.saveToCameraRoll(data.uri);
  //       // console.warn("takePicture ", saveResult);
  //       // console.warn("picture url ", data.uri);
  //     } else {
  //       console.log('Phone permission denied');
  //     }
  //   } catch (err) {
  //     console.warn(err);
  //   }
  // }

  //Match the MAC addy and then set to picker for it to show
  async matchMac(beaconMac) {
    const scannedMac = [...this.state.scannedMacArray];
    const matchedBeacons = [];
    const busValues = [...this.state.busValues];

    for (let [key, value] of scannedMac) {
      for (var i = 0; i < beaconMac.length; i++) {
        // console.log(key, ' | ', beaconMac[i]);

        if (key === beaconMac[i]) {
          console.log('MATCHEDDD');
          // matchedBeacons.push(key + ' ' + value);
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
    return scannedMac;
  }
  async componentDidMount() {
    onBlueTooth();

    //Get location permission
    await this.requestLocationPermission();

    // await this.requestIMEIPermission();

    // const IMEI = require('react-native-imei');
    // IMEI.getImei().then((imeiList) => {
    //   console.log(imeiList); // prints ["AABBBBBBCCCCCCD"]
    // });

    // var myHeaders = new Headers();
    // myHeaders.append('Content-Type', 'application/json');
    // myHeaders.append(
    //   'Cookie',
    //   'laravel_session=eyJpdiI6InNheGVxNlBXQWpRSTJJY3pZU2dlRFE9PSIsInZhbHVlIjoiSVBzXC92K2YyYVFWOG5LWGtCOHM0aXZCM0hyM2NpNXg5T0JCWnJpSlNOR3lMS0VKMmpEcTJlSFh4UjRONndpeEEiLCJtYWMiOiIyMTAyYWE4YTA1MDgxMDFlMjRjYzlkZTY2MjQ5NDk1NDMxNjI0ZDg3ZGFkZjM5OTE5MThiZjVlZDUyZWQxZjAwIn0%3D',
    // );

    // //Fetch user location to determine route
    // this.getLoc();

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
    let devices = new Map();
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
            devices.set(device.id, device.rssi);
            this.setState({
              count: this.state.count + 1,
            });
            console.log('count' + this.state.count);
            if (this.state.count > 20) {
              DeviceManager.stopDeviceScan();

              this.setState({
                scannedMacArray: devices,
              });
              //Fetch database beacon macs
              this.GetRealData();
            }
          }
        });
        subscription.remove();
      }
    }, true);
  }

  GetRealData = async () => {
    fetch('http://192.168.68.74/getBusInfo', {
      method: 'POST',
    })
      .then((response) => response.json())
      .then((json) => {
        console.log('fetchced', json);
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
        // console.log('inside method', bMacArray);
        this.matchMac(bMacArray);

        // console.log('beaconMacArray', this.state.beaconMacArray[0]);
      });
  };

  onPressItem(item) {
    console.log(item);
    this.props.navigation.navigate('SecondScreen', {
      item: item,
    });
  }

  //Function to render each item in flatlist
  renderItem = ({item}) => {
    // return <Item title={item.plate_no} />;
    return (
      <TouchableOpacity
        onPress={() => this.onPressItem(item)}
        style={{
          // alignSelf: 'center',
          alignItems: 'center',
          width: 100,
          backgroundColor: '#A9A9A9',
          // backgroundColor: '#f9c2ff',
          padding: 5,
          marginVertical: 8,
          marginHorizontal: 14,
        }}>
        <Text style={{color: 'white', fontWeight: 'bold'}}>
          {item.plate_no}{' '}
        </Text>
      </TouchableOpacity>
    );
  };

  render() {
    //Dynamically fill picker
    let myUsers = this.state.busValues.map((myValue, myIndex) => {
      // console.log('myValue: ' + myValue.bus_service_no);
      return (
        <Picker.Item
          label={myValue.bus_service_no + ' - ' + myValue.plate_no}
          value={
            myValue.bus_service_no +
            ' ' +
            myValue.plate_no +
            ' ' +
            myValue.bus_id
          }
          key={myIndex}
        />
      );
    });

    return (
      <View style={styles.container}>
        <Image
          style={{marginTop: 50, alignSelf: 'center'}}
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
            marginTop: 20,
          }}>
          Enter Bus Plate / No.
        </Text>

        {/* Select from listview View */}
        <View>
          <FlatList
            style={{
              flexDirection: 'column',
              width: Dimensions.get('window').width,
              height: 300,
            }}
            numColumns={3} // set number of columns
            data={this.state.busValues}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal={false}></FlatList>
        </View>

        {/* Select from all View */}
        <View style={{marginTop: 15}}>
          <Text
            style={{
              // marginTop: 50,
              textAlign: 'center',
              fontSize: 18,
            }}>
            Select from all
          </Text>
          <View
            style={{
              marginTop: 10,
              alignItems: 'center',
              flex: 1,
              flexDirection: 'row',
              marginLeft: 50,
            }}>
            <Picker
              style={{
                alignSelf: 'center',
                marginTop: 30,
                width: 180,
              }}
              selectedValue={this.state.selectedValue}
              onValueChange={(value) => {
                console.log(value);
                this.setState({selectedValue: value});
              }}>
              {myUsers}
            </Picker>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => {
                console.log(this.state.selectedValue);
                this.props.navigation.navigate('SecondScreen', {
                  selectedValue: this.state.selectedValue,
                });
              }}>
              <Text style={styles.submitButtonText}> Submit </Text>
            </TouchableOpacity>
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
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    flex: 1,
    backgroundColor: '#FFF',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  submitButton: {
    alignSelf: 'center',
    alignItems: 'center',
    width: 100,
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
