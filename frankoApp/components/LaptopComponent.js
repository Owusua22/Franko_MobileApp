 
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
import { fetchProductsByCategory } from "../redux/slice/productSlice";
import { addToCart } from "../redux/slice/cartSlice";
import { Feather } from "@expo/vector-icons";
import { addToWishlist } from "../redux/wishlistSlice";

import frankoLogo from "../assets/frankoIcon.png"; 

import { AntDesign } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const screenWidth = Dimensions.get("window").width;
const hardcodedCategoryId ="12f11417-4f9e-4e4a-a18d-f9ff0d4c85a6";
const CARD_MARGIN = 8;
const CARD_WIDTH = 170;

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(amount);

// Loading Card Component (matches BestSellers style exactly)
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

// Product Card Component (exact match with BestSellers component)
const ProductCard = ({ product, onPress, onAddToCart, isAddingToCart, index }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const discount = product.oldPrice > 0 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const isNew = index < 3;
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
          {/* New Badge */}
          {isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
          
          {/* Discount Badge */}
        
          
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


const LaptopComponent = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { productsByCategory = {}, loading } = useSelector((state) => state.products);
  const cartId = useSelector((state) => state.cart.cartId);
  const [addingToCart, setAddingToCart] = useState({});
  const containerRef = useRef(null);

  useEffect(() => {
    dispatch(fetchProductsByCategory(hardcodedCategoryId));
  }, [dispatch]);

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
    if (loading) {
      return Array(6).fill().map((_, idx) => <LoadingCard key={idx} />);
    }

    const products = productsByCategory[hardcodedCategoryId] || [];
    
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
    const products = productsByCategory[hardcodedCategoryId] || [];
    return products.length > 10;
  };

  return (
    <View style={styles.container}>
      <View style={styles.showroomContainer}>
        {/* Enhanced Showroom Header */}
        <View style={styles.showroomHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
         <Icon name="laptop" size={24} color="#fff" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.showroomTitle}>Laptops</Text>
              <Text style={styles.showroomSubtitle}>Best Deals & Latest Models</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.viewMoreButton}
            onPress={() => navigation.navigate("Computers")}
            activeOpacity={0.8}
          >
            <Text style={styles.viewMoreText}>View All</Text>
            <Icon name="arrow-right" size={16} color="#fff" />
          </TouchableOpacity>
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
              onPress={() => navigation.navigate("Computers")}
            >
              <View style={styles.viewAllContent}>
                <Feather name="plus" size={24} color="#16A34A" />
                <Text style={styles.viewAllText}>View More</Text>
                <Text style={styles.viewMoreSubtext}>
                  {(productsByCategory[hardcodedCategoryId]?.length || 0) - 10}+ more Laptop
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#16A34A",
    paddingHorizontal: 20,
    paddingVertical: 16,
    position: "relative",
  },
  
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  
  headerTextContainer: {
    flex: 1,
  },
  
  showroomTitle: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 18,
    letterSpacing: 0.5,
  },
  
  showroomSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 13,
    fontWeight: "400",
    marginTop: 2,
  },
  
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  
  viewMoreText: { 
    color: "#fff", 
    fontSize: 13, 
    fontWeight: "600",
    marginRight: 4,
  },
  
  productList: { 
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: 20,
  },
  
  // Product Card Styles (exact match with BestSellers component)
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

export default LaptopComponent;

