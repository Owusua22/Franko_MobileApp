import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { AntDesign } from "@expo/vector-icons";
import { fetchProductByShowroomAndRecord } from '../redux/slice/productSlice';
import { fetchHomePageShowrooms } from '../redux/slice/showroomSlice';
import { addToCart } from "../redux/slice/cartSlice";
import frankoLogo from "../assets/frankoIcon.png";

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = 170;
const CARD_MARGIN = 8;

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(amount);

// Loading Card Component (matches Deals style exactly)
const LoadingCard = () => (
  <View style={styles.loadingCard}>
    <View style={styles.loadingImage}>
      <Image source={frankoLogo} style={styles.frankoLogo} />
    </View>
    <View style={styles.loadingContent}>
      <View style={styles.loadingTitle} />
      <View style={styles.loadingPrice} />
    </View>
  </View>
);

// Product Card Component (exact match with Deals component)
const ProductCard = ({ product, onPress, onAddToCart, isAddingToCart, index }) => {
  const [imageLoading, setImageLoading] = useState(true);

  const discount = product.oldPrice > 0 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const isNew = index < 3;

  return (
    <View style={styles.productCard}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={styles.cardTouchable}
      >
        <View style={styles.imageContainer}>
          {imageLoading && (
            <View style={styles.imageLoadingContainer}>
              <ActivityIndicator size="large" color="#16A34A" />
            </View>
          )}
          
          <Image
            source={{
              uri: `https://smfteapi.salesmate.app/Media/Products_Images/${product.productImage
                .split("\\")
                .pop()}`,
            }}
            style={[styles.productImage, imageLoading && styles.hiddenImage]}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
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

          <TouchableOpacity style={styles.wishlistButton}>
            <AntDesign name="hearto" size={14} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.productName}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>
              {formatCurrency(product.price)}
            </Text>
            {product.oldPrice > 0 && (
              <Text style={styles.oldPrice}>
                {formatCurrency(product.oldPrice)}
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.addToCartButton,
            isAddingToCart && styles.addToCartButtonDisabled,
          ]}
          onPress={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <ActivityIndicator size={14} color="white" />
          ) : (
            <AntDesign name="shoppingcart" size={14} color="white" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

// Showroom Tab Component
const ShowroomTab = ({ showroom, isActive, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.tab,
        isActive ? styles.activeTab : styles.inactiveTab,
      ]}
      onPress={() => onPress(showroom.showRoomID)}
    >
      <Text
        style={[
          styles.tabText,
          isActive ? styles.activeTabText : styles.inactiveTabText,
        ]}
      >
        {showroom.showRoomName}
      </Text>
    </TouchableOpacity>
  );
};

