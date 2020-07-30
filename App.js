/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import React, {Component} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import SecondScreen from './SecondScreen';
import HomeScreen from './HomeScreen';
import {NavigationContainer} from '@react-navigation/native';

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
} from 'react-native';

const Stack = createStackNavigator();
// const MyStack = () => {
//   return ;
// };

// const HomeScreen = ({navigation}) => {
//   return (
//     <View>
//       <Button
//         title="Go to Jane's profile"
//         onPress={() => navigation.navigate('Profile', {name: 'Jane'})}
//       />
//     </View>
//   );
// };
// const ProfileScreen = () => {
//   return <Text>This is Jane's profile</Text>;
// };
// const RootStack = createStackNavigator(
//   {
//     Home: {
//       screen: HomeScreen,
//     },
//     SecondScreen: {screen: SecondScreen},
//   },
//   {
//     initialRouteName: 'Home',
//   },
// );

export default class App extends Component {
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="HomeScreen"
          screenOptions={{gestureEnabled: false}}>
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            // options={{title: 'Welcome'}}
          />
          <Stack.Screen name="SecondScreen" component={SecondScreen} />
        </Stack.Navigator>
      </NavigationContainer>
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
});
