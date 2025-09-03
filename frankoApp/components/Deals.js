import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  FlatList,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { fetchProductByShowroomAndRecord } from "../redux/slice/productSlice";
import { addToCart } from "../redux/slice/cartSlice";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ProductCard, LoadingCard} from "./ProductCard"; // Import the new component

const DEALS_SHOWROOM_ID = "1e93aeb7-bba7-4bd4-b017-ea3267047d46";
const CARD_MARGIN = 8;
const CARD_WIDTH = 170;

// Timer Component (unchanged)
const WeeklyTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentDay = now.getDay();
      const daysUntilSunday = currentDay === 0 ? 7 : 7 - currentDay;
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
        setTimeLeft({ days: 0, hours, minutes: 0, seconds: 0 });
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

// Optimized Deals Component
const Deals = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { productsByShowroom, loading } = useSelector((state) => state.products);
  const cartId = useSelector((state) => state.cart.cartId);
  const [addingToCart, setAddingToCart] = useState({});

  const products = productsByShowroom?.[DEALS_SHOWROOM_ID] || [];

  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(
        fetchProductByShowroomAndRecord({
          showRoomCode: DEALS_SHOWROOM_ID,
          recordNumber: 10,
        })
      );
    }
  }, [dispatch, products]);

  // Memoized callbacks for better performance
  const handleAddToCart = useCallback((product) => {
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
  }, [cartId, dispatch]);

  const handleProductPress = useCallback((productId) => {
    navigation.navigate('ProductDetails', { productId });
  }, [navigation]);

  const handleViewMore = useCallback(() => {
    navigation.navigate("showroom", { showRoomID: DEALS_SHOWROOM_ID });
  }, [navigation]);

  // Render item function for FlatList (memoized)
  const renderProduct = useCallback(({ item, index }) => {
    return (
      <ProductCard
        product={item}
        index={index}
        onPress={handleProductPress}
        onAddToCart={handleAddToCart}
        isAddingToCart={addingToCart[item.productID]}
        showHotDeal={true}
      />
    );
  }, [handleProductPress, handleAddToCart, addingToCart]);

  // Key extractor for FlatList
  const keyExtractor = useCallback((item) => item.productID, []);

  // Get item layout for better performance
  const getItemLayout = useCallback((data, index) => ({
    length: CARD_WIDTH + CARD_MARGIN,
    offset: (CARD_WIDTH + CARD_MARGIN) * index,
    index,
  }), []);

  const shouldShowViewMore = () => {
    if (loading) return false;
    return products.length > 10;
  };

  // Render loading cards
  const renderLoadingCards = () => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productList}
      >
        {Array(6).fill().map((_, idx) => (
          <LoadingCard key={`loading-${idx}`} />
        ))}
      </ScrollView>
    );
  };

  // Render main product list
  const renderMainProducts = () => {
    const displayProducts = products.slice(0, 10);

    return (
      <View>
        <FlatList
          data={displayProducts}
          renderItem={renderProduct}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productList}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + CARD_MARGIN}
          snapToAlignment="start"
          removeClippedSubviews={true}
          initialNumToRender={4}
          maxToRenderPerBatch={6}
          windowSize={10}
          updateCellsBatchingPeriod={50}
          ListFooterComponent={() => 
            shouldShowViewMore() ? (
              <TouchableOpacity 
                style={styles.viewAllCard} 
                onPress={handleViewMore}
              >
                <View style={styles.viewAllContent}>
                  <Text style={styles.fireIconLarge}>🔥</Text>
                  <Text style={styles.viewAllText}>More Deals</Text>
                  <Text style={styles.viewMoreSubtext}>
                    {products.length - 10}+ more deals
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null
          }
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.showroomContainer}>
        {/* Enhanced Showroom Header with Gradient and Timer */}
        <View style={styles.showroomHeader}>
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
                onPress={handleViewMore}
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

        {/* Enhanced Product List with Performance Optimization */}
        {(loading && products.length === 0) || products.length === 0
          ? renderLoadingCards()
          : renderMainProducts()
        }
      </View>
    </View>
  );
};

// Styles (same as original, but with additions for performance)
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
  },
  
  showroomHeader: {
    position: "relative",
    backgroundColor: "#E63946",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 90,
  },

  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    opacity: 0.9,
  },

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