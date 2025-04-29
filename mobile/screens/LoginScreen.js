import React, { useState } from 'react';
import { View, TextInput, Text, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Correcta importación


export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Por favor ingresa usuario y contraseña.");
      return;
    }

    try {
      const response = await fetch('http://172.20.10.3:8000/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('authToken', data.access_token); // Save the token
        Alert.alert("Login correcto", `Token: ${username}`);
        navigation.navigate('Home');
      } else {
        Alert.alert("Error de login", data.detail || "Credenciales incorrectas");
      }

    } catch (error) {
      Alert.alert("Error de re", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} />
      <TextInput>
      Don't have an acount?
      </TextInput>
      <Text onPress={() => navigation.navigate('Register')} style={{color:'blue'}}>
        Register here
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 80
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 15,
    borderRadius: 5
  }
});
