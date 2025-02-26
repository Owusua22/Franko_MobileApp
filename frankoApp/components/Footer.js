import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons'; // Import required icons
import { useNavigation, useRoute } from '@react-navigation/native'; // Import useNavigation and useRoute hooks

export default function Footer() {
  const navigation = useNavigation(); // Access the navigation prop using the hook
  const route = useRoute(); // Access the current route

  // Function to determine if a tab is active
  const isActive = (tabName) => route.name === tabName;

  return (
    <View style={styles.footerContainer}>
      {/* Home */}
      <TouchableOpacity
        style={[styles.footerItem, isActive('Home') && styles.activeTab]}
        onPress={() => navigation.navigate('Home')}
      >
        <AntDesign name="home" size={24} color="white" />
        <Text style={styles.footerText}>Home</Text>
      </TouchableOpacity>

      {/* Categories */}
      <TouchableOpacity
        style={[styles.footerItem, isActive('Category') && styles.activeTab]}
        onPress={() => navigation.navigate('Category')}
      >
        <MaterialIcons name="category" size={24} color="white" />
        <Text style={styles.footerText}>Categories</Text>
      </TouchableOpacity>

      {/* Account */}
      <TouchableOpacity
        style={[styles.footerItem, isActive('Account') && styles.activeTab]}
        onPress={() => navigation.navigate('Account')}
      >
        <Ionicons name="person-circle-outline" size={24} color="white" />
        <Text style={styles.footerText}>Account</Text>
      </TouchableOpacity>

      {/* Notifications */}
      <TouchableOpacity
  style={[styles.footerItem, isActive('Shops') && styles.activeTab]}
  onPress={() => navigation.navigate('Shops')}
>
  <Ionicons name="storefront" size={24} color="white" />
  <Text style={styles.footerText}>Shops</Text>
</TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 40
  },
  footerItem: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10, 
  },
  footerText: {
    color: 'white',
    fontSize: 10,
    marginTop: 5,
  },
  activeTab: {
    backgroundColor: '#555', // Active tab background color
  },
});