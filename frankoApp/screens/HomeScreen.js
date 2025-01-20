import React, { useState, useCallback } from 'react';
<<<<<<< HEAD
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import CarouselComponent from '../components/CarouselComponent'; 
import BannerComponent from '../components/BannerComponent';
import ShopByBrandsBanner from '../components/BrandsBannerComponent';
import ComboComponent from "../components/ComboComponent";
import CategoryComponent from '../components/CategoryComponent';

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);

  const sections = [
    { key: 'carousel', component: <CarouselComponent /> },
    { key: 'categorycomponent', component: <CategoryComponent /> },
    { key: 'brandsbanner', component: <ShopByBrandsBanner /> },
    { key: 'banner', component: <BannerComponent /> },
    { key: 'combocomponent', component: <ComboComponent /> },
  ];

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
=======
import { View, StyleSheet, FlatList, Platform, RefreshControl } from 'react-native';
import CarouselComponent from '../components/CarouselComponent'; // Ensure default export
import BannerComponent from '../components/BannerComponent'; // Ensure default export
import ProductsComponent from '../components/ProductsComponent'; // Ensure default export
import ShopByBrandsBanner from '../components/BrandsBannerComponent'; // Ensure default export

const HomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);

  // Data array for FlatList sections
  const sections = [
    { key: 'carousel', component: <CarouselComponent /> },
    { key: 'brandsbanner', component: <ShopByBrandsBanner /> },
    { key: 'banner', component: <BannerComponent /> },
    { key: 'products', component: <ProductsComponent navigation={navigation} /> },
    
  ];

  // Function to handle data reload
  const handleRefresh = useCallback(() => {
    setRefreshing(true);

    // Simulate data reload (e.g., fetch updated data from an API)
    setTimeout(() => {
      // Add any data fetching logic here
      setRefreshing(false);
    }, 1000); // Adjust duration as needed
>>>>>>> 4418917 (Initial commit)
  }, []);

  return (
    <FlatList
      data={sections}
      keyExtractor={(item) => item.key}
      renderItem={({ item }) => (
        <View style={styles.sectionContainer}>
          {item.component}
        </View>
      )}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
<<<<<<< HEAD
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
=======
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
>>>>>>> 4418917 (Initial commit)
    />
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
<<<<<<< HEAD
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
=======
    marginBottom: 20, // Space between sections
    borderRadius: 10, // Rounded corners for each section
    overflow: 'hidden', // Prevent overflow of rounded corners
    backgroundColor: '#fff', // White background for each section
    shadowColor: '#000', // Drop shadow for sections
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Android shadow effect
>>>>>>> 4418917 (Initial commit)
  },
});

export default HomeScreen;
