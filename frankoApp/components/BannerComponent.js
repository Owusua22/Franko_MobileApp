import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Install @expo/vector-icons

export default function BannerComponent() {
<<<<<<< HEAD
  
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/vb.jpg')} // Replace with your image URL
        style={styles.image}
      />
    
=======
  const handleBuyNow = () => {
    // Logic for Buy Now button action
    console.log("Buy Now button pressed!");
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/newbanner.jpg')} // Replace with your image URL
        style={styles.image}
      />
      <TouchableOpacity style={styles.button} onPress={handleBuyNow}>
        <Ionicons name="cart" size={20} color="#fff" />
        <Text style={styles.buttonText}>Buy Now</Text>
      </TouchableOpacity>
>>>>>>> 4418917 (Initial commit)
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end', // Align button to the bottom
    alignItems: 'center',
<<<<<<< HEAD
    padding: 2,
=======
    padding: 5,
>>>>>>> 4418917 (Initial commit)
  },
  image: {
   
    width: '100%',
    height: 150,
    resizeMode: 'cover', // Make sure the image covers the screen
  },
  button: {
    backgroundColor: '#006838', // Red background for the button
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 50,
    marginBottom: 30, // Add space from the bottom
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
});
