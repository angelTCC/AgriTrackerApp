import { View, TextInput, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  
  // Hook for navigation
  const navigation = useNavigation();

  // State variables for storing user input and fields data
  const [token, setToken] = useState(null);
  const [field_name, setFieldName] = useState('');
  const [crop_type, setCropType] = useState('');  
  const [area_size, setAreaSize] = useState('');
  const [planting_date, setPlantingDate] = useState('');
  const [harvest_date, setHarvestDate] = useState('');
  const [userFields, setUserFields] = useState([]); // Holds the user's saved fields data

  // Fetch the token from AsyncStorage and load user fields data on component mount
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken); // Store the token in state
          await fetchUserFields(storedToken); // Fetch the fields data using the token
        } else {
          Alert.alert("Error", "No token found. Please log in."); // If token not found, show error
        }
      } catch (error) {
        Alert.alert("Error", "Failed to retrieve token."); // Show error if fetching token fails
      }
    };
    fetchToken(); // Call the function to fetch the token
  }, []);

  // Fetch user's fields data from the server using the token
  const fetchUserFields = async (token) => {
    try {
      const response = await fetch('http://172.20.10.3:8000/auth/get-fields', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Authorization header with the token
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserFields(data); // Update state with the fetched fields data
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.detail || "Failed to fetch field data."); // Show error if fetching fails
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch field data."); // Show error if network request fails
    }
  };
  
  // Function to save new field data
  const handleSave = async () => {
    // Validate input fields
    if (!field_name || !crop_type || !area_size || !planting_date || !harvest_date) {
      Alert.alert("Error", "Please fill in all the fields.");
      return; // Return if any field is empty
    }

    try {
      const response = await fetch('http://172.20.10.3:8000/auth/add-field-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Authorization header with the token
        },
        body: JSON.stringify({
          field_name,
          crop_type,
          area_size: parseFloat(area_size), // Convert area size to number
          planting_date,
          harvest_date,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert("Error", errorData.detail || "Failed to save field data.");
        return;
      }
      Alert.alert("Success", "Field data saved successfully!"); // Show success message
      // Reset input fields after successful save
      setFieldName('');
      setCropType('');
      setAreaSize('');
      setPlantingDate('');
      setHarvestDate('');

      // Reload user fields
      await fetchUserFields(token);

    } catch (error) {
      Alert.alert("Error", "Failed to save field data."); // Show error if saving fails
    }
  };

  // Function to handle user logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken'); // Remove token from AsyncStorage
      Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente."); // Show logout success message
      navigation.replace('Login'); // Navigate to login screen
    } catch (error) {
      Alert.alert("Error", "No se pudo cerrar sesión."); // Show error if logout fails
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Welcome to the home</Text>
        <Text style={styles.subtitle}>Your field data:</Text>
        
        {/* Input fields for new field data */}
        <TextInput
          placeholder="Field Name"
          value={field_name}
          onChangeText={setFieldName}
          style={styles.input}
        />
        <TextInput
          placeholder="Crop Type"
          value={crop_type}
          onChangeText={setCropType}
          style={styles.input}
        />
        <TextInput
          placeholder="Area Size (hectares)"
          value={area_size}
          onChangeText={setAreaSize}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          placeholder="Planting Date (YYYY-MM-DD)"
          value={planting_date}
          onChangeText={setPlantingDate}
          style={styles.input}
        />
        <TextInput
          placeholder="Harvest Date (YYYY-MM-DD)"
          value={harvest_date}
          onChangeText={setHarvestDate}
          style={styles.input}
        />
        
        {/* Button to save field data */}
        <TouchableOpacity 
          onPress={handleSave} 
          style={{
            backgroundColor: '#007BFF', // blue color
            paddingVertical: 10,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: '#0056b3',
            width: '40%',
            alignItems: 'center',
            alignSelf: 'center',
            margin: 10,
            marginBottom: 20,
          }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold'}}>
            Add Field Data
          </Text>
        </TouchableOpacity>

        {/* Display saved fields */}
        <Text style={styles.subtitle}>Your Saved Fields:</Text>
        {userFields.length > 0 ? (
          userFields.map((field, index) => (
            <View key={index} style={styles.fieldCard}>
              <Text>Field Name: {field.field_name}</Text>
              <Text>Crop Type: {field.crop_type}</Text>
              <Text>Area Size: {field.area_size} ha</Text>
              <Text>Planting Date: {field.planting_date}</Text>
              <Text>Harvest Date: {field.harvest_date}</Text>
              <Text>-------------------------</Text>
            </View>
          ))
        ) : (
          <Text>No fields saved yet.</Text>
        )}

      </ScrollView>
      
      {/* Logout button */}
      {token && (
        <TouchableOpacity 
          onPress={handleLogout} 
          style={{
            backgroundColor: '#dc3545',
            paddingVertical: 10,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: '#a71d2a',
            width: '40%',
            alignItems: 'center',
            alignSelf: 'center',
            margin: 10,
          }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
            Cerrar Sesión
          </Text>
        </TouchableOpacity>
      )}

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    width: '60%',
  }
});
