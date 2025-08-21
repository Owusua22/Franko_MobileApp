import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Modal,
  Share,
  Alert,
  ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsByShowroom } from "../redux/slice/productSlice";
import { fetchShowrooms } from "../redux/slice/showroomSlice";
import { addToCart } from "../redux/slice/cartSlice";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;

const ShowroomScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute(); 
  const { showRoomID, showRoomName, showRoomLogo } = route.params || {};

  const { productsByShowroom = {}, loading: productsLoading } = useSelector(
    (state) => state.products
  );
  const { showrooms = [] } = useSelector((state) => state.showrooms);
  const cartId = useSelector((state) => state.cart.cartId);

  // State for filters and modals
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sellersModalVisible, setSellersModalVisible] = useState(false);
  const [brandsModalVisible, setBrandsModalVisible] = useState(false);
  const [categoriesModalVisible, setCategoriesModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  
  // Filter states
  const [selectedSort, setSelectedSort] = useState("newest");
  const [selectedSellers, setSelectedSellers] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200000 });

  // Add to cart loading state for individual products
  const [addingToCart, setAddingToCart] = useState({});

  // Scroll position restoration states
  const [currentScrollOffset, setCurrentScrollOffset] = useState(0);
  const [shouldRestoreScroll, setShouldRestoreScroll] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (showRoomID) {
      dispatch(fetchProductsByShowroom(showRoomID));
    }
    // Also fetch showrooms to get the showroom name
    dispatch(fetchShowrooms());
  }, [dispatch, showRoomID]);

  // Check if we should restore scroll position when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const checkScrollRestore = async () => {
        try {
          const savedScrollPosition = await AsyncStorage.getItem(`showroomScrollPosition-${showRoomID}`);
          if (savedScrollPosition) {
            setCurrentScrollOffset(parseFloat(savedScrollPosition));
            setShouldRestoreScroll(true);
          }
        } catch (error) {
          console.log("Error checking scroll position:", error);
        }
      };

      checkScrollRestore();
      
      return () => {
        // Cleanup when leaving the screen
        setShouldRestoreScroll(false);
      };
    }, [showRoomID])
  );

  // Restore scroll position after products are loaded
  useEffect(() => {
    if (shouldRestoreScroll && filteredProducts.length > 0) {
      setTimeout(() => {
        restoreScrollPosition();
      }, 300);
    }
  }, [filteredProducts, shouldRestoreScroll]);

  // Add import for fetchShowrooms
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

  // Find the selected showroom from showrooms array
  const selectedShowroom = showrooms.find((showroom) => showroom.showRoomID === showRoomID);
  const displayShowroomName = selectedShowroom?.showRoomName || showRoomName || "Showroom";

  // Track scroll position continuously
  const handleScroll = (event) => {
    const offset = event.nativeEvent.contentOffset.y;
    setCurrentScrollOffset(offset);
  };

  // Get unique sellers, brands, and categories from products
  const { uniqueSellers, uniqueBrands, uniqueCategories } = useMemo(() => {
    const products = productsByShowroom[showRoomID] || [];
    const sellers = [...new Set(products.map(p => p.sellerName).filter(Boolean))];
    const brands = [...new Set(products.map(p => p.brandName).filter(Boolean))];
    const categories = [...new Set(products.map(p => p.categoryName).filter(Boolean))];
    return { uniqueSellers: sellers, uniqueBrands: brands, uniqueCategories: categories };
  }, [productsByShowroom, showRoomID]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let products = productsByShowroom[showRoomID] || [];

    // Apply seller filter
    if (selectedSellers.length > 0) {
      products = products.filter(p => selectedSellers.includes(p.sellerName));
    }

    // Apply brand filter
    if (selectedBrands.length > 0) {
      products = products.filter(p => selectedBrands.includes(p.brandName));
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      products = products.filter(p => selectedCategories.includes(p.categoryName));
    }

    // Apply price range filter
    products = products.filter(p => 
      p.price >= priceRange.min && p.price <= priceRange.max
    );

    // Apply sorting
    switch (selectedSort) {
      case "newest":
        return products.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
      case "oldest":
        return products.sort((a, b) => new Date(a.dateCreated) - new Date(b.dateCreated));
      case "price_low":
        return products.sort((a, b) => a.price - b.price);
      case "price_high":
        return products.sort((a, b) => b.price - a.price);
      case "name_az":
        return products.sort((a, b) => a.productName.localeCompare(b.productName));
      case "name_za":
        return products.sort((a, b) => b.productName.localeCompare(a.productName));
      default:
        return products;
    }
  }, [productsByShowroom, showRoomID, selectedSort, selectedSellers, selectedBrands, selectedCategories, priceRange]);

  const formatPrice = (amount) =>
    amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const getValidImageURL = (imagePath) => {
    if (!imagePath) {
      return "https://via.placeholder.com/150";
    }
    return `https://smfteapi.salesmate.app/Media/Products_Images/${imagePath
      .split("\\")
      .pop()}`;
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
  const handleProductPress = async (productId) => {
    try {
      // Save current scroll position before navigating
      if (flatListRef.current) {
        await AsyncStorage.setItem(`showroomScrollPosition-${showRoomID}`, currentScrollOffset.toString());
      }
    } catch (error) {
      console.log("Error saving scroll position:", error);
    }
    
    navigation.navigate("ProductDetails", { productId });
  };

  // Share functionality
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out amazing products from ${displayShowroomName} showroom!`,
        url: 'https://your-app-link.com/showroom', // Replace with your actual app link
        title: `${displayShowroomName} Products`,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share at this time');
    }
  };

  // Sort options
  const sortOptions = [
    { key: "newest", label: "Newest First" },
    { key: "oldest", label: "Oldest First" },
    { key: "price_low", label: "Price: Low to High" },
    { key: "price_high", label: "Price: High to Low" },
    { key: "name_az", label: "Name: A to Z" },
    { key: "name_za", label: "Name: Z to A" },
  ];

  // Toggle selection helpers
  const toggleSeller = (seller) => {
    setSelectedSellers(prev => 
      prev.includes(seller) 
        ? prev.filter(s => s !== seller)
        : [...prev, seller]
    );
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedSort("newest");
    setSelectedSellers([]);
    setSelectedBrands([]);
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: 200000 });
  };

  if (productsLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  const renderItem = ({ item, index }) => {
    const productImageURL = getValidImageURL(item.productImage);
    const discount =
      item.oldPrice > 0
        ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)
        : 0;

    const isNew = index < 3;
    const isAddingThisItem = addingToCart[item.productID];

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item.productID)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: productImageURL }} style={styles.productImage} />
          
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

          <TouchableOpacity style={styles.wishlistButton}>
            <AntDesign name="hearto" size={16} color="#666" />
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
            e.stopPropagation(); // Prevent navigation when clicking cart button
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

  const renderModal = (visible, setVisible, title, children) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <AntDesign name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{displayShowroomName}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionButton} onPress={handleShare}>
            <AntDesign name="sharealt" size={20} color="black" />
          </TouchableOpacity>
          {showRoomLogo && (
            <Image source={{ uri: showRoomLogo }} style={styles.showroomLogo} />
          )}
        </View>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setSortModalVisible(true)}
        >
          <Text style={styles.filterText}>Sort</Text>
          <AntDesign name="down" size={12} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setBrandsModalVisible(true)}
        >
          <Text style={styles.filterText}>Brands</Text>
          <AntDesign name="down" size={12} color="#666" />
          {selectedBrands.length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{selectedBrands.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setCategoriesModalVisible(true)}
        >
          <Text style={styles.filterText}>Categories</Text>
          <AntDesign name="down" size={12} color="#666" />
          {selectedCategories.length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{selectedCategories.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.filterButtonPrimary}
          onPress={() => setFilterModalVisible(true)}
        >
          <AntDesign name="filter" size={14} color="white" />
          <Text style={styles.filterTextPrimary}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Active Filters Display */}
      {(selectedSellers.length > 0 || selectedBrands.length > 0 || selectedCategories.length > 0) && (
        <View style={styles.activeFiltersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedSellers.map(seller => (
              <TouchableOpacity 
                key={seller}
                style={styles.activeFilterTag}
                onPress={() => toggleSeller(seller)}
              >
                <Text style={styles.activeFilterText}>Seller: {seller}</Text>
                <AntDesign name="close" size={12} color="#666" />
              </TouchableOpacity>
            ))}
            {selectedBrands.map(brand => (
              <TouchableOpacity 
                key={brand}
                style={styles.activeFilterTag}
                onPress={() => toggleBrand(brand)}
              >
                <Text style={styles.activeFilterText}>Brand: {brand}</Text>
                <AntDesign name="close" size={12} color="#666" />
              </TouchableOpacity>
            ))}
            {selectedCategories.map(category => (
              <TouchableOpacity 
                key={category}
                style={styles.activeFilterTag}
                onPress={() => toggleCategory(category)}
              >
                <Text style={styles.activeFilterText}>Category: {category}</Text>
                <AntDesign name="close" size={12} color="#666" />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={clearAllFilters} style={styles.clearAllButton}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Product Grid */}
      <FlatList
        ref={flatListRef}
        data={filteredProducts}
        keyExtractor={(item) => item.productID.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        renderItem={renderItem}
        onScroll={handleScroll}
        scrollEventThrottle={100}
        removeClippedSubviews={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
      />

      {/* Sort Modal */}
      {renderModal(sortModalVisible, setSortModalVisible, "Sort By", (
        <>
          {sortOptions.map(option => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.modalOption,
                selectedSort === option.key && styles.modalOptionSelected
              ]}
              onPress={() => {
                setSelectedSort(option.key);
                setSortModalVisible(false);
              }}
            >
              <Text style={[
                styles.modalOptionText,
                selectedSort === option.key && styles.modalOptionTextSelected
              ]}>
                {option.label}
              </Text>
              {selectedSort === option.key && (
                <AntDesign name="check" size={16} color="#16A34A" />
              )}
            </TouchableOpacity>
          ))}
        </>
      ))}

      {/* Sellers Modal */}
      {renderModal(sellersModalVisible, setSellersModalVisible, "Filter by Sellers", (
        <>
          {uniqueSellers.map(seller => (
            <TouchableOpacity
              key={seller}
              style={styles.modalOption}
              onPress={() => toggleSeller(seller)}
            >
              <Text style={styles.modalOptionText}>{seller}</Text>
              {selectedSellers.includes(seller) && (
                <AntDesign name="check" size={16} color="#16A34A" />
              )}
            </TouchableOpacity>
          ))}
        </>
      ))}

      {/* Brands Modal */}
      {renderModal(brandsModalVisible, setBrandsModalVisible, "Filter by Brands", (
        <>
          {uniqueBrands.map(brand => (
            <TouchableOpacity
              key={brand}
              style={styles.modalOption}
              onPress={() => toggleBrand(brand)}
            >
              <Text style={styles.modalOptionText}>{brand}</Text>
              {selectedBrands.includes(brand) && (
                <AntDesign name="check" size={16} color="#16A34A" />
              )}
            </TouchableOpacity>
          ))}
        </>
      ))}

      {/* Categories Modal */}
      {renderModal(categoriesModalVisible, setCategoriesModalVisible, "Filter by Categories", (
        <>
          {uniqueCategories.map(category => (
            <TouchableOpacity
              key={category}
              style={styles.modalOption}
              onPress={() => toggleCategory(category)}
            >
              <Text style={styles.modalOptionText}>{category}</Text>
              {selectedCategories.includes(category) && (
                <AntDesign name="check" size={16} color="#16A34A" />
              )}
            </TouchableOpacity>
          ))}
        </>
      ))}

      {/* Filter Modal */}
      {renderModal(filterModalVisible, setFilterModalVisible, "Advanced Filters", (
        <View>
          <Text style={styles.filterSectionTitle}>Price Range</Text>
          <View style={styles.priceRangeContainer}>
            <Text style={styles.priceRangeText}>
              ₵{formatPrice(priceRange.min)} - ₵{formatPrice(priceRange.max)}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.clearFiltersButton}
            onPress={clearAllFilters}
          >
            <Text style={styles.clearFiltersText}>Clear All Filters</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingTop: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    padding: 4,
    
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",

    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerActionButton: {
    padding: 4,
  },
  showroomLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    gap: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    position: "relative",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
  },
  filterBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#16A34A",
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  filterButtonPrimary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16A34A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    marginLeft: "auto",
  },
  filterTextPrimary: {
    fontSize: 12,
    color: "white",
    fontWeight: "500",
  },
  activeFiltersContainer: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
    alignItems: "center",
  },
  activeFilterTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    gap: 4,
  },
  activeFilterText: {
    fontSize: 12,
    color: "#666",
  },
  clearAllButton: {
    marginLeft: "auto",
  },
  clearAllText: {
    fontSize: 12,
    color: "#16A34A",
    fontWeight: "500",
  },
  resultsContainer: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  resultsText: {
    fontSize: 12,
    color: "#666",
  },
  listContainer: {
    padding: 8,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  productCard: {
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 12,
    width: 170,
    marginRight: 8,
    marginLeft: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.9,
    shadowRadius: 2,
    elevation: 5,
    marginBottom: 20,
    height: 240,
  },
  imageContainer: {
    position: "relative",
    height: 120,
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
    backgroundColor: "#FF0000",
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
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
    lineHeight: 16,
    marginBottom: 6,
    minHeight: 32,
  },
  priceContainer: {
    flexDirection: "column",
    gap: 2,
    marginBottom: 2,
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
    bottom: 8,
    right: 4,
    backgroundColor: "#16A34A",
    padding: 4,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  addToCartButtonDisabled: {
    backgroundColor: "#7dd3c0",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalBody: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalOptionSelected: {
    backgroundColor: "#f8f9ff",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
  },
  modalOptionTextSelected: {
    color: "#16A34A",
    fontWeight: "500",
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    padding: 16,
    paddingBottom: 8,
  },
  priceRangeContainer: {
    padding: 16,
    paddingTop: 0,
  },
  priceRangeText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
  },
  clearFiltersButton: {
    margin: 16,
    backgroundColor: "#ff4757",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  clearFiltersText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ShowroomScreen;