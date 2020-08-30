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
  ActivityIndicator,
  Button,
  BackHandler,
  Alert,
} from 'react-native';
import moment from 'moment';

import MapView, {Marker} from 'react-native-maps';
import {set} from 'react-native-reanimated';
import DeviceInfo from 'react-native-device-info';

// or ES6+ destructured imports

import {getUniqueId, getManufacturer} from 'react-native-device-info';
class SecondScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      userLocation: '',
      isMapReady: false,
      dataSource: [],
      initialR: {
        latitude: 10,
        longitude: 10,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      },
      region: {
        latitude: 10,
        longitude: 10,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      },
      busInput: '',
      bus_plate: '',
      bus_number: '',
      bus_id: '',
      route: 'Loading',
      busstop: [],
      busLocations: [],
      busLocations2: [],
      busAhead: 'Loading',
      myDistToTerm: 'Loading',
      currentStop: 'Loading',
      insertErrorCounter: 0,
      // selectedValue: this.props.navigation.state.params.selectedValue,
    };
  }

  // updateBusInput = (busInput) => {
  //   this.setState({busInput: busInput});
  // };
  renderItem = ({item}) => {
    return (
      <View>
        <Text> {item.beacon_mac} </Text>
      </View>
    );
  };

  /*If at terminal, this function is to double confirm the route after moving off from terminal
  If not at terminal, will determine route using bus journey coordinates*/
  repeatLocation() {
    var firstLocation =
      this.state.region.latitude + ',' + this.state.region.longitude;
    var secondLocation = '';
    console.log('repeatlocation');
    setTimeout(async () => {
      secondLocation =
        this.state.region.latitude + ',' + this.state.region.longitude;
      console.log('in timeout after 10 secs');
      console.log('first loc', firstLocation);
      console.log('second loc', secondLocation);

      const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          bus_service: this.state.bus_number,
          first_point: firstLocation,
          last_point: secondLocation,
        }),
      };
      console.log('after const');

      //Determine route using first and 2nd location (after 10 secs), repeat again if route not calculated properly
      //If route is calculated properly, set the bus and markers on the map.
      fetch('http://192.168.68.74/determineRoute', requestOptions)
        .then((response) => response.json())
        .then((data) => {
          console.log('data is', data);
          if (data.route_id == -1) {
            console.log('repeating..');
            this.repeatLocation();
          } else {
            this.setState({
              route: data.route_id,
            });

            this.setMarkers();
          }
        })
        .catch((error) => console.log('error fetching determineRoute', error));
    }, 10000);
  }
  determineRoute() {
    let initialR = this.state.initialR;
    var trimmedLat = initialR.latitude + '';
    var trimmedLat = trimmedLat.substring(0, 7);
    var trimmedLong = initialR.longitude + '';
    var trimmedLong = trimmedLong.substring(0, 9);
    // let latlong = initialR.latitude + ',' + initialR.longitude;
    let trimmedlatlong = trimmedLat + ',' + trimmedLong;
    console.log(trimmedlatlong);
    // console.log('inside determineRoute', initialR.latitude, initialR.longitude);
    console.log('state bus nuumber', this.state.bus_number);
    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        bus_service: this.state.bus_number,
        first_point: trimmedlatlong,
        // route 1 start : 1.662585,103.598608 Kulai Bus terminal
        // route 2 start : 1.463400,103.764932 JB sentral Bus terminal
      }),
    };
    fetch('http://192.168.68.74/determineRoute', requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log(data.route_id);
        if (data.route_id === 1 || data.route_id === 2) {
          console.log('at terminal!!');
          this.setState({
            route: data.route_id,
          });
          this.setMarkers();
        } else {
          console.log('not at terminal');
        }
        this.repeatLocation();
        console.log('after repeat location');
        setInterval(() => {
          console.log('getting buses');
          this.getBuses();
        }, 3000);
        // this.setState({busstop: data});
      })
      .catch((error) => console.log('error fetching determineRoute', error));

    /*
      https://laravelsyd-fypfinalver.herokuapp.com/determineRoute (bus_service, first_point, last_point)
      mandatory fields: 
      bus_service
      first_point – e.g., 1.663453,103.3453 

      Optional field: 
      last_point – e.g., 1.663453,103.3453

      If the last_point is NULL, then the server will determine whether the first_point is close to the Departure Terminal of the route.

      If the returned route_id = -1, this means that the route cannot be determined.

      Output: An object {bus_service_no, route_id}
      {“bus_service_no”:“7”, “route_id”:1}
      {“bus_service_no”:“7”, “route_id”:-1} 

          */
  }
  getBuses() {
    console.log('get bus locations');
    const requestOptions = {
      method: 'POST',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    //https://laravelsyd-fypfinalver.herokuapp.com/getBusLocations
    fetch('http://192.168.68.74/getBusLocations', requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log('buses', data);
        this.setState({busLocations: data}, () => {
          this.afterGetBus();
        });
      })
      .catch((error) => console.log('error fetching getbuslocations', error));
  }
  afterGetBus() {
    console.log('afterGetBus');

    console.log(Object.keys(this.state.busLocations).length);
    var destination;
    var busLocArray = [];
    //Loop through all bus locations retrieved from DB
    for (const value of Object.values(this.state.busLocations)) {
      console.log('inside loop');
      console.log(value);

      if (this.state.route == value.route_id) {
        console.log('route is ', this.state.route);
        if (value.bus_id == this.state.bus_id) {
          continue;
        }
        if (this.state.route == 1) {
          destination = '1.463400,103.764932';
        } else if (this.state.route == 2) {
          destination = '1.662585,103.598608';
        }

        var requestOptions = {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            busserviceno: this.state.bus_number,
            routeno: value.route_id,
            arg1: value.latitude + ',' + value.longitude,
            arg2: destination,
          }),
        };

        // console.log(this.state.bus_number);
        // console.log(value.route_id);
        // console.log(value.latitude + ',' + value.longitude);
        // console.log(destination);

        fetch('http://192.168.68.74/testgetKM', requestOptions)
          .then((response) => response.json())
          .then((result) => {
            console.log('result', result.toString());
            var kmFloat = this.to2DecPlace(result);
            console.log(kmFloat);

            if (this.state.myDistToTerm != 'Loading') {
              var distanceBetween = this.state.myDistToTerm - kmFloat;
              distanceBetween = this.to2DecPlace(distanceBetween);
            }
            var busLocations = {
              route_id: value.route_id,
              plate_no: value.plate_no,
              latitude: value.latitude,
              longitude: value.longitude,
              kmToTerm: kmFloat,
              distanceBetween: distanceBetween,
            };

            console.log('busLocations', busLocations);
            busLocArray.push(busLocations);
            console.log('busLocArray', busLocArray);
            this.setState({busLocations2: busLocArray}, () => {
              console.log('bus locations 2 ', this.state.busLocations2);
            });
          })
          .catch((error) => console.log('error fetching testgetKM', error));
      }
    }

    //   //   // route 1 start : 1.662585,103.598608 Kulai Bus terminal
    //   //   // route 2 start : 1.463400,103.764932 JB sentral Bus terminal
  }

  // getDist() {
  //   const requestOptions = {
  //     method: 'POST',
  //     // Accept: 'application/json',
  //     // 'Content-Type': 'application/json',
  //   };
  //   fetch('http://192.168.68.74/getBusLocations', requestOptions)
  //     .then((response) => response.json())
  //     .then((data) => {
  //       this.setState({busLocations: data});
  //       this.test();
  //     });
  // }
  setMarkers() {
    console.log(this.state.route);
    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({route_id: this.state.route}),
    };
    fetch('http://192.168.68.74/getBusStop', requestOptions)
      .then((response) => response.json())
      .then((data) => {
        this.setState({busstop: data});
      })
      .catch((error) => console.log('error fetching getbusstop', error));
  }
  componentDidMount() {
    const backAction = () => {
      Alert.alert('Hold on!', 'Back does not work on this screen.', [
        {
          text: 'OK',
          onPress: () => null,
          style: 'cancel',
        },
      ]);
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', backAction);

    const {selectedValue} = this.props.route.params;
    const {item} = this.props.route.params;
    let bus_plate = '';
    let bus_number = '';
    let bus_id = '';
    if (selectedValue != null) {
      console.log(selectedValue);
      const string = selectedValue.toString().split(' ');
      console.log(string);

      bus_plate = string[1];
      bus_number = string[0];
      bus_id = string[2];
      console.log('bus IDDD', bus_id);
      console.log('bus plate', bus_plate);
      console.log('bus num', bus_number);
    } else {
      bus_plate = item.plate_no;
      bus_number = item.bus_service_no;
      bus_id = item.bus_id;
    }

    this.setState({
      bus_plate: bus_plate,
      bus_number: bus_number,
      bus_id: bus_id,
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position);
        const region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        };
        this.setState({
          region: region,
          initialR: region,
          loading: false,
          error: null,
        });
        this.determineRoute();
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

    // //https://laravelsyd-fypfinalver.herokuapp.com/getBusLocations
  }

  componentWillUnmount() {}

  to2DecPlace(obj) {
    var string = obj.toString(); //    json obj to string
    var float = parseFloat(string); //  string to float
    float = float.toFixed(2); //        convert into 2 dec place
    return float;
  }

  userLocationChanged(event) {
    const newRegion = event.nativeEvent.coordinate;
    const busLocations = this.state.busLocations2;
    var lowestKM = 1000;
    var lowestBusPlate = '';
    var destination = '';
    var locationNow = newRegion.latitude + ',' + newRegion.longitude;
    console.log('location now', locationNow);
    console.log('bus locations ', busLocations);
    console.log('speed', newRegion.speed);

    //Once Route is detected, for every bus movement..
    //1) Check for the nearest bus stop and display on UI.
    //2) Send my bus location to DB
    //3) fetch the distance between terminal and my own bus,
    //   then use it to compare with other buses to check for the bus ahead

    //Most functions wait for Route to be determined before executing,
    if (this.state.route != 'Loading') {
      //1) Fetch nearby bus stop on every bus movement
      var requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          lat: newRegion.latitude,
          lng: newRegion.longitude,
        }),
      };
      fetch('http://192.168.68.74/getNearbyBusStop', requestOptions)
        .then((response) => response.json())
        .then((result) => {
          var distance = 1000;
          var busStopName = '';
          console.log('nearbyBusStop', result);
          result.map((item) => {
            console.log('item', item.bus_stop_id);
            if (item.route_id == this.state.route) {
              if (item.distance < distance) {
                distance = item.distance;
                busStopName = item.name;
              }
            }
            this.setState({
              currentStop: busStopName,
            });
          });
        })
        .catch((error) =>
          console.log('error fetching getnearbybusstops', error),
        );

      //2) Insert locations for 5 times before stopping (If bus driver has stopped working and left the route)
      //use http://localhost:5000/bus_insertlocation
      //parameters: bus_id, route_id, imei, latlong,speed, date
      let uniqueId = DeviceInfo.getUniqueId(); //Not IMEI because Android 10+ does not allow app to retrieve IMEI anymore.

      var date = moment().format('YYYY-MM-DD HH:mm:ss');

      console.log('bus_id', this.state.bus_id);
      console.log('route_id', this.state.route);
      console.log('imei', uniqueId);
      console.log('latlong', locationNow);
      console.log('speed', newRegion.speed);
      console.log('date ', date);

      var requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          bus_id: this.state.bus_id,
          route_id: this.state.route,
          imei: uniqueId,
          latlong: locationNow,
          speed: newRegion.speed,
          date: '',
        }),
      };

      fetch('http://192.168.68.74/bus_insertlocation', requestOptions)
        .then((response) => response.text())
        .then((result) => {
          var errorCount = this.state.insertErrorCounter;
          // console.log('insert location', result);
          var splittedLines = result.toString().split('<br>');

          // console.log('splitted Lines', splittedLines[0]);
          // console.log(splittedLines[1].trim());
          // console.log('insert success');
          // console.log('splitted Lines', splittedLines[2]);
          // console.log(splittedLines[1].trim() == 'insert success');

          if (errorCount < 9) {
            if (splittedLines[1].trim() === 'insert success') {
              errorCount = 0;
              console.log('INSERT SUCCESSS!!!!');
            } else {
              console.log('TOO FARRRR');
              errorCount = errorCount + 1;
              this.setState({
                insertErrorCounter: errorCount,
              });
            }
            console.log('ERROR COUNT: ', errorCount);
          } else {
            //If "too far from route" for 10 times already, exit App
            BackHandler.exitApp();
          }
        })
        .catch((error) => console.log('error inserting location', error));

      //3) Getting all bus coords and determine BUS AHEAD on every bus movement
      if (this.state.route == 1) {
        destination = '1.463400,103.764932'; // Destination is different for each route
      } else if (this.state.route == 2) {
        destination = '1.662585,103.598608'; // Destination is different for each route
      }
      2;
      console.log('in user location changed', this.state.bus_number);
      console.log('routeno', this.state.route);
      console.log('destination', destination);
      requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          busserviceno: this.state.bus_number,
          routeno: this.state.route,
          arg1: newRegion.latitude + ',' + newRegion.longitude,
          arg2: destination,
        }),
      };

      fetch('http://192.168.68.74/testgetKM', requestOptions)
        .then((response) => response.json())
        .then((result) => {
          console.log('result', result.toString());
          var kmFloat = this.to2DecPlace(result);
          console.log(kmFloat);
          this.setState(
            {
              myDistToTerm: kmFloat,
            },
            () => {
              busLocations.map((item) => {
                console.log('item', item.kmToTerm);
                var distanceBetween = this.state.myDistToTerm - item.kmToTerm; //My distance to term minus other busKMtoTerm
                distanceBetween = this.to2DecPlace(distanceBetween); //               Convert to 2 decimal place

                //Buses ahead will have distanceBetween >= 0, find the smallest distanceBetween to find the buses ahead.
                if (distanceBetween < lowestKM && distanceBetween >= 0) {
                  lowestBusPlate = item.plate_no;
                  lowestKM = distanceBetween;

                  this.setState({
                    busAhead: lowestBusPlate + ' - ' + lowestKM + 'KM',
                  });
                }
              });
            },
          );
        })
        .catch((error) => console.log('error fetching testgetKM', error));
    }

    let newRegionObj = {
      latitude: newRegion.latitude,
      longitude: newRegion.longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    };
    this.setState({
      region: newRegionObj,
    });
    // this.animateToRegion();
    if (this.map) {
      this.map.animateToRegion(
        {
          latitude: newRegionObj.latitude,
          longitude: newRegionObj.longitude,
          latitudeDelta: newRegionObj.latitudeDelta,
          longitudeDelta: newRegionObj.longitudeDelta,
        },
        1000,
      );
    }
  }

  regionChanged(event) {
    this.region = {
      longitudeDelta: event.longitudeDelta,
      latitudeDelta: event.latitudeDelta,
      latitude: event.latitude,
      longitude: event.longitude,
    };
  }

  onMapReady = () => {
    this.setState({isMapReady: true, marginTop: 0});
  };

  mapStyle = [
    {
      featureType: 'poi',
      elementType: 'labels.text',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'poi.business',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'road',
      elementType: 'labels.icon',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'transit',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
  ];

  render() {
    const bus_stop = [...this.state.busstop];
    const busLocations = [...this.state.busLocations2];

    let MyMapView = () => {
      if (this.state.loading) {
        return (
          <View style={styles.spinnerView}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        );
      } else {
        // console.log(this.state.initialR.latitudeDelta);
        return (
          // <View
          //   style={{
          //     marginTop: 10,
          //     borderTopColor: 'silver',
          //     borderTopWidth: 0.5,
          //   }}>
          <MapView
            ref={(ref) => (this.map = ref)}
            onUserLocationChange={(event) => this.userLocationChanged(event)}
            // onRegionChange={this.regionChanged}
            showsPointsOfInterest={false}
            zoomEnabled={true}
            rotateEnabled={false}
            scrollEnabled={true}
            style={styles.mapStyle}
            initialRegion={this.state.initialR}
            showsUserLocation={true}
            // showsMyLocationButton={true}
            showsTraffic={true}
            // loadingEnabled={true}
            // followsUserLocation={true}
            customMapStyle={this.mapStyle}
            onMapReady={this.onMapReady}>
            {bus_stop.map((item) => {
              return (
                <Marker
                  key={item.bus_stop_id}
                  coordinate={{
                    latitude: Number(item.latitude),
                    longitude: Number(item.longitude),
                  }}
                  title={item.name}
                  image={require('./assets/bus_stop.png')}></Marker>
              );
            })}
            {busLocations.map((item) => {
              console.log('item', item);
              return (
                <Marker
                  key={item.plate_no}
                  coordinate={{
                    latitude: Number(item.latitude),
                    longitude: Number(item.longitude),
                  }}
                  title={item.plate_no + ' - ' + item.distanceBetween + 'KM'}
                  image={require('./assets/BusRed.png')}></Marker>
              );
            })}
            {/* {renderBus(this.state.busDone, this.state.busLocations2)} */}
          </MapView>
          // </View>
        );
      }
    };

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
              marginBottom: 5,
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
            {this.state.route}
            {'\n'}
            {this.state.bus_plate} {'\n'} {this.state.bus_number}
          </Text>
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={{flex: 1, height: 1, backgroundColor: 'silver'}} />
          <View>
            <Text style={{width: 150, textAlign: 'center', fontSize: 25}}>
              Bus Ahead
            </Text>
          </View>
          <View style={{flex: 1, height: 1, backgroundColor: 'silver'}} />
        </View>

        <Text
          numberOfLines={2}
          style={{fontSize: 18, marginTop: 10, fontWeight: 'bold'}}>
          {this.state.busAhead}
        </Text>

        {/* <FlatList
          data={this.state.dataSource}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => index}
        /> */}
        {MyMapView()}

        <View
          style={{marginTop: 10, flexDirection: 'row', alignItems: 'center'}}>
          <View style={{flex: 1, height: 1, backgroundColor: 'silver'}} />
          {/*Horizontal line */}
          <View>
            <Text style={{width: 150, textAlign: 'center', fontSize: 20}}>
              Current Stop
            </Text>
          </View>
          <View style={{flex: 1, height: 1, backgroundColor: 'silver'}} />
          {/*Horizontal line */}
        </View>

        <View>
          <Text numberOfLines={2} style={{fontSize: 14, marginTop: 10}}>
            {this.state.currentStop}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          title="EXIT"
          onPress={() => {
            console.log('clicked');
            return BackHandler.exitApp();
          }}>
          <Text style={{color: 'white'}}>EXIT</Text>
        </TouchableOpacity>
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
    marginTop: 10,
    width: Dimensions.get('window').width,
    height: 400,
    // flex: 1,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#2196F3',
    padding: 10,
    marginTop: 20,
    elevation: 2, // Android
  },
});
export default SecondScreen;