// Enhanced Header Component
const EnhancedHeader = ({ onViewAll }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  return (
    <View style={styles.enhancedHeaderContainer}>
      <View style={styles.headerBackground}>
        <View style={styles.headerGradientOverlay} />
        
        {/* Decorative elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <View style={styles.titleWithIcon}>
                <Text style={styles.enhancedTitle}>Trending Products</Text>
                <Animated.View 
                  style={[
                    styles.trendingIconContainer,
                    { transform: [{ scale: pulseAnim }] }
                  ]}
                >
                  <Icon name="trending-up" size={18} color="#FFFFFF" />
                </Animated.View>
              </View>
              <View style={styles.fireIcon}>
                <Text style={styles.fireEmoji}>🔥</Text>
              </View>
            </View>
            
            <View style={styles.titleUnderlineContainer}>
              <View style={styles.titleUnderline} />
              <View style={styles.titleDot} />
            </View>
            

          </View>

          <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
            <Text style={styles.viewAllButtonText}>View All</Text>
            <Icon name="arrow-right" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Main BestSellers Component
const BestSellers = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const scrollRef = useRef(null);

  const [activeShowroom, setActiveShowroom] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});

  const { homePageShowrooms } = useSelector((state) => state.showrooms);
  const { productsByShowroom, loading } = useSelector((state) => state.products);
  const cartId = useSelector((state) => state.cart.cartId);

  useEffect(() => {
    dispatch(fetchHomePageShowrooms());
  }, [dispatch]);

  useEffect(() => {
    if (homePageShowrooms?.length > 0) {
      const first = homePageShowrooms[0];
      setActiveShowroom(first?.showRoomID);
      dispatch(
        fetchProductByShowroomAndRecord({
          showRoomCode: first?.showRoomID,
          recordNumber: 10,
        })
      );
    }
  }, [homePageShowrooms, dispatch]);

  const handleShowroomClick = (id) => {
    setActiveShowroom(id);
    dispatch(
      fetchProductByShowroomAndRecord({ showRoomCode: id, recordNumber: 10 })
    );
  };

  const handleAddToCart = (product) => {
    const cartData = {
      cartId,
      productId: product.productID,
      price: product.price,
      quantity: 1,
    };

    setAddingToCart((prev) => ({ ...prev, [product.productID]: true }));

    dispatch(addToCart(cartData))
      .then(() => {
        Alert.alert("Success", `${product.productName} added to cart successfully!`);
      })
      .catch((error) => {
        Alert.alert("Error", `Failed to add product to cart: ${error.message}`);
      })
      .finally(() => {
        setAddingToCart((prev) => {
          const newState = { ...prev };
          delete newState[product.productID];
          return newState;
        });
      });
  };

  const handleProductPress = (productId) => {
    navigation.navigate('ProductDetails', { productId });
  };

  const handleViewAll = () => {
    navigation.navigate("showroom", { showRoomID: activeShowroom });
  };

  const renderProducts = () => {
    if (loading) {
      return Array(6).fill().map((_, idx) => <LoadingCard key={idx} />);
    }

    const allProducts = productsByShowroom?.[activeShowroom] || [];
    // Get only the first 10 products
    const products = allProducts.slice(0, 10);
    
    return products.map((product, index) => (
      <ProductCard
        key={product.productID}
        product={product}
        index={index}
        onPress={() => handleProductPress(product.productID)}
        onAddToCart={handleAddToCart}
        isAddingToCart={addingToCart[product.productID]}
      />
    ));
  };

  const shouldShowViewMore = () => {
    if (loading) return false;
    const allProducts = productsByShowroom?.[activeShowroom] || [];
    return allProducts.length > 10;
  };

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <EnhancedHeader onViewAll={handleViewAll} />

      {/* Showroom Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {Array.isArray(homePageShowrooms) &&
          homePageShowrooms.map((showroom) => (
            <ShowroomTab
              key={showroom.showRoomID}
              showroom={showroom}
              isActive={activeShowroom === showroom.showRoomID}
              onPress={handleShowroomClick}
            />
          ))}
      </ScrollView>

      {/* Products */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_MARGIN}
        snapToAlignment="start"
      >
        {renderProducts()}
        
        {/* View More Card - Only show if there are more than 10 products */}
        {shouldShowViewMore() && (
          <TouchableOpacity style={styles.viewAllCard} onPress={handleViewAll}>
            <View style={styles.viewAllContent}>
              <Icon name="plus" size={24} color="#16A34A" />
              <Text style={styles.viewAllText}>View More</Text>
              <Text style={styles.viewMoreSubtext}>
                {(productsByShowroom?.[activeShowroom]?.length || 0) - 10}+ more items
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 2,
    backgroundColor: "#f8f9fa",



  },
  // Enhanced Header Styles
  enhancedHeaderContainer: {
    marginHorizontal: 10,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'relative',
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0, 
    bottom: 0,
    backgroundColor: '#16A34A ',
    borderRadius: 20,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -40, 
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 1,
  },
  titleSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  enhancedTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginRight: 12,
    letterSpacing: -0.5,
  },
  trendingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  fireIcon: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fireEmoji: {
    fontSize: 20,
  },
  titleUnderlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleUnderline: {
    width: 50,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    marginRight: 8,
  },
  titleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  enhancedSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    lineHeight: 20,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  viewAllButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabsContent: {
    paddingHorizontal: 20,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 25,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeTab: {
    backgroundColor: '#16A34A',
    borderColor: '#15803D',
  },
  inactiveTab: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  inactiveTabText: {
    color: '#6B7280',
  },
  scrollContainer: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  // Product Card Styles (exact match with Deals component)
  productCard: {
    backgroundColor: "#fff",
    padding: 2,
    borderRadius: 12,
    width: 170,
    marginRight: 6,
    marginLeft: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.9,
    shadowRadius: 2,
    elevation: 5,
    marginBottom: 20,
    height: 240
  },
  cardTouchable: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    height: 140,
  },
  imageLoadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    zIndex: 2,
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  hiddenImage: {
    opacity: 0,
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
    textTransform: "uppercase",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
     backgroundColor: "#ff4757",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 2,
  },
  discountText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  wishlistButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "white",
    padding: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
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
    marginBottom: 8,
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
    backgroundColor: "#16A34A",
    padding: 8,
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

  // Loading Card Styles
  loadingCard: {
    width: CARD_WIDTH,
    marginRight: CARD_MARGIN,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    height: 240,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    marginLeft: 10,
  },
  loadingImage: {
    height: 140,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  loadingContent: {
    padding: 12,
  },
  loadingTitle: {
    height: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    marginBottom: 8,
    position: "relative",
    overflow: "hidden",
  },
  loadingPrice: {
    height: 12,
    width: "60%",
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    position: "relative",
    overflow: "hidden",
  },
  frankoLogo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    opacity: 0.1,
    tintColor: "#bbb",
  },

  // View More Card
  viewAllCard: {
    width: CARD_WIDTH,
    height: 240,
    marginRight: CARD_MARGIN,
    marginLeft: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  viewAllContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  viewAllText: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  viewMoreSubtext: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default BestSellers;