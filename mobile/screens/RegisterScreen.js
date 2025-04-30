// Import necessary libraries
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { TextInput } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage'; // To store the authentication token locally

// Main Register screen component
export default function RegisterScreen({ navigation }) {

    // State hooks to store the user input for username, email, and password
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Handle the registration process
    const handleRegister = async () => {
        // Ensure that all fields are filled
        if (!username || !email || !password) {
          Alert.alert("Error", "Please enter username, email, and password.");
          return;
        }

        try {
          // First, attempt to register the user
          const registerResponse = await fetch('http://172.20.10.3:8000/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }) // Send registration data
          });

          // Check if registration failed
          if (!registerResponse.ok) {
            const errorData = await registerResponse.json();
            Alert.alert("Error", errorData.detail || "Error during registration.");
            return;
          }

          // If registration is successful, proceed to login automatically
          const loginResponse = await fetch('http://172.20.10.3:8000/auth/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}` // Send login credentials
          });

          // Check if login fails after registration
          if (!loginResponse.ok) {
            Alert.alert("Error", "Registration successful but failed to log in automatically.");
            navigation.navigate('Login');  // Redirect to Login screen if login fails
            return;
          }

          // If login is successful, store the access token locally using AsyncStorage
          const loginData = await loginResponse.json();
          await AsyncStorage.setItem('authToken', loginData.access_token);

          // Show success message and navigate to Home screen
          Alert.alert("Registration successful", `Welcome, ${username}!`);
          navigation.replace('Home'); // Use replace to avoid the user being able to navigate back to the registration screen

        } catch (error) {
          // Handle any network or other errors
          Alert.alert("Network error", error.message);
        }
    };

    return (
        <View style={styles.container}>
            {/* Welcome message */}
            <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 20, width: '80%', alignSelf: 'center' }}>
                Welcome to AgriTracker! Please register to track your agricultural data.
            </Text>

            {/* Input fields for username, email, and password */}
            <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername} // Update username state when text changes
                style={styles.input}
            />
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail} // Update email state when text changes
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                secureTextEntry // Mask the password input
                value={password}
                onChangeText={setPassword} // Update password state when text changes
                style={styles.input}
            />

            {/* Register button */}
            <TouchableOpacity onPress={handleRegister}> 
                <Text style={{
                    backgroundColor: '#007BFF', // Blue background for the button
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                    borderRadius: 8, // Rounded corners for the button
                    borderWidth: 2,
                    borderColor: '#0056b3', // Darker blue for the border
                    width: '20%', // Button width
                    alignItems: 'center', // Center text inside the button
                    alignSelf: 'center', // Center the button horizontally
                    color: '#FFFFFF', // White text color
                }}>
                    Register
                </Text>
            </TouchableOpacity>

        </View>
    )
}

// Styles for the screen layout
const styles = StyleSheet.create({
  container: {
    flex: 1, // Allow the container to take up the full available space
    alignItems: 'center', // Center all elements inside the container
    padding: 20,
    marginTop: 80, // Add some top margin to avoid overlap with status bar
  },
  input: {
    borderWidth: 1, // Border width for the input fields
    padding: 10, // Padding inside the input fields
    marginBottom: 15, // Space between input fields
    borderRadius: 5, // Rounded corners for input fields
    width: '60%', // Set the width of the input fields
  }
});
