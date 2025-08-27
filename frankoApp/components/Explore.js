import React, { useEffect, useState, useRef } from "react";
import {View, Text,TouchableOpacity,
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
const DEALS_SHOWROOM_ID = "910812e9-cd1e-449a-a5bb-b74b29836569";
const CARD_MARGIN = 8;
const CARD_WIDTH = 170;

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(amount);

// Loading Card Component
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

// Product Card Component
const ProductCard = ({ product, onPress, onAddToCart, isAddingToCart, index }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const discount = product.oldPrice > 0 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const isBestSeller = index < 3; // First 3 items are "best sellers"
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
              <ActivityIndicator size="large" color="#10B981" />
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
          
          {isBestSeller && (
            <View style={styles.bestSellerBadge}>
              <Text style={styles.bestSellerText}>NEW</Text>
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
              color={isInWishlist ? "#EF4444" : "#6B7280"}
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

const Explore = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { productsByShowroom, loading } = useSelector((state) => state.products);
  const cartId = useSelector((state) => state.cart.cartId);
  const [addingToCart, setAddingToCart] = useState({});
  const containerRef = useRef(null);

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
        {/* Modern E-commerce Header */}
        <View style={styles.showroomHeader}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
             <View style={styles.iconContainer}>
                <View style={styles.iconGlow} />
                <View style={styles.iconInner}>
                  <Icon name="fire" size={22} color="#fff" />
                </View>
              </View>
              <View style={styles.headerTextContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.showroomTitle}>Explore</Text>
                    
                  <View style={styles.hotBadge}>
                    <Text style={styles.hotBadgeText}>HOT</Text>

                  </View>
                   
                  
                </View>
                <Text style={styles.showroomSubtitle}>⚡ Popular now </Text>
              
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.viewMoreButton}
              onPress={() => navigation.navigate("showroom", { showRoomID: DEALS_SHOWROOM_ID })}
              activeOpacity={0.7}
            >
              <Text style={styles.viewMoreText}>View All</Text>
              <View style={styles.arrowContainer}>
                <Icon name="chevron-right" size={14} color="#10B981" />
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Animated Background Elements */}
          <View style={styles.backgroundPattern}>
            <View style={[styles.floatingDot, styles.dot1]} />
            <View style={[styles.floatingDot, styles.dot2]} />
            <View style={[styles.floatingDot, styles.dot3]} />
          </View>
        </View>

        {/* Product List */}
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
          
          {/* View More Card */}
          {shouldShowViewMore() && (
            <TouchableOpacity 
              style={styles.viewAllCard} 
              onPress={() => navigation.navigate("showroom", { showRoomID: DEALS_SHOWROOM_ID })}
            >
              <View style={styles.viewAllContent}>
                <Icon name="trending-up" size={32} color="#10B981" />
                <Text style={styles.viewAllText}>View More</Text>
                <Text style={styles.viewMoreSubtext}>
                  {products.length - 10}+ more products
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,

    marginVertical: 8,
  },
  
  showroomHeader: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    position: "relative",
    overflow: "hidden",
  },

  // Background Pattern
  backgroundPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },

  floatingDot: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#10B981",
    opacity: 0.1,
  },

  dot1: {
    top: 15,
    right: 80,
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  dot2: {
    top: 35,
    right: 60,
    opacity: 0.08,
  },

  dot3: {
    top: 25,
    right: 100,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.06,
  },

  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1,
    position: "relative",
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
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    position: "relative",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  iconGlow: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#10B981",
    opacity: 0.2,
  },
  
  headerTextContainer: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  
  showroomTitle: { 
    color: "#111827", 
    fontWeight: "800", 
    fontSize: 22,
    letterSpacing: -0.5,
    marginRight: 8,
  },

  hotBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    transform: [{ rotate: '-2deg' }],
  },

  hotBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  
  showroomSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#BBF7D0",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  viewMoreText: { 
    color: "#059669", 
    fontSize: 12, 
    fontWeight: "700",
    letterSpacing: 0.3,
    marginRight: 4,
  },

  arrowContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  
  productList: { 
  
    paddingRight: 10,
    paddingVertical: 20,
  },
  
  // Product Card Styles (maintaining original design)
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
  
  bestSellerBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#E63946",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
  },
  
  bestSellerText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 3,
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
    backgroundColor: "#10B981",
    padding: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  
  addToCartButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },

  // Loading Card Styles (matching original)
  loadingCard: {
    width: CARD_WIDTH,
    marginRight: CARD_MARGIN,
    backgroundColor: "#fff",
    borderRadius: 12,
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

  // View More Card (matching original style)
  viewAllCard: {
    width: CARD_WIDTH,
    height: 240,
    marginRight: CARD_MARGIN,
    marginLeft: 10,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#BBF7D0',
    borderStyle: 'dashed',
  },
  
  viewAllContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  
  viewAllText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  
  viewMoreSubtext: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default Explore;