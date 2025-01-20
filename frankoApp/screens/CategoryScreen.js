import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../redux/slice/categorySlice';
import { fetchBrands } from '../redux/slice/brandSlice';
import { useNavigation } from '@react-navigation/native';

const CategoryScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { categories, status, error } = useSelector((state) => state.categories);
  const { brands } = useSelector((state) => state.brands);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (categories.length > 0) {
      const firstCategory = categories[0];
      setSelectedCategoryId(firstCategory.categoryId);
      setSelectedCategoryName(firstCategory.categoryName);
    }
  }, [categories]);

  useEffect(() => {
    if (selectedCategoryId) {
      dispatch(fetchBrands(selectedCategoryId));
    }
  }, [dispatch, selectedCategoryId]);

  if (status === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  if (status === 'failed') {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderBrands = () => {
    const filteredBrands = brands.filter((brand) => brand.categoryId === selectedCategoryId);
    if (filteredBrands.length === 0) {
      return <Text style={styles.noBrandsText}>No brands available.</Text>;
    }
    return (
      <ScrollView style={styles.brandsContainer}>
        <View style={styles.brandGrid}>
          {filteredBrands.map((item) => (
            <TouchableOpacity
              key={item.brandId}
              style={styles.brandCard}
              onPress={() => navigation.navigate('Brands', { brandId: item.brandId })}
            >
              <Text style={styles.brandName}>{item.brandName}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.categoryContainer}>
<<<<<<< HEAD
      <FlatList
  data={categories.filter((item) => item.categoryName !== 'Products out of stock')}
  keyExtractor={(item) => item.categoryId}
  renderItem={({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategoryId === item.categoryId && styles.activeCategory,
      ]}
      onPress={() => {
        setSelectedCategoryId(item.categoryId);
        setSelectedCategoryName(item.categoryName);
      }}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategoryId === item.categoryId && styles.activeCategoryText,
        ]}
      >
        {item.categoryName}
      </Text>
    </TouchableOpacity>
  )}
/>

=======
        <FlatList
          data={categories}
          keyExtractor={(item) => item.categoryId}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryItem,
                selectedCategoryId === item.categoryId && styles.activeCategory,
              ]}
              onPress={() => {
                setSelectedCategoryId(item.categoryId);
                setSelectedCategoryName(item.categoryName);
              }}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategoryId === item.categoryId && styles.activeCategoryText,
                ]}
              >
                {item.categoryName}
              </Text>
            </TouchableOpacity>
          )}
        />
>>>>>>> 4418917 (Initial commit)
      </View>
      <View style={styles.brandContainer}>
        {selectedCategoryId ? (
          <>
            <Text style={styles.categoryTitle}>{selectedCategoryName}</Text>
            {renderBrands()}
          </>
        ) : (
          <Text style={styles.selectPrompt}>Select a category to view brands</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
<<<<<<< HEAD
    marginBottom: 80
=======
    marginBottom: 70
>>>>>>> 4418917 (Initial commit)
  },
  categoryContainer: {
    flex: 1,
    backgroundColor: '#E9ECEF',
    paddingVertical: 10,
  },
  brandContainer: {
    flex: 2,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  categoryItem: {
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    alignItems: 'center',
  },
  activeCategory: {
    backgroundColor: '#D72638',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#D72638',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#555',
  },
  errorText: {
    fontSize: 14,
    color: 'red',
  },
  selectPrompt: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  brandsContainer: {
    marginTop: 10,
  },
  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  brandCard: {
    width: '48%',
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#D1ECF1',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  brandName: {
    fontSize: 14,
    color: '#0C5460',
    textAlign: 'center',
  },
  noBrandsText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});

export default CategoryScreen;
