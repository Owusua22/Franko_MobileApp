import React, { useEffect, useState } from "react";
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
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById, fetchProducts } from "../redux/slice/productSlice";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { addToCart } from "../redux/slice/cartSlice";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Enhanced Color Palette
const colors = {
  primary: {
    green: "#2ECC71",
    darkGreen: "#27AE60",
    lightGreen: "#A9DFBF",
    paleGreen: "#E8F8F5",
  },
  secondary: {
    red: "#E74C3C",
    darkRed: "#C0392B",
    lightRed: "#F1948A",
    paleRed: "#FADBD8",
  },
  neutral: {
    white: "#FFFFFF",
    lightGray: "#F8F9FA",
    mediumGray: "#E9ECEF",
    gray: "#95A5A6",
    darkGray: "#34495E",
    black: "#2C3E50",
  },
  accent: {
    gold: "#F39C12",
    orange: "#E67E22",
    blue: "#3498DB",
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

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchProductById(productId));
  }, [dispatch, productId]);

  useEffect(() => {
    if (currentProduct && currentProduct.length > 0) {
      storeProductInAsyncStorage(currentProduct[0]);
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

  const handleAddToCart = () => {
    if (!currentProduct || !currentProduct[0]) {
      Alert.alert("Error", "Product data not available");
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

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  if (loading || !currentProduct || currentProduct.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary.green} />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  const product = currentProduct[0];
  const imageUrl = product?.productImage 
    ? `https://smfteapi.salesmate.app/Media/Products_Images/${product.productImage.split("\\").pop()}`
    : null;
  
  // Calculate savings amount and percentage
  const discountPercentage = product?.oldPrice 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  
  const savingsAmount = product?.oldPrice ? product.oldPrice - product.price : 0;

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.neutral.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
          <Icon name="share" size={20} color={colors.neutral.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Enhanced Image Section */}
        <View style={styles.imageSection}>
          <TouchableOpacity onPress={() => setIsImageModalVisible(true)} style={styles.imageContainer}>
            {imageUrl && <Image source={{ uri: imageUrl }} style={styles.productImage} />}
            
            {/* Enhanced Discount Banner */}
            {discountPercentage > 0 && (
              <View style={styles.discountBanner}>
                <Icon name="local-offer" size={16} color={colors.neutral.white} />
                <Text style={styles.discountText}>SAVE {formatPrice(savingsAmount)}</Text>
              </View>
            )}
            
            {/* Favorite Button */}
            <TouchableOpacity
              style={[styles.favoriteButton, isFavorite && styles.favoriteActive]}
              onPress={toggleFavorite}
            >
              <Icon
                name={isFavorite ? "favorite" : "favorite-border"}
                size={22}
                color={isFavorite ? colors.secondary.red : colors.neutral.gray}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Enhanced Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product?.productName || "Product Name"}</Text>
          
          {/* Enhanced Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceContainer}>
              <Text style={styles.currentPrice}>
                {product?.price ? formatPrice(product.price) : "Price not available"}
              </Text>
              {product?.oldPrice && (
                <View style={styles.oldPriceContainer}>
                  <Text style={styles.oldPrice}>{formatPrice(product.oldPrice)}</Text>
                </View>
              )}
            </View>
            
            {/* Enhanced Savings Display */}
            {savingsAmount > 0 && (
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

          {/* Enhanced Status Section */}
          <View style={styles.statusSection}>
            <View style={styles.statusCard}>
              <View style={styles.statusItem}>
                <View style={[styles.statusIconContainer, { backgroundColor: colors.primary.paleGreen }]}>
                  <Icon name="check-circle" size={18} color={colors.primary.green} />
                </View>
                <View style={styles.statusTextContainer}>
                  <Text style={styles.statusTitle}>In Stock</Text>
                  <Text style={styles.statusSubtitle}>Ready to ship</Text>
                </View>
              </View>
              
              <View style={styles.statusItem}>
                <View style={[styles.statusIconContainer, { backgroundColor: colors.accent.blue + '20' }]}>
                  <Icon name="local-shipping" size={18} color={colors.accent.blue} />
                </View>
                <View style={styles.statusTextContainer}>
                  <Text style={styles.statusTitle}>Fast Delivery</Text>
                  <Text style={styles.statusSubtitle}>2-3 business days</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Enhanced Features Section */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Why Choose This Product?</Text>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: colors.primary.paleGreen }]}>
                <Icon name="store" size={20} color={colors.primary.green} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Trusted Seller</Text>
                <Text style={styles.featureSubtitle}>
                  Sold by <Text style={styles.linkText}>Franko Trading</Text> • Verified
                </Text>
              </View>
              <Icon name="verified" size={16} color={colors.primary.green} />
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: colors.secondary.paleRed }]}>
                <Icon name="security" size={20} color={colors.secondary.red} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Quality Guaranteed</Text>
                <Text style={styles.featureSubtitle}>Only Authentic Products</Text>
              </View>
              <Icon name="arrow-forward-ios" size={14} color={colors.neutral.gray} />
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: colors.accent.gold + '20' }]}>
                <Icon name="local-shipping" size={20} color={colors.accent.gold} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Fast & Secure Delivery</Text>
                <Text style={styles.featureSubtitle}>Nationwide Delivery</Text>
              </View>
              <Icon name="arrow-forward-ios" size={14} color={colors.neutral.gray} />
            </View>
          </View>

          {/* Enhanced Description Section */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Product Description</Text>
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>
                {product?.description ||
                  "Easy-to-use dessert maker quickly turns frozen fruit into delicious soft serve or a smooth sorbet-like treat made without additional fats, sugars, or preservatives.\n\nDelicious Versatility: Create your healthy keto, non-dairy, and frozen treats or use the 75 included recipes to create simple, homemade desserts."}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Enhanced Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.quantityContainer}>
          <Text style={styles.qtyLabel}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={[styles.quantityButton, quantity === 1 && styles.quantityButtonDisabled]} 
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity === 1}
            >
              <Icon name="remove" size={18} color={quantity === 1 ? colors.neutral.gray : colors.secondary.red} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={() => setQuantity(quantity + 1)}>
              <Icon name="add" size={18} color={colors.primary.green} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addToCartButton, isAddingToCart && styles.addToCartButtonDisabled]}
          onPress={handleAddToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <ActivityIndicator color={colors.neutral.white} size="small" />
          ) : (
            <View style={styles.addToCartContent}>
              <Icon name="shopping-cart" size={20} color={colors.neutral.white} />
              <Text style={styles.addToCartText}>ADD TO CART</Text>
            
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Enhanced Modal */}
      <Modal visible={isImageModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {imageUrl && <Image source={{ uri: imageUrl }} style={styles.modalImage} />}
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsImageModalVisible(false)}>
              <Icon name="close" size={24} color={colors.neutral.white} />
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.neutral.gray,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.primary.green,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary.darkGreen,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.neutral.white,
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    backgroundColor: colors.neutral.white,
    paddingVertical: 20,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    alignItems: "center",
    position: "relative",
  },
  productImage: {
    width: screenWidth * 0.85,
    height: 320,
    resizeMode: "contain",
    borderRadius: 12,
  },
  discountBanner: {
    position: "absolute",
    top: 15,
    left: 16,
    backgroundColor: colors.secondary.red,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  discountText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.neutral.white,
    marginLeft: 4,
  },
  favoriteButton: {
    position: "absolute",
    top: 15,
    right: 16,
    padding: 12,
    backgroundColor: colors.neutral.white,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  favoriteActive: {
    backgroundColor: colors.secondary.paleRed,
  },
  productInfo: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral.black,
    lineHeight: 18,
    marginBottom: 16,
  },
  priceSection: {
    marginBottom: 20,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary.green,
    marginRight: 12,
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
  },
  savingsContainer: {
    marginTop: 4,
  },
  savingsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary.lightRed,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  savingsText: {
    fontSize: 13,
    color: colors.secondary.darkRed,
    fontWeight: "600",
    marginLeft: 4,
  },
  statusSection: {
    marginBottom: 24,
  },
  statusCard: {
    backgroundColor: colors.neutral.lightGray,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.green,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral.black,
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 12,
    color: colors.neutral.gray,
  },
  featuresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral.black,
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.neutral.mediumGray,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    color: colors.neutral.black,
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 12,
    color: colors.neutral.gray,
  },
  linkText: {
    color: colors.primary.green,
    fontWeight: "600",
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionCard: {
    backgroundColor: colors.neutral.lightGray,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.blue,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.neutral.darkGray,
    lineHeight: 22,
  },
  bottomSection: {
    flexDirection: "row",
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.mediumGray,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quantityContainer: {
    alignItems: "center",
    marginRight: 16,
  },
  qtyLabel: {
    fontSize: 12,
    color: colors.neutral.gray,
    marginBottom: 8,
    fontWeight: "500",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primary.lightGreen,
    borderRadius: 25,
    backgroundColor: colors.neutral.white,
  },
  quantityButton: {
    padding: 8,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral.black,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: colors.primary.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  addToCartButtonDisabled: {
    opacity: 0.6,
  },
  addToCartContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  addToCartText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 8,
  },
  totalPriceText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: "600",
    backgroundColor: colors.primary.darkGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.7,
    resizeMode: "contain",
  },
  modalCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    padding: 12,
    backgroundColor: colors.secondary.red,
    borderRadius: 25,
  },
});

export default ProductDetailsScreen;