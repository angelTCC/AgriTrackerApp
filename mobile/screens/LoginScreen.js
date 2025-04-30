// Import necessary libraries
import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing the token locally

// Main Login screen component
export default function LoginScreen({ navigation }) {
  // State hooks to store the username and password entered by the user
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Handle the login process
  const handleLogin = async () => {
    // Check if both username and password are entered
    if (!username || !password) {
      Alert.alert("Error", "Please enter username and password.");
      return;
    }

    try {
      // Send POST request to backend to authenticate user and get the token
      const response = await fetch('http://172.20.10.3:8000/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
      });

      // Parse the response from the backend
      const data = await response.json();

      // If login is successful, store the token and navigate to Home screen
      if (response.ok) {
        await AsyncStorage.setItem('authToken', data.access_token); // Save the token locally
        Alert.alert("Login successful", `Welcome ${username}`);
        navigation.navigate('Home'); // Navigate to Home screen
      } else {
        // If login fails, show error message
        Alert.alert("Login error", data.detail || "Incorrect credentials");
      }

    } catch (error) {
      // Handle any errors during the network request
      Alert.alert("Network error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Welcome message */}
      <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 20, width: '80%', alignSelf: 'center' }}>
        Welcome to AgriTracker! Please log in to track your agricultural data.
      </Text>

      {/* Input fields for username and password */}
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername} // Update username state
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry // Hide password text
        value={password}
        onChangeText={setPassword} // Update password state
        style={styles.input}
      />

      {/* Login button */}
      <TouchableOpacity
        onPress={handleLogin} // Trigger the login process when button is pressed
        style={{
          backgroundColor: '#007BFF', // Blue color for the button
          paddingVertical: 10,
          paddingHorizontal: 10,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: '#0056b3',
          width: '20%', // Set button width
          alignItems: 'center', // Center text inside the button
          alignSelf: 'center', // Center the button horizontally
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
          Login
        </Text>
      </TouchableOpacity>

      {/* Link to register screen for users who don't have an account */}
      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <TextInput>
          Don't have an account?
        </TextInput>
        <Text onPress={() => navigation.navigate('Register')} style={{ color: 'blue' }}>
          Register here
        </Text>
      </View>
    </View>
  );
}

// Styles for the screen layout
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // White background color for the container
    padding: 20,
    paddingTop: 60, // Add padding to the top for better UI
  },
  input: {
    borderWidth: 1, // Border width for the input fields
    padding: 10, // Padding inside the input field
    marginBottom: 15, // Margin between input fields
    borderRadius: 5, // Rounded corners for input fields
    width: '80%', // Set input field width
    alignSelf: 'center', // Center the input fields horizontally
  }
});

