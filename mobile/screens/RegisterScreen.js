import { View, Text, StyleSheet, Button, Alert} from 'react-native';
import React, { useState } from 'react';
import { TextInput } from 'react-native-gesture-handler';

export default function RegisterScreen({navigation}) {

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    

    const handleRegister = async () => {
        if (!username || !email || !password) {
            Alert.alert("Error", "Por favor ingresa usuario, email y contraseña.");
            return;
        }

        try {
            const response = await fetch('http://172.20.10.3:8000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                Alert.alert("Error", errorData.detail || "Registration failed");
                return;
            }
            const data = await response.json();
            Alert.alert("Registro correcto", `Usuario: ${username}`);
            navigation.navigate('Home');
        } catch (error) {
            Alert.alert("Error de red", error.message);
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
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
            />

            <Button title="Register" onPress={ handleRegister } />

        </View>
    )
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
