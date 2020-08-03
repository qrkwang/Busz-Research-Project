import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Picker,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';

// import { MapView } from "expo";
// import MapView from 'react-native-maps';

// const getAllBusesInfo = () => {
//   return fetch('http://192.168.10.10/getBusInfo', {
//     method: 'POST',
//     headers: {
//       Accept: 'application/json',
//       'Content-Type': 'application/json',
//     },
//     // body: JSON.stringify({
//     //   // firstParam: "",
//     //   // secondParam: "",
//     // }),
//   })
//     .then((response) => response.json())
//     .then((json) => {
//       // console.log(json);

//       var array = new Array(json.length);
//       for (var i = 0; i < json.length; i++) {
//         console.log(i);
//         var obj = json[i];
//         array[i] = obj.beacon_mac;
//         console.log(obj.beacon_mac);
//       }
//       console.log('\nArray' + array);

//       return json;
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// };

//1) Able to retrieve mac address already -> need to store in array
//2) Let mobile scan for bluetooth devices nearby -> find matching mac address while comparing with array [Need to eject from Expo]
//3) Determine route by using phone location to compare with polyline on map?? or the moving direction
// Check if near start / end station, then can confirm which route
//API Store 2 coords, Send 2 coords, then match it to polyline (route 1 / 2 ), if returns error -> wrong direction
//
//4) Now able to send location data with its specific bus instance  (bus_insertlocation)
//5) SECOND SCREEN: Show the buses around, or nearest to its current direction.
//6) Include map

class SecondScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      // selectedValue: this.props.navigation.state.params.selectedValue,
    };
  }

  state = {busInput: ''};
  updateBusInput = (busInput) => {
    this.setState({busInput: busInput});
  };
  renderItem = ({item}) => {
    return (
      <View>
        <Text> {item.beacon_mac} </Text>
      </View>
    );
  };
  componentDidMount() {
    const url = 'http://192.168.10.10/getBusInfo';
    fetch(url, {
      method: 'POST',
      headers: {
        // Accept: "application/json",
        // "Content-Type": "application/json",
      },
      // body: JSON.stringify({}),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        const objOfArray = {
          arrayKey: responseJson,
        };
        var busObj = new Array(responseJson.length);
        for (var i = 0; i < responseJson.length; i++) {
          // console.log(i);
          var obj = responseJson[i];
          beaconMacArray[i] = obj.beacon_mac;
          // console.log(obj.beacon_mac);
        }
        // const objOfArray = {
        //   beaconMacArray: array,
        // };
        // console.log(objOfArray);
        this.setState({
          beaconMacArray: beaconMacArray,
        });
        console.log(responseJson[0].beacon_mac);
        this.setState({
          dataSource: objOfArray.arrayKey,
        });
      });
  }

  render() {
    const {selectedValue} = this.props.route.params;
    const string = selectedValue.split(' ');
    const bus_plate = string[1];
    const bus_number = string[0];

    // var busInput = navigation.getParam('busInput');
    // var busInputStr = JSON.stringify(busInput);
    // busInputStr = busInputStr.replace(/['"]+/g, '');
    // busInputStr = busInputStr.replace(/['"]+/g, "");
    // getAllBusesInfo();
    // getMoviesFromApi();
    return (
      <View style={styles.container}>
        {/* <TouchableOpacity style={styles.button}>
          <Text>Simple Get Call</Text>
        </TouchableOpacity> */}
        <View style={{flexDirection: 'row'}}>
          <Text
            style={{
              // alignSelf: 'center',
              // textAlign: 'left',
              fontWeight: 'bold',
              fontSize: 30,
              marginTop: 20,
            }}>
            Route: {'\n'}
            Bus Plate: {'\n'}
            Bus No:
          </Text>
          <Text
            style={{
              // alignSelf: 'center',
              // textAlign: 'left',
              fontWeight: 'bold',
              fontSize: 30,
              marginTop: 20,
              marginLeft: 20,
            }}>
            {'\n'}
            {bus_plate} {'\n'} {bus_number}
          </Text>
        </View>

        {/* <MapView
          style={styles.mapStyle}
          initialRegion={{
            latitude: 1.29027,
            longitude: 103.851959,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        /> */}
        {/*Horizontal view for infront & behind buses */}
        <View
          style={{
            marginLeft: 70,
            marginTop: 10,
            flexDirection: 'row',
            width: Dimensions.get('window').width,
          }}>
          <View style={{flex: 1}}>
            <Text style={{fontSize: 20, justifyContent: 'flex-start'}}>
              Prev Stop
            </Text>
          </View>

          <View style={{flex: 1}}>
            <Text style={{fontSize: 20, justifyContent: 'flex-end'}}>
              Next Stop
            </Text>
          </View>
        </View>

        <View
          style={{
            marginLeft: 80,
            marginTop: 10,
            flexDirection: 'row',
            width: Dimensions.get('window').width,
          }}>
          <View style={{flex: 1}}>
            <Text style={{fontSize: 20, justifyContent: 'flex-start'}}>
              1314
            </Text>
          </View>

          <View style={{flex: 1}}>
            <Text style={{fontSize: 20, justifyContent: 'flex-end'}}>1316</Text>
          </View>
        </View>
        <FlatList
          data={this.state.dataSource}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => index}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    // justifyContent: 'center',
  },
  mapStyle: {
    marginTop: 20,
    width: Dimensions.get('window').width,
    height: 200,
  },
});
export default SecondScreen;
