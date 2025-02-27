import React, { useState, useCallback } from 'react';
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    />
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default HomeScreen;
