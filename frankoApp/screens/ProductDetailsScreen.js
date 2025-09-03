import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Share,
  ActivityIndicator,
  Modal,
  Dimensions,
  Animated,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById, fetchProducts } from "../redux/slice/productSlice";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { addToCart } from "../redux/slice/cartSlice";
import { removeFromWishlist, addToWishlist } from "../redux/wishlistSlice";


const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Updated Color Palette matching the provided styles
const colors = {
  primary: {
    green: "#10B981",
    darkGreen: "#059669",
    lightGreen: "#BBF7D0",
    paleGreen: "#F0FDF4",
    gradient: ["#10B981", "#059669"],
  },
  secondary: {
    red: "#EF4444",
    darkRed: "#E63946",
    lightRed: "#FEE2E2",
    paleRed: "#FEF2F2",
    gradient: ["#EF4444", "#E63946"],
  },
  neutral: {
    white: "#FFFFFF",
    lightGray: "#F8FAFC",
    mediumGray: "#E5E7EB",
    gray: "#6B7280",
    darkGray: "#374151",
    charcoal: "#111827",
    black: "#000000",
    shadow: "rgba(0,0,0,0.1)",
  },
  accent: {
    gold: "#F59E0B",
    orange: "#EA580C",
    blue: "#3B82F6",
    purple: "#8B5CF6",
  },
  status: {
    outOfStock: "#9CA3AF",
    inStock: "#10B981",
    warning: "#F59E0B",
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(price);
};

const ProductDetailsScreen = () => {
  const route = useRoute();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { productId } = route.params;
  const currentProduct = useSelector((state) => state.products.currentProduct);
  const { loading } = useSelector((state) => state.products);
  const cartId = useSelector((state) => state.cart.cartId);
    const wishlistItems = useSelector((state) => state.wishlist.items);

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [favoriteAnimScale] = useState(new Animated.Value(1));

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchProductById(productId));
  }, [dispatch, productId]);

  useEffect(() => {
    if (currentProduct && currentProduct.length > 0) {
      storeProductInAsyncStorage(currentProduct[0]);
      // Animate content in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentProduct]);

  const storeProductInAsyncStorage = async (product) => {
    try {
      const storedProducts = await AsyncStorage.getItem("recentProducts");
      let productList = storedProducts ? JSON.parse(storedProducts) : [];

      productList = productList.filter((item) => item.productID !== product.productID);
      productList.unshift(product);

      if (productList.length > 12) {
        productList = productList.slice(0, 12);
      }

      await AsyncStorage.setItem("recentProducts", JSON.stringify(productList));
    } catch (error) {
      console.error("Error storing product:", error);
    }
  };

  // Check if product is out of stock
  const checkOutOfStock = (product) => {
    if (!product) return false;
    
    const brandName = product.brandName?.toLowerCase().trim();
    const showRoomName = product.showRoomName?.toLowerCase().trim();
    const categoryName = product.categoryName?.toLowerCase().trim();
    
    return (
      brandName === "allbrands" ||
      showRoomName === "products out of stock" ||
      categoryName === "products out of stock"
    );
  };

  const handleAddToCart = () => {
    if (!currentProduct || !currentProduct[0]) {
      Alert.alert("Error", "Product data not available");
      return;
    }

    if (checkOutOfStock(currentProduct[0])) {
      Alert.alert("Out of Stock", "This product is currently unavailable");
      return;
    }

    const cartData = {
      cartId,
      productId: currentProduct[0].productID,
      price: currentProduct[0].price,
      quantity,
    };

    setIsAddingToCart(true);

    dispatch(addToCart(cartData))
      .then(() => {
        Alert.alert("Success", "Product added to cart successfully!");
      })
      .catch((error) => {
        Alert.alert("Error", `Failed to add product to cart: ${error.message}`);
      })
      .finally(() => {
        setIsAddingToCart(false);
      });
  };

  const handleShare = async () => {
    try {
      if (!currentProduct || !currentProduct[0]) {
        Alert.alert("Error", "Product data not available");
        return;
      }
      
      const message = `Check out this product: ${currentProduct[0].productName}\nPrice: ${formatPrice(currentProduct[0].price)}`;
      await Share.share({ message });
    } catch (error) {
      Alert.alert("Error", "Failed to share product.");
    }
  };

// Check if product is in wishlist
  const isInWishlist = useMemo(() => {
    if (!currentProduct || !currentProduct[0]) return false;
    return wishlistItems.some((item) => item.productID === currentProduct[0].productID);
  }, [wishlistItems, currentProduct]);

  // Handle wishlist toggle
  const handleToggleWishlist = () => {
    if (!currentProduct || !currentProduct[0]) {
      Alert.alert("Error", "Product data not available");
      return;
    }

    const product = currentProduct[0];

    // Animate favorite button
    Animated.sequence([
      Animated.timing(favoriteAnimScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(favoriteAnimScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    if (isInWishlist) {
      dispatch(removeFromWishlist(product.productID));
      Alert.alert("Removed", `${product.productName} removed from wishlist.`);
    } else {
      dispatch(addToWishlist(product));
      Alert.alert("Added", `${product.productName} added to wishlist ❤️`);
    }
  };

  if (loading || !currentProduct || currentProduct.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <View style={styles.loaderContent}>
          <View style={styles.loaderIcon}>
            <ActivityIndicator size="large" color={colors.primary.green} />
          </View>
          <Text style={styles.loadingText}>Loading product details...</Text>
          <Text style={styles.loadingSubtext}>Please wait a moment</Text>
        </View>
      </View>
    );
  }

  const product = currentProduct[0];
  const imageUrl = product?.productImage 
    ? `https://smfteapi.salesmate.app/Media/Products_Images/${product.productImage.split("\\").pop()}`
    : null;
  
  // Calculate savings
  const discountPercentage = product?.oldPrice 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  
  const savingsAmount = product?.oldPrice ? product.oldPrice - product.price : 0;
  
  // Check stock status
  const isOutOfStock = checkOutOfStock(product);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.neutral.charcoal} />
        </TouchableOpacity>
      
        <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
          <Icon name="share" size={20} color={colors.neutral.charcoal} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.animatedContent, 
            { 
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {/* Image Section */}
          <View style={styles.imageSection}>
            <TouchableOpacity onPress={() => setIsImageModalVisible(true)} style={styles.imageContainer}>
              {imageUrl && (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: imageUrl }} style={styles.productImage} />
                </View>
              )}
              
              {/* Stock Status Banner */}
              {isOutOfStock ? (
                <View style={styles.outOfStockBanner}>
                  <View style={styles.bannerContent}>
                    <Icon name="block" size={14} color={colors.neutral.white} />
                    <Text style={styles.bannerText}>OUT OF STOCK</Text>
                  </View>
                </View>
              ) : discountPercentage > 0 ? (
                <View style={styles.discountBanner}>
                  <View style={styles.bannerContent}>
                    <Icon name="local-offer" size={14} color={colors.neutral.white} />
                    <Text style={styles.bannerText}>SAVE {discountPercentage}%</Text>
                  </View>
                </View>
              ) : null}
              
              {/* Favorite Button */}
             <Animated.View
                style={[
                  styles.favoriteButton,
                  { transform: [{ scale: favoriteAnimScale }] }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.favoriteButtonInner,
                    isInWishlist && styles.favoriteActive
                  ]}
                  onPress={handleToggleWishlist}
                >
                  <Icon
                    name={isInWishlist ? "favorite" : "favorite-border"}
                    size={20}
                    color={isInWishlist ? colors.secondary.red : colors.neutral.gray}
                  />
                </TouchableOpacity>
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Product Info Section */}
          <View style={styles.productInfoSection}>
            {/* Product Name */}
            <View style={styles.productNameCard}>
              <Text style={styles.productName}>{product?.productName || "Product Name"}</Text>
            </View>
            
            {/* Price Section */}
            <View style={styles.priceCard}>
              <View style={styles.priceContainer}>
                <Text style={[
                  styles.currentPrice,
                  isOutOfStock && styles.priceDisabled
                ]}>
                  {product?.price ? formatPrice(product.price) : "Price not available"}
                </Text>
                
                {product?.oldPrice && !isOutOfStock && (
                  <View style={styles.oldPriceContainer}>
                    <Text style={styles.oldPrice}>{formatPrice(product.oldPrice)}</Text>
                  </View>
                )}
              </View>
              
              {/* Savings Display */}
              {savingsAmount > 0 && !isOutOfStock && (
                <View style={styles.savingsContainer}>
                  <View style={styles.savingsBadge}>
                    <Icon name="trending-down" size={14} color={colors.secondary.red} />
                    <Text style={styles.savingsText}>
                      You save {formatPrice(savingsAmount)} ({discountPercentage}% off)
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Status Section */}
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Icon 
                  name={isOutOfStock ? "inventory" : "verified"} 
                  size={20} 
                  color={isOutOfStock ? colors.status.outOfStock : colors.status.inStock} 
                />
                <Text style={styles.statusHeaderText}>Availability</Text>
              </View>
              
              <View style={[
                styles.statusContent,
                isOutOfStock ? styles.statusContentOutOfStock : styles.statusContentInStock
              ]}>
                <View style={styles.statusItem}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: isOutOfStock ? colors.status.outOfStock : colors.status.inStock }
                  ]} />
                  <View style={styles.statusTextContainer}>
                    <Text style={styles.statusTitle}>
                      {isOutOfStock ? "Out of Stock" : "In Stock"}
                    </Text>
                    <Text style={styles.statusSubtitle}>
                      {isOutOfStock ? "Currently unavailable" : "Ready to ship within 2-3 days"}
                    </Text>
                  </View>
                  <Icon 
                    name={isOutOfStock ? "error" : "check-circle"} 
                    size={20} 
                    color={isOutOfStock ? colors.status.outOfStock : colors.status.inStock} 
                  />
                </View>
              </View>
            </View>

            {/* Features Section */}
            <View style={styles.featuresSection}>
              <View style={styles.sectionHeader}>
                <Icon name="star" size={20} color={colors.accent.gold} />
                <Text style={styles.sectionTitle}>Why Choose This Product</Text>
              </View>
              
              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Icon name="verified-user" size={20} color={colors.primary.green} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Quality Guaranteed</Text>
                  <Text style={styles.featureSubtitle}>100% authentic products with warranty</Text>
                </View>
                <Icon name="arrow-forward-ios" size={14} color={colors.neutral.gray} />
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Icon name="local-shipping" size={20} color={colors.primary.green} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Fast Delivery</Text>
                  <Text style={styles.featureSubtitle}>Same day delivery in Accra & Kumasi</Text>
                </View>
                <Icon name="arrow-forward-ios" size={14} color={colors.neutral.gray} />
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Icon name="security" size={20} color={colors.primary.green} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Secure Payment</Text>
                  <Text style={styles.featureSubtitle}>Multiple payment options available</Text>
                </View>
                <Icon name="arrow-forward-ios" size={14} color={colors.neutral.gray} />
              </View>
            </View>

            {/* Description Section */}
            <View style={styles.descriptionSection}>
              <View style={styles.sectionHeader}>
                <Icon name="description" size={20} color={colors.primary.green} />
                <Text style={styles.sectionTitle}>Product Description</Text>
              </View>
              <View style={styles.descriptionCard}>
                <Text style={styles.descriptionText}>
                  {product?.description ||
                    "This high-quality product offers exceptional value and performance. Designed with modern technology and premium materials, it ensures durability and satisfaction. Perfect for everyday use with advanced features that make your life easier and more convenient."}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.bottomContent}>
          <View style={styles.quantitySection}>
            <Text style={styles.qtyLabel}>Quantity</Text>
            <View style={[
              styles.quantityControls,
              isOutOfStock && styles.quantityControlsDisabled
            ]}>
              <TouchableOpacity 
                style={[
                  styles.quantityButton,
                  styles.quantityButtonLeft,
                  (quantity === 1 || isOutOfStock) && styles.quantityButtonDisabled
                ]} 
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity === 1 || isOutOfStock}
              >
                <Icon 
                  name="remove" 
                  size={18} 
                  color={(quantity === 1 || isOutOfStock) ? colors.neutral.gray : colors.secondary.red} 
                />
              </TouchableOpacity>
              
              <View style={styles.quantityDisplay}>
                <Text style={[styles.quantityText, isOutOfStock && styles.textDisabled]}>
                  {quantity}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.quantityButton,
                  styles.quantityButtonRight,
                  isOutOfStock && styles.quantityButtonDisabled
                ]} 
                onPress={() => setQuantity(quantity + 1)}
                disabled={isOutOfStock}
              >
                <Icon 
                  name="add" 
                  size={18} 
                  color={isOutOfStock ? colors.neutral.gray : colors.primary.green} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.addToCartButton,
              isOutOfStock && styles.addToCartButtonDisabled,
              (isAddingToCart && !isOutOfStock) && styles.addToCartButtonLoading
            ]}
            onPress={handleAddToCart}
            disabled={isAddingToCart || isOutOfStock}
          >
            <View style={[
              styles.addToCartContent,
              isOutOfStock && styles.addToCartContentDisabled
            ]}>
              {isAddingToCart && !isOutOfStock ? (
                <ActivityIndicator color={colors.neutral.white} size="small" />
              ) : (
                <View style={styles.addToCartInner}>
                  <Icon 
                    name={isOutOfStock ? "block" : "add-shopping-cart"} 
                    size={20} 
                    color={colors.neutral.white} 
                  />
                  <Text style={styles.addToCartText}>
                    {isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal */}
      <Modal visible={isImageModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBackground}>
            {imageUrl && <Image source={{ uri: imageUrl }} style={styles.modalImage} />}
            <TouchableOpacity 
              style={styles.modalCloseButton} 
              onPress={() => setIsImageModalVisible(false)}
            >
              <View style={styles.modalCloseInner}>
                <Icon name="close" size={24} color={colors.neutral.white} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.lightGray,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.neutral.lightGray,
  },
  loaderContent: {
    alignItems: "center",
    padding: 20,
  },
  loaderIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary.paleGreen,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    fontSize: 16,
    color: colors.neutral.charcoal,
    fontWeight: "600",
    marginBottom: 4,
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.neutral.gray,
    fontWeight: "400",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 4,
    backgroundColor: colors.neutral.white,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  headerButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.neutral.lightGray,
  },
  scrollView: {
    flex: 1,
  },
  animatedContent: {
    flex: 1,
  },
  imageSection: {
    backgroundColor: colors.neutral.white,
    paddingVertical: 24,
    marginBottom: 12,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    alignItems: "center",
    position: "relative",
  },
  imageWrapper: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
  },
  productImage: {
    width: screenWidth * 0.85,
    height: 320,
    resizeMode: "contain",
  },
  discountBanner: {
    position: "absolute",
    top: 16,
    left: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  outOfStockBanner: {
    position: "absolute",
    top: 16,
    left: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.secondary.red,
  },
  bannerText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.neutral.white,
    marginLeft: 4,
  },
  favoriteButton: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  favoriteButtonInner: {
    padding: 12,
    backgroundColor: colors.neutral.white,
    borderRadius: 20,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  favoriteActive: {
    backgroundColor: colors.secondary.lightRed,
  },
  productInfoSection: {
    paddingHorizontal: 16,
  },
  productNameCard: {
    backgroundColor: colors.neutral.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.neutral.black,
  

  },
  productName: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.neutral.charcoal,
    lineHeight: 24,
  },
  priceCard: {
    backgroundColor: colors.neutral.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.neutral.black,
  
 
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary.green,
    marginRight: 12,
  },
  priceDisabled: {
    color: colors.neutral.gray,
    textDecorationLine: "line-through",
  },
  oldPriceContainer: {
    backgroundColor: colors.neutral.mediumGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  oldPrice: {
    fontSize: 14,
    color: colors.neutral.gray,
    textDecorationLine: "line-through",
    fontWeight: "500",
  },
  savingsContainer: {
    alignSelf: "flex-start",
  },
  savingsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary.lightRed,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  savingsText: {
    fontSize: 12,
    color: colors.secondary.red,
    fontWeight: "600",
    marginLeft: 4,
  },
  statusCard: {
    backgroundColor: colors.neutral.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.charcoal,
    marginLeft: 8,
  },
  statusContent: {
    backgroundColor: colors.primary.paleGreen,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  statusContentInStock: {
    borderLeftColor: colors.status.inStock,
    backgroundColor: colors.primary.paleGreen,
  },
  statusContentOutOfStock: {
    borderLeftColor: colors.status.outOfStock,
    backgroundColor: colors.neutral.lightGray,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral.charcoal,
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 12,
    color: colors.neutral.gray,
    fontWeight: "500",
  },
  featuresSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral.charcoal,
    marginLeft: 8,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.lightGreen,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral.charcoal,
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 12,
    color: colors.neutral.gray,
    fontWeight: "500",
  },
  descriptionSection: {
    marginBottom: 16,
  },
  descriptionCard: {
    backgroundColor: colors.neutral.white,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.green,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacityshadowRadius: 4,
   elevation: 2,
 },
 descriptionText: {
   fontSize: 14,
   color: colors.neutral.gray,
   lineHeight: 20,
   fontWeight: "500",
 },
 bottomSection: {
   backgroundColor: colors.neutral.white,
   paddingTop: 10,
   paddingBottom: 10,
   paddingHorizontal: 10,
   shadowColor: colors.neutral.black,
   shadowOffset: { width: 0, height: -2 },
   shadowOpacity: 0.1,
   shadowRadius: 8,
   elevation: 8,
 },
 bottomContent: {
   flexDirection: "row",
   alignItems: "center",
   justifyContent: "space-between",
 },
 quantitySection: {
   flex: 1,
   marginRight: 16,
 },
 qtyLabel: {
   fontSize: 14,
   fontWeight: "600",
   color: colors.neutral.charcoal,
   marginBottom: 8,
 },
 quantityControls: {
   flexDirection: "row",
   alignItems: "center",
   backgroundColor: colors.neutral.lightGray,
   borderRadius: 12,
   padding: 2,
 },
 quantityControlsDisabled: {
   backgroundColor: colors.neutral.mediumGray,
   opacity: 0.6,
 },
 quantityButton: {
   padding: 10,
   justifyContent: "center",
   alignItems: "center",
   borderRadius: 10,
 },
 quantityButtonLeft: {
   backgroundColor: colors.neutral.white,
 },
 quantityButtonRight: {
   backgroundColor: colors.neutral.white,
 },
 quantityButtonDisabled: {
   backgroundColor: colors.neutral.mediumGray,
 },
 quantityDisplay: {
   paddingHorizontal: 16,
   paddingVertical: 8,
   justifyContent: "center",
   alignItems: "center",
   minWidth: 40,
 },
 quantityText: {
   fontSize: 16,
   fontWeight: "700",
   color: colors.neutral.charcoal,
 },
 textDisabled: {
   color: colors.neutral.gray,
 },
 addToCartButton: {
   flex: 2,
   borderRadius: 12,
   overflow: "hidden",
   shadowColor: colors.neutral.black,
   shadowOffset: { width: 0, height: 2 },
   shadowOpacity: 0.15,
   shadowRadius: 4,
   elevation: 4,
 },
 addToCartButtonDisabled: {
   shadowOpacity: 0,
   elevation: 0,
 },
 addToCartButtonLoading: {
   shadowOpacity: 0.1,
 },
 addToCartContent: {
   backgroundColor: colors.primary.green,
   paddingVertical: 16,
   justifyContent: "center",
   alignItems: "center",
 },
 addToCartContentDisabled: {
   backgroundColor: colors.neutral.gray,
 },
 addToCartInner: {
   flexDirection: "row",
   alignItems: "center",
 },
 addToCartText: {
   fontSize: 16,
   fontWeight: "700",
   color: colors.neutral.white,
   marginLeft: 8,
 },
 modalContainer: {
   flex: 1,
   backgroundColor: "rgba(0, 0, 0, 0.9)",
   justifyContent: "center",
   alignItems: "center",
 },
 modalBackground: {
   width: screenWidth,
   height: screenHeight,
   justifyContent: "center",
   alignItems: "center",
   position: "relative",
 },
 modalImage: {
   width: screenWidth * 0.9,
   height: screenHeight * 0.7,
   resizeMode: "contain",
 },
 modalCloseButton: {
   position: "absolute",
   top: 60,
   right: 20,
 },
 modalCloseInner: {
   width: 40,
   height: 40,
   borderRadius: 20,
   backgroundColor: "rgba(0, 0, 0, 0.6)",
   justifyContent: "center",
   alignItems: "center",
 },
});

export default ProductDetailsScreen;