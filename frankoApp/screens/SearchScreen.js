import  { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList,
  Image, ActivityIndicator, ScrollView, Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../redux/slice/productSlice'; // Adjust path as needed
import { debounce } from 'lodash';

const { width } = Dimensions.get('window');

const SearchScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Search states
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  
  // Redux state
  const { products = [], loading } = useSelector((state) => state.products);
  
  // Refs
  const debounceRef = useRef(null);

  const TRENDING = [
    { name: 'phone', route: 'Phones' },
    { name: 'laptops', route: 'Computers' },
    { name: 'airconditioners', route: 'AirCondition' },
    { name: 'speakers', route: 'Speakers' },
    { name: 'accessories', route: 'Accessories' },
    { name: 'television', route: 'Television' },
    { name: 'fridges', route: 'Fridge' },
  ];

  // Backend configuration
  const backendBaseURL = 'https://smfteapi.salesmate.app';

  useEffect(() => {
    loadRecentSearches();
    // Fetch products if not already loaded
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  // Debounce logic setup
  useEffect(() => {
    debounceRef.current = debounce((value) => setSearchQuery(value), 300);
    return () => debounceRef.current?.cancel();
  }, []);

  // Search functionality with debouncing
  useEffect(() => {
    if (searchQuery.trim()) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem('recentSearches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveSearch = async (term) => {
    try {
      let updated = [term, ...recentSearches.filter(item => item !== term)];
      if (updated.length > 5) updated = updated.slice(0, 5);
      setRecentSearches(updated);
      await AsyncStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (text) => {
    setSearchText(text);
    debounceRef.current(text);
  };

  const handleSearch = (term = searchText) => {
    if (term.trim() === '') return;
    saveSearch(term.trim());
    setSearchText(term);
    setSearchQuery(term);
    setShowSearchResults(true);
  };

  // Handle trending item clicks - navigate to category screens
  const handleTrendingClick = (trendingItem) => {
    navigation.navigate(trendingItem.route);
  };

  const handleClear = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem('recentSearches');
    } catch (error) {
      console.error('Error clearing searches:', error);
    }
  };

  // Product navigation with AsyncStorage
const handleProductClick = async (productID) => {
  try {
    const product = products.find(p => p.productID === productID);
    if (product) {
      const recentlyViewed = await AsyncStorage.getItem('recentlyViewed');
      let viewedProducts = recentlyViewed ? JSON.parse(recentlyViewed) : [];

      viewedProducts = viewedProducts.filter(p => p.productID !== productID);
      viewedProducts.unshift(product);

      if (viewedProducts.length > 10) {
        viewedProducts = viewedProducts.slice(0, 10);
      }

      await AsyncStorage.setItem('recentlyViewed', JSON.stringify(viewedProducts));
    }

    navigation.navigate("ProductDetails", { productId: productID });
  } catch (error) {
    console.error('Error storing product in AsyncStorage:', error);
    navigation.navigate("ProductDetails", { productId: productID });
  }
};


  // Utility functions
  const formatPrice = (price) => `₵${price?.toLocaleString?.() || 'N/A'}`;

  const getImageURL = (productImage) => {
    if (!productImage) return null;
    const imagePath = productImage.split('\\').pop();
    return `${backendBaseURL}/Media/Products_Images/${imagePath}`;
  };

  const highlightText = (text = '') => {
    if (!searchQuery) return text;
    // For React Native, we'll return the original text since we can't use HTML
    return text;
  };

  // Filter products based on search query
  const filteredProducts = searchQuery
    ? products.filter((product) =>
        product.productName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const renderTag = (item, onPress, isTrending = false) => (
    <TouchableOpacity 
      key={isTrending ? item.name : item} 
      style={styles.tag} 
      onPress={() => isTrending ? handleTrendingClick(item) : onPress(isTrending ? item.name : item)}
      activeOpacity={0.7}
    >
      <Text style={styles.tagText}>{isTrending ? item.name : item}</Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item: product }) => {
    const imageURL = getImageURL(product.productImage);
    
    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => handleProductClick(product.productID)}
        activeOpacity={0.7}
      >
        <View style={styles.productImageContainer}>
          {imageURL ? (
            <Image
              source={{ uri: imageURL }}
              style={styles.productImage}
              onError={() => {
                // Handle image error if needed
              }}
            />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {highlightText(product.productName || '')}
          </Text>
          <Text style={styles.productPrice}>
            {formatPrice(product.price)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSearchResults = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Searching products...</Text>
        </View>
      );
    }

    if (searchText.trim() === '') {
      return (
        <View style={styles.emptyState}>
          <Icon name="search" size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateText}>Start typing to search for products</Text>
        </View>
      );
    }

    if (filteredProducts.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="search-off" size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateText}>
            No products found for "{searchText}"
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.searchResultsContainer}>
        <Text style={styles.resultsCount}>
          Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} for "{searchText}"
        </Text>
        
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.productID.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Search Bar */}
      <View style={styles.searchBar}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="What are you looking for?"
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={handleSearchChange}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
            autoFocus={true}
          />
          
          {searchText.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setSearchText('');
                setSearchQuery('');
                setShowSearchResults(false);
              }}
              style={styles.clearButton}
            >
              <Icon name="clear" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          onPress={() => handleSearch()}
          style={styles.searchButton}
          activeOpacity={0.7}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {showSearchResults ? (
        renderSearchResults()
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Recently Searched */}
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recently Searched</Text>
                <TouchableOpacity onPress={handleClear} activeOpacity={0.7}>
                  <Icon name="delete" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <View style={styles.tagsWrapper}>
                {recentSearches.map((item) =>
                  renderTag(item, handleSearch, false)
                )}
              </View>
            </View>
          )}

          {/* Trending */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Searches 🔥</Text>
            </View>
            <View style={styles.tagsWrapper}>
              {TRENDING.map((item) =>
                renderTag(item, null, true)
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 10, // Safe area
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  searchButton: {
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#E8F5E8',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  tagText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  searchResultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
    marginVertical: 12,
    fontWeight: '500',
  },
  productsList: {
    paddingBottom: 20,
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  productImageContainer: {
    marginRight: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default SearchScreen;