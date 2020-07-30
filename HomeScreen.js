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
}
class HomeScreen extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    busValues: [],
    selectedValue: '',
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
    this.GetRealData();
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

  GetRealData = () => {
    fetch('http://192.168.10.10/getBusInfo', {
      method: 'POST',
    })
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        this.setState({
          busValues: json,
        });
      });
  };

  render() {
    let myUsers = this.state.busValues.map((myValue, myIndex) => {
      console.log('myValue: ' + myValue.bus_service_no);
      return (
        <Picker.Item
          label={myValue.bus_service_no + ' - ' + myValue.plate_no}
          value={myValue.bus_service_no}
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
