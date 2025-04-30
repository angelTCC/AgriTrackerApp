import { View, TextInput, Text, ScrollView, Button, StyleSheet, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  
  const [token, setToken] = useState(null);
  const [field_name, setFieldName] = useState('');
  const [crop_type, setCropType] = useState('');  
  const [area_size, setAreaSize] = useState('');
  const [planting_date, setPlantingDate] = useState('');
  const [harvest_date, setHarvestDate] = useState('');
  const [userFields, setUserFields] = useState([]);


  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken);
          await fetchUserFields(storedToken); 
        } else {
          Alert.alert("Error", "No token found. Please log in.");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to retrieve token.");
      }
    };
    fetchToken();
  }, []);

  const fetchUserFields = async (token) => {
    try {
      const response = await fetch('http://172.20.10.3:8000/auth/get-fields', { // <-- ruta ejemplo
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserFields(data);
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.detail || "Failed to fetch field data.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch field data.");
    }
  };
  

  const handleSave = async () => {
    if (!field_name || !crop_type || !area_size || !planting_date || !harvest_date) {
      Alert.alert("Error", "Please fill in all the fields.");
      return;
    }

    try {
      const response = await fetch('http://172.20.10.3:8000/auth/add-field-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          field_name,
          crop_type,
          area_size: parseFloat(area_size),
          planting_date,
          harvest_date,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert("Error", errorData.detail || "Failed to save field data.");
        return;
      }
      Alert.alert("Success", "Field data saved successfully!");
      // Reset inputs if needed
      setFieldName('');
      setCropType('');
      setAreaSize('');
      setPlantingDate('');
      setHarvestDate('');

      // Reload user fields
      await fetchUserFields(token);

    } catch (error) {
      Alert.alert("Error", "Failed to save field data.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Welcome to the home</Text>
        <Text style={styles.subtitle}>Your field data:</Text>
        
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
        
        <Button title="Save Field Data" onPress={handleSave} />

        {/* Mostrar los campos guardados */}
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 50,
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
  }
});
