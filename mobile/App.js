import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View} from 'react-native';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import RegisterScreen from './screens/RegisterScreen';

import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer initialRouteName="Login">
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        paddingBottom: 10,
        backgroundColor: '#42ad42',
      }}>
        <Icon name="leaf" size={28} color="#FFFFFF" style={{ marginRight: 10 }} />
        <Text style={{
          fontSize: 24,
          color: '#FFFFFF',
          fontFamily: 'Cochin',
        }}>
          AgriTrackerApp
        </Text>
      </View>

      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{headerShown:false}}/>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown:false}}/>
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown:false}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

