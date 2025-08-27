import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { fetchProductByShowroomAndRecord } from "../redux/slice/productSlice";
import { addToCart } from "../redux/slice/cartSlice";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { AntDesign } from "@expo/vector-icons";
import frankoLogo from "../assets/frankoIcon.png";
import { addToWishlist } from "../redux/wishlistSlice";

const screenWidth = Dimensions.get("window").width;
const DEALS_SHOWROOM_ID = "1e93aeb7-bba7-4bd4-b017-ea3267047d46";
const CARD_MARGIN = 8;
const CARD_WIDTH = 170;

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(amount);

// Timer Component
const WeeklyTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Calculate days until next Sunday (end of week)
      const daysUntilSunday = currentDay === 0 ? 7 : 7 - currentDay;
      
      // Create next Sunday at 23:59:59
      const nextSunday = new Date(now);
      nextSunday.setDate(now.getDate() + daysUntilSunday);
      nextSunday.setHours(23, 59, 59, 999);
      
      const difference = nextSunday.getTime() - now.getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeUnit = ({ value, label }) => (
    <View style={styles.timeUnit}>
      <View style={styles.timeValueContainer}>
        <Text style={styles.timeValue}>{value.toString().padStart(2, '0')}</Text>
      </View>
      <Text style={styles.timeLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.timerContainer}>
      <TimeUnit value={timeLeft.days} label="Days" />
      <Text style={styles.timeSeparator}>:</Text>
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <Text style={styles.timeSeparator}>:</Text>
      <TimeUnit value={timeLeft.minutes} label="Min" />
      <Text style={styles.timeSeparator}>:</Text>
      <TimeUnit value={timeLeft.seconds} label="Sec" />
    </View>
  );
};

// Loading Card Component (matches PhonesComponent style exactly)
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

// Product Card Component (exact match with PhonesComponent)
// Product Card Component (exact match with PhonesComponent)
const ProductCard = ({ product, onPress, onAddToCart, isAddingToCart, index }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const discount = product.oldPrice > 0 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const isHotDeal = index < 3; // First 3 items are "hot deals"
  const isInWishlist = wishlistItems.some((item) => item.productID === product.productID);

  const handleWishlistPress = () => {
    if (isInWishlist) {
      Alert.alert("Info", `${product.productName} is already in your wishlist.`);
    } else {
      dispatch(addToWishlist(product));
      Alert.alert("Success", `${product.productName} added to wishlist! ❤️`);
    }
  };

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
              <ActivityIndicator size="large" color="#E63946" />
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
          
          {isHotDeal && (
            <View style={styles.hotDealBadge}>
              <Text style={styles.hotDealText}>🔥 HOT</Text>
            </View>
          )}
          
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>SALE</Text>
            </View>
          )}

          {/* Wishlist Button */}
          <TouchableOpacity style={styles.wishlistButton} onPress={handleWishlistPress}>
            <AntDesign
              name={isInWishlist ? "heart" : "hearto"}
              size={18}
              color={isInWishlist ? "red" : "#666"}
            />
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


