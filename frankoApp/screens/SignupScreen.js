import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createCustomer } from "../redux/slice/customerSlice";
import { useNavigation } from '@react-navigation/native';
import UUID from 'react-native-uuid';
import Icon from 'react-native-vector-icons/Ionicons';

const SignupScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const message = useSelector((state) => state.customer.message); // Replace 'customer' with the actual slice name
  const [formData, setFormData] = useState({
    customerAccountNumber: '',
    firstName: '',
    lastName: '',
    contactNumber: '',
    address: '',
    password: '',
    accountType: 'customer', // Default account type
    accountStatus: '1', // Default account status (active) when signing up
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const accountNumber = UUID.v4(); // Generate a unique account number
    setFormData((prevState) => ({
      ...prevState,
      customerAccountNumber: accountNumber,
      accountStatus: '1', // Default account status (active) when signing up
    }));
  }, []);

  useEffect(() => {
    if (message) {
      console.log('Redux Message:', message);
    }
  }, [message]);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const { firstName, lastName, contactNumber, address, password, customerAccountNumber, email } = formData;

    if (!firstName || !lastName || !contactNumber || !password) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);

    const finalData = {
      firstName,
      lastName,
      contactNumber,
      address,
      password,
      accountType: 'customer', // Always customer
      customerAccountNumber,
      email: email || '',
    };

    try {
      console.log('Final Data:', finalData);
      await dispatch(createCustomer(finalData)).unwrap();
      console.log('Registration successful!');
      Alert.alert('Success', 'Registration successful!', [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (error) {
      console.log('Registration failed:', error.message);
      Alert.alert('Error', `Registration failed: ${error.message}`);
    } finally {
      console.log('Loading state set to false');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjusts for platform
  >
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled" // Allows taps outside the input to dismiss keyboard
    >
      <View style={styles.container}>
        <Image source={require('../assets/frankoIcon.png')} style={styles.logo} />
        <Text style={styles.title}>Register</Text>
  
        <View style={styles.inputContainer}>
          <Icon name="person-outline" size={20} color="#666" style={styles.icon} />
          <TextInput
            placeholder="First Name"
            style={styles.input}
            onChangeText={(value) => handleChange('firstName', value)}
          />
        </View>
  
        <View style={styles.inputContainer}>
          <Icon name="person-circle-outline" size={20} color="#666" style={styles.icon} />
          <TextInput
            placeholder="Last Name"
            style={styles.input}
            onChangeText={(value) => handleChange('lastName', value)}
          />
        </View>
  
        <View style={styles.inputContainer}>
          <Icon name="call-outline" size={20} color="#666" style={styles.icon} />
          <TextInput
            placeholder="Contact Number"
            style={styles.input}
            keyboardType="phone-pad"
            onChangeText={(value) => handleChange('contactNumber', value)}
          />
        </View>
  
        <View style={styles.inputContainer}>
          <Icon name="location-outline" size={20} color="#666" style={styles.icon} />
          <TextInput
            placeholder="Address"
            style={styles.input}
            onChangeText={(value) => handleChange('address', value)}
          />
        </View>
  
        <View style={styles.inputContainer}>
          <Icon name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry
            onChangeText={(value) => handleChange('password', value)}
          />
        </View>
  
        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        )}
  
        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.footerText}>
            Already registered? <Text style={styles.linkText}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
  
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100, // Extra space for the keyboard
  },
  
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F9F9F9',
  },
  logo: {
    width: 140,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#006838',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 14,
    color: '#555',
  },
  linkText: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 10,
  },
});

export default SignupScreen;