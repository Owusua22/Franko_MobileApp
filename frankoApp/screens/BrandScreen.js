import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View,  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  StatusBar,
  Modal,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsByBrand, clearProducts } from '../redux/slice/productSlice';
import { addToCart } from '../redux/slice/cartSlice';
import { AntDesign, MaterialIcons, Entypo } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { removeFromWishlist, addToWishlist } from '../redux/wishlistSlice';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const BrandScreen = () => {
  const route = useRoute();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const brandId = route.params?.brandId || null;
  const productsState = useSelector((state) => state.products || { products: [], loading: false });
  const brandsState = useSelector((state) => state.brands || { brands: [], loading: false });
  const cartId = useSelector((state) => state.cart.cartId);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const [selectedBrandId, setSelectedBrandId] = useState(brandId);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showBrandsDropdown, setShowBrandsDropdown] = useState(false);
  const [showSellersDropdown, setShowSellersDropdown] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSeller, setSelectedSeller] = useState('');

  // Add to cart loading state for individual products
  const [addingToCart, setAddingToCart] = useState({});

  // Scroll position restoration states
  const [currentScrollOffset, setCurrentScrollOffset] = useState(0);
  const [shouldRestoreScroll, setShouldRestoreScroll] = useState(false);
  const flatListRef = useRef(null);

  // Check if we should restore scroll position when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const checkScrollRestore = async () => {
        try {
          const savedScrollPosition = await AsyncStorage.getItem(`brandScreenScrollPosition_${brandId}`);
          if (savedScrollPosition) {
            setCurrentScrollOffset(parseFloat(savedScrollPosition));
            setShouldRestoreScroll(true);
          }
        } catch (error) {
          console.log("Error checking scroll position:", error);
        }
      };

      dispatch(clearProducts());
      dispatch(fetchProductsByBrand(brandId)).then(() => {
        checkScrollRestore();
      });

      return () => {
        setShouldRestoreScroll(false);
      };
    }, [brandId, dispatch])
  );

  // Restore scroll position after products are loaded
  useEffect(() => {
    if (shouldRestoreScroll && filteredProducts.length > 0) {
      setTimeout(() => {
        restoreScrollPosition();
      }, 300);
    }
  }, [filteredProducts, shouldRestoreScroll]);

  const restoreScrollPosition = async () => {
    try {
      if (currentScrollOffset > 0 && flatListRef.current && filteredProducts.length > 0) {
        flatListRef.current.scrollToOffset({ 
          offset: currentScrollOffset, 
          animated: false 
        });
        setShouldRestoreScroll(false);
      }
    } catch (error) {
      console.log("Error restoring scroll position:", error);
    }
  };

  // Track scroll position continuously
  const handleScroll = (event) => {
    const offset = event.nativeEvent.contentOffset.y;
    setCurrentScrollOffset(offset);
  };

  // Filter and sort products using useMemo for better performance
  const { categories, sellers } = useMemo(() => {
    const cats = [...new Set(productsState.products.map(p => p.category).filter(Boolean))];
    const sels = [...new Set(productsState.products.map(p => p.seller).filter(Boolean))];
    return { categories: cats, sellers: sels };
  }, [productsState.products]);

  useEffect(() => {
    let filtered = [...productsState.products];

    // Apply price filter
    if (minPrice !== '' || maxPrice !== '') {
      const min = parseFloat(minPrice) || 0;
      const max = parseFloat(maxPrice) || Infinity;
      filtered = filtered.filter(product => {
        const price = parseFloat(product.price) || 0;
        return price >= min && (maxPrice === '' || price <= max);
      });
    }

    // Apply category filter
    if (selectedCategory !== '') {
      filtered = filtered.filter(product => 
        product.category && product.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Apply seller filter
    if (selectedSeller !== '') {
      filtered = filtered.filter(product => 
        product.seller && product.seller.toLowerCase().includes(selectedSeller.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
        case 'price_high':
          return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
        case 'discount':
          const discountA = a.oldPrice > a.price ? ((a.oldPrice - a.price) / a.oldPrice) * 100 : 0;
          const discountB = b.oldPrice > b.price ? ((b.oldPrice - b.price) / b.oldPrice) * 100 : 0;
          return discountB - discountA;
        case 'newest':
          return new Date(b.createdDate || 0) - new Date(a.createdDate || 0);
        default:
          return (a.productName || '').localeCompare(b.productName || '');
      }
    });

    setFilteredProducts(filtered);
  }, [productsState.products, minPrice, maxPrice, sortBy, selectedCategory, selectedSeller]);

  const selectedBrand = brandsState.brands?.find((brand) => brand.brandId === brandId) || {};
  const relatedBrands = selectedBrand?.categoryId
    ? brandsState.brands.filter((brand) => brand.categoryId === selectedBrand.categoryId)
    : [];

  const formatPrice = (price) => {
    const numPrice = parseFloat(price) || 0;
    return numPrice.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/300x300/f0f0f0/cccccc?text=No+Image";

    const fileName = imagePath.split(/[\\/]/).pop();

    if (imagePath.includes("\\") || imagePath.includes("F:") || imagePath.includes("D:")) {
      return `https://smfteapi.salesmate.app/Media/Products_Images/${fileName}`;
    }

    if (imagePath.startsWith("http")) return imagePath;

    return `https://smfteapi.salesmate.app/${imagePath}`;
  };

  // Add to cart functionality
  const handleAddToCart = (product) => {
    const cartData = {
      cartId,
      productId: product.productID,
      price: product.price,
      quantity: 1,
    };

    // Set loading state for this specific product
    setAddingToCart(prev => ({ ...prev, [product.productID]: true }));

    dispatch(addToCart(cartData))
      .then(() => {
        Alert.alert("Success", `${product.productName} added to cart successfully!`);
      })
      .catch((error) => {
        Alert.alert("Error", `Failed to add product to cart: ${error.message}`);
      })
      .finally(() => {
        // Remove loading state for this product
        setAddingToCart(prev => {
          const newState = { ...prev };
          delete newState[product.productID];
          return newState;
        });
      });
  };

  // Handle product press with scroll position saving
  const handleNavigateProduct = async (productId) => {
    try {
      // Save current scroll position before navigating
      if (flatListRef.current) {
        await AsyncStorage.setItem(`brandScreenScrollPosition_${brandId}`, currentScrollOffset.toString());
      }
    } catch (error) {
      console.log("Error saving scroll position:", error);
    }
    
    navigation.navigate('ProductDetails', { productId, brandId });
  };

  // FIXED: Safe back navigation with fallback
  const handleBackPress = () => {
    try {
      // Check if we can go back
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        // Fallback navigation options:
        
        // Option 1: Navigate to a specific screen (recommended)
        navigation.navigate('Home'); // Replace 'Home' with your main screen name
        
        // Option 2: Navigate to the first screen in the stack
        // navigation.navigate('Home', { screen: 'Home' });
        
        // Option 3: Reset navigation stack to a specific screen
        // navigation.reset({
        //   index: 0,
        //   routes: [{ name: 'Home' }],
        // });
      }
    } catch (error) {
      console.log('Navigation error:', error);
      // Ultimate fallback - navigate to main screen
      navigation.navigate('Home');
    }
  };

  const handleShare = async () => {
    try {
      const brandName = selectedBrand.brandName || 'Brand';

      
      const result = await Share.share({
        message: `Check out ${brandName} on Franko Trading!  amazing products available. Download the app to explore more!`,
        title: `${brandName} - Products on Franko Trading`,
       
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share at the moment. Please try again.');
    }
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedCategory('');
    setSelectedSeller('');
    setSortBy('name');
    setShowFilterModal(false);
  };

  const applyFilters = () => {
    setShowFilterModal(false);
  };

  const closeAllDropdowns = () => {
    setShowSortDropdown(false);
    setShowBrandsDropdown(false);
    setShowSellersDropdown(false);
  };

  const handleSortSelect = (sortOption) => {
    setSortBy(sortOption);
    setShowSortDropdown(false);
  };

  const handleBrandSelect = (brand) => {
    setSelectedBrandId(brand.brandId);
    setShowBrandsDropdown(false);
    navigation.navigate('Brands', { brandId: brand.brandId });
  };

  const sortOptions = [
    { key: 'name', label: 'Sort' },
    { key: 'price_low', label: 'Price (Low to High)' },
    { key: 'price_high', label: 'Price (High to Low)' },
    { key: 'discount', label: 'Highest Discount' },
    { key: 'newest', label: 'Newest First' }
  ];

  const getCurrentSortLabel = () => {
    const currentSort = sortOptions.find(option => option.key === sortBy);
    return currentSort ? currentSort.label : 'Sort';
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (minPrice !== '' || maxPrice !== '') count++;
    if (selectedCategory !== '') count++;
    if (selectedSeller !== '') count++;
    return count;
  };
  
  const handleToggleWishlist = (product) => {
    const isInWishlist = wishlistItems.some(
      (w) => w.productID === product.productID
    );

    if (isInWishlist) {
      dispatch(removeFromWishlist(product.productID));
      Alert.alert("Removed", `${product.productName} removed from wishlist.`);
    } else {
      dispatch(addToWishlist(product));
      Alert.alert("Added", `${product.productName} added to wishlist ❤️`);
    }
  };

  const renderProduct = ({ item, index }) => {
    const discount =
      item.oldPrice > item.price
        ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)
        : 0;

    const isNew = index < 3;
    const isAddingThisItem = addingToCart[item.productID];

    return (
      <TouchableOpacity 
        style={styles.productCard} 
        onPress={() => handleNavigateProduct(item.productID)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getImageUrl(item.productImage) }}
            style={styles.productImage}
            resizeMode="contain"
          />

          {isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
          
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>SALE</Text>
            </View>
          )}

         <TouchableOpacity
  style={styles.wishlistButton}
  onPress={(e) => {
    e.stopPropagation(); // Prevent navigation
    handleToggleWishlist(item);
  }} 
>
  <AntDesign
    name={
      wishlistItems.some((w) => w.productID === item.productID)
        ? "heart"
        : "hearto"
    }
    size={16}
    color={
      wishlistItems.some((w) => w.productID === item.productID)
        ? "red"
        : "#666"
    }
  />
</TouchableOpacity>

        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.productName}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>₵{formatPrice(item.price)}</Text>
            {item.oldPrice > 0 && (
              <Text style={styles.oldPrice}>₵{formatPrice(item.oldPrice)}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.addToCartButton,
            isAddingThisItem && styles.addToCartButtonDisabled
          ]}
          onPress={(e) => {
            e.stopPropagation();
            handleAddToCart(item);
          }}
          disabled={isAddingThisItem}
        >
          {isAddingThisItem ? (
            <ActivityIndicator size={14} color="white" />
          ) : (
            <AntDesign name="shoppingcart" size={14} color="white" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderDropdown = (items, onSelect, selectedValue, placeholder) => (
    <View style={styles.dropdown}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.dropdownItem, selectedValue === item.key && styles.selectedDropdownItem]}
          onPress={() => onSelect(item)}
        >
          <Text style={[styles.dropdownItemText, selectedValue === item.key && styles.selectedDropdownItemText]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderBrandsDropdown = () => (
    <View style={styles.dropdown}>
      {relatedBrands.map((brand, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.dropdownItem, selectedBrandId === brand.brandId && styles.selectedDropdownItem]}
          onPress={() => handleBrandSelect(brand)}
        >
          <Text style={[styles.dropdownItemText, selectedBrandId === brand.brandId && styles.selectedDropdownItemText]}>
            {brand.brandName}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter & Sort</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <AntDesign name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Price Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Price Range</Text>
              <View style={styles.priceInputContainer}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Min Price"
                  keyboardType="numeric"
                  value={minPrice}
                  onChangeText={setMinPrice}
                />
                <Text style={styles.priceSeparator}>to</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Max Price"
                  keyboardType="numeric"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                />
              </View>
            </View>

            {/* Category Filter */}
            {categories.length > 0 && (
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[styles.filterChip, selectedCategory === '' && styles.filterChipSelected]}
                    onPress={() => setSelectedCategory('')}
                  >
                    <Text style={[styles.filterChipText, selectedCategory === '' && styles.filterChipTextSelected]}>
                      All
                    </Text>
                  </TouchableOpacity>
                  {categories.map((category, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.filterChip, selectedCategory === category && styles.filterChipSelected]}
                      onPress={() => setSelectedCategory(category)}
                    >
                      <Text style={[styles.filterChipText, selectedCategory === category && styles.filterChipTextSelected]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Seller Filter */}
            {sellers.length > 0 && (
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Seller</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[styles.filterChip, selectedSeller === '' && styles.filterChipSelected]}
                    onPress={() => setSelectedSeller('')}
                  >
                    <Text style={[styles.filterChipText, selectedSeller === '' && styles.filterChipTextSelected]}>
                      All
                    </Text>
                  </TouchableOpacity>
                  {sellers.map((seller, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.filterChip, selectedSeller === seller && styles.filterChipSelected]}
                      onPress={() => setSelectedSeller(seller)}
                    >
                      <Text style={[styles.filterChipText, selectedSeller === seller && styles.filterChipTextSelected]}>
                        {seller}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <LinearGradient
                colors={['#FF6347', '#FF4500']}
                style={styles.applyButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.brandheader}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <Text style={styles.logoText} numberOfLines={1}>
            {selectedBrand.brandName || 'Franko Trading'}
          </Text>
          {selectedBrand.brandName && (
            <Text style={styles.productCount}>
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionButton} onPress={handleShare}>
            <AntDesign name="sharealt" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => {
            closeAllDropdowns();
            setShowSortDropdown(!showSortDropdown);
          }}
        >
          <Text style={styles.filterButtonText}>{getCurrentSortLabel()}</Text>
          <Entypo name="chevron-down" size={16} color="#333" />
        </TouchableOpacity>

        {relatedBrands.length > 1 && (
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => {
              closeAllDropdowns();
              setShowBrandsDropdown(!showBrandsDropdown);
            }}
          >
            <Text style={styles.filterButtonText}>Brands</Text>
            <Entypo name="chevron-down" size={16} color="#333" />
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.filterIconContainer}
          onPress={() => setShowFilterModal(true)}
        >
          <MaterialIcons name="tune" size={20} color="#333" />
          <Text style={styles.filterText}>Filter</Text>
          {getActiveFiltersCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Dropdowns */}
      {showSortDropdown && renderDropdown(sortOptions, handleSortSelect, sortBy, 'Sort by')}
      {showBrandsDropdown && renderBrandsDropdown()}

      {/* Products List */}
      {productsState.loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6347" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="search-off" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptySubtitle}>
            {getActiveFiltersCount() > 0 ? 'Try adjusting your filters' : 'No products available for this brand'}
          </Text>
          {getActiveFiltersCount() > 0 && (
            <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
              <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={filteredProducts}
          keyExtractor={(item) => item.productID.toString()}
          renderItem={renderProduct}
          numColumns={2}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={100}
          columnWrapperStyle={styles.productRow}
          removeClippedSubviews={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}

      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  brandheader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,

    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  productCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerActionButton: {
    padding: 8,
    marginLeft: 8,
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  filterIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    position: 'relative',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  filterBadge: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: '#FF6347',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedDropdownItem: {
    backgroundColor: '#f0f8ff',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDropdownItemText: {
    color: '#FF6347',
    fontWeight: '600',
  },
  listContainer: {
    padding: 4,
  },
  productsList: {
    paddingHorizontal: 4,
    paddingBottom: 16,
    paddingTop: 8,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  productCard: {
     backgroundColor: "#fff",
    padding: 6,
    borderRadius: 12,
    width: 165,
    marginRight: 8,
    marginLeft: 8,
    overeflow: "hidden",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.9,
    shadowRadius: 2,
    elevation: 5,
    marginBottom: 20,
    height: 240
  },
  imageContainer: {
    position: "relative",
    height: 140,
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
 
  newBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#ff4757",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
  },
  newBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ff6b35",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 2,
  },
  discountText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  wishlistButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "white",
    padding: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  productInfo: {
    padding: 12,
    paddingBottom: 8,
  },
  productName: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
    lineHeight: 18,
    marginBottom: 6,
    minHeight: 36,
  },
  priceContainer: {
    flexDirection: "column",
    gap: 2,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 14,
    color: "#2d3436",
    fontWeight: "bold",
  },
  oldPrice: {
    fontSize: 10,
    color: "#636e72",
    textDecorationLine: "line-through",
  },
   addToCartButton: {
    position: "absolute",
    bottom: 2,
    right: 8,
    backgroundColor: "#E63946",
    padding: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  addToCartButtonDisabled: {
    backgroundColor: "#7dd3c0", // Lighter shade when disabled
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  clearFiltersButton: {
    backgroundColor: '#FF6347',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearFiltersButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  priceSeparator: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginHorizontal: 16,
  },
  filterChip: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterChipSelected: {
    backgroundColor: '#FF6347',
    borderColor: '#FF6347',
  },
  filterChipText: {
    fontSize: 14,
    color: '#333',
  },
  filterChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
  },
  clearButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  applyButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default BrandScreen;