const Deals = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { productsByShowroom, loading } = useSelector((state) => state.products);
  const cartId = useSelector((state) => state.cart.cartId);
  const [addingToCart, setAddingToCart] = useState({});
  const containerRef = useRef(null);

  const products = productsByShowroom?.[DEALS_SHOWROOM_ID] || [];

  useEffect(() => {
    if (!products || products.length === 0) {
      // Only fetch if not already cached
      dispatch(
        fetchProductByShowroomAndRecord({
          showRoomCode: DEALS_SHOWROOM_ID,
          recordNumber: 10,
        })
      );
    }
  }, [dispatch, products]);

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

  const renderProducts = () => {
    if (loading && products.length === 0) {
      return Array(6).fill().map((_, idx) => <LoadingCard key={idx} />);
    }

    if (products.length === 0) {
      return Array(6).fill().map((_, idx) => <LoadingCard key={idx} />);
    }

    return products.slice(0, 10).map((product, index) => (
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
    return products.length > 10;
  };

  return (
    <View style={styles.container}>
      <View style={styles.showroomContainer}>
        {/* Enhanced Showroom Header with Gradient and Timer */}
        <View style={styles.showroomHeader}>
          {/* Background Gradient Effect */}
          <View style={styles.gradientOverlay} />
          
          {/* Floating Decoration Elements */}
          <View style={styles.floatingElement1}>
            <Text style={styles.floatingEmoji}>✨</Text>
          </View>
          <View style={styles.floatingElement2}>
            <Text style={styles.floatingEmoji}>💫</Text>
          </View>
          <View style={styles.floatingElement3}>
            <Text style={styles.floatingEmoji}>🎯</Text>
          </View>

          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <View style={styles.iconContainer}>
                  <Text style={styles.fireIcon}>🔥</Text>
                  <View style={styles.pulseRing} />
                </View>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.showroomTitle}>Deals of the Week</Text>
                  <Text style={styles.showroomSubtitle}>⚡ Limited Time Offers</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.viewMoreButton}
                onPress={() => navigation.navigate("showroom", { showRoomID: DEALS_SHOWROOM_ID })}
                activeOpacity={0.8}
              >
                <Text style={styles.viewMoreText}>View All</Text>
                <Icon name="arrow-right" size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Timer Section */}
            <View style={styles.timerSection}>
              <View style={styles.timerHeader}>
                <Text style={styles.timerLabel}>🕒 Deals End In:</Text>
              </View>
              <WeeklyTimer />
            </View>
          </View>
        </View>

        {/* Enhanced Product List */}
        <ScrollView
          horizontal
          ref={containerRef}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productList}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + CARD_MARGIN}
          snapToAlignment="start"
        >
          {renderProducts()}
          
          {/* View More Card - Only show if there are more than 10 products */}
          {shouldShowViewMore() && (
            <TouchableOpacity 
              style={styles.viewAllCard} 
              onPress={() => navigation.navigate("showroom", { showRoomID: DEALS_SHOWROOM_ID })}
            >
              <View style={styles.viewAllContent}>
                <Text style={styles.fireIconLarge}>🔥</Text>
                <Text style={styles.viewAllText}>More Deals</Text>
                <Text style={styles.viewMoreSubtext}>
                  {products.length - 10}+ more deals
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  
  showroomContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  
  showroomHeader: {
    position: "relative",
    backgroundColor: "#E63946",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 90,
  },

  // Enhanced Background with Gradient Effect
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    background: "linear-gradient(135deg, #E63946 0%, #DC2626 50%, #B91C1C 100%)",
    opacity: 0.9,
  },

  // Floating Animation Elements
  floatingElement1: {
    position: "absolute",
    top: 8,
    right: 20,
    opacity: 0.6,
  },
  
  floatingElement2: {
    position: "absolute",
    top: 20,
    right: 50,
    opacity: 0.4,
  },
  
  floatingElement3: {
    position: "absolute",
    top: 12,
    left: 20,
    opacity: 0.5,
  },

  floatingEmoji: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },

  headerContent: {
    position: "relative",
    zIndex: 2,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    position: "relative",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  // Pulse Ring Animation Effect
  pulseRing: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "transparent",
  },

  fireIcon: {
    fontSize: 20,
    zIndex: 1,
  },

  fireIconLarge: {
    fontSize: 32,
  },
  
  headerTextContainer: {
    flex: 1,
  },
  
  showroomTitle: { 
    color: "#fff", 
    fontWeight: "800", 
    fontSize: 24,
    letterSpacing: 0.6,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  showroomSubtitle: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  viewMoreText: { 
    color: "#fff", 
    fontSize: 11, 
    fontWeight: "700",
    marginRight: 4,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  // Timer Styles
  timerSection: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  timerHeader: {
    alignItems: "center",
    marginBottom: 6,
  },

  timerLabel: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  timerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },

  timeUnit: {
    alignItems: "center",
    minWidth: 32,
  },

  timeValueContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  timeValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#E63946",
    textAlign: "center",
    letterSpacing: 0.5,
  },

  timeLabel: {
    fontSize: 8,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  timeSeparator: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "bold",
    marginTop: -8,
  },
  
  productList: { 

    paddingRight: 10,
    paddingVertical: 20,
  },
  
  // Product Card Styles (exact match with PhonesComponent)
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
  
  hotDealBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#ff4757",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
  },
  
  hotDealText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#E63946",
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
    backgroundColor: "#f8a5aa",
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
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FECACA',
    borderStyle: 'dashed',
  },
  
  viewAllContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  
  viewAllText: {
    color: '#E63946',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  
  viewMoreSubtext: {
    color: '#991B1B',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
});
export default Deals;