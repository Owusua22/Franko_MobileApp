import React, { useState, memo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { addToCart } from "../redux/slice/cartSlice";
import { addToWishlist } from "../redux/wishlistSlice";
import { AntDesign } from "@expo/vector-icons";
import frankoLogo from "../assets/frankoIcon.png";

const CARD_MARGIN = 8;
const CARD_WIDTH = 160;

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(amount);

// Loading Card Component (memoized for performance)
const LoadingCard = memo(() => (
  <View style={styles.loadingCard}>
    <View style={styles.loadingImage}>
      <Image source={frankoLogo} style={styles.frankoLogo} />
    </View>
    <View style={styles.loadingContent}>
      <View style={styles.loadingTitle} />
      <View style={styles.loadingPrice} />
    </View>
  </View>
));

LoadingCard.displayName = 'LoadingCard';

// Main Product Card Component (memoized for performance)
const ProductCard = memo(({ 
  product, 
  onPress, 
  onAddToCart, 
  isAddingToCart, 
  index,
  showHotDeal = true,
  cardWidth = CARD_WIDTH,
  cardHeight = 240 
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const cartId = useSelector((state) => state.cart.cartId);

  // Memoized calculations
  const discount = React.useMemo(() => {
    return product.oldPrice > 0 
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;
  }, [product.oldPrice, product.price]);

  const isHotDeal = React.useMemo(() => {
    return showHotDeal && index < 3;
  }, [showHotDeal, index]);

  const isInWishlist = React.useMemo(() => {
    return wishlistItems.some((item) => item.productID === product.productID);
  }, [wishlistItems, product.productID]);

  const imageUri = React.useMemo(() => {
    return `https://smfteapi.salesmate.app/Media/Products_Images/${product.productImage
      .split("\\")
      .pop()}`;
  }, [product.productImage]);

  // Memoized callbacks for better performance
  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleWishlistPress = useCallback(() => {
    if (isInWishlist) {
      Alert.alert("Info", `${product.productName} is already in your wishlist.`);
    } else {
      dispatch(addToWishlist(product));
      Alert.alert("Success", `${product.productName} added to wishlist! ❤️`);
    }
  }, [isInWishlist, product, dispatch]);

  const handleProductPress = useCallback(() => {
    if (onPress) {
      onPress(product.productID);
    } else {
      navigation.navigate('ProductDetails', { productId: product.productID });
    }
  }, [onPress, product.productID, navigation]);

  const handleAddToCartPress = useCallback((e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      // Default add to cart logic
      const cartData = {
        cartId,
        productId: product.productID,
        price: product.price,
        quantity: 1,
      };

      dispatch(addToCart(cartData))
        .then(() => {
          Alert.alert("Success", `${product.productName} added to cart successfully!`);
        })
        .catch((error) => {
          Alert.alert("Error", `Failed to add product to cart: ${error.message}`);
        });
    }
  }, [onAddToCart, product, cartId, dispatch]);

  const cardStyle = React.useMemo(() => [
    styles.productCard,
    { width: cardWidth, height: cardHeight }
  ], [cardWidth, cardHeight]);

  return (
    <View style={cardStyle}>
      <TouchableOpacity
        onPress={handleProductPress}
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
            source={{ uri: imageUri }}
            style={[styles.productImage, imageLoading && styles.hiddenImage]}
            onLoad={handleImageLoad}
            onError={handleImageError}
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
          onPress={handleAddToCartPress}
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
});

ProductCard.displayName = 'ProductCard';

// Optimized Product List Component for better FlatList performance
const OptimizedProductList = memo(({ 
  products, 
  loading, 
  onProductPress, 
  onAddToCart, 
  addingToCart = {},
  showLoadingCards = 6,
  showHotDeal = true 
}) => {
  // Render item function (memoized)
  const renderItem = useCallback(({ item, index }) => {
    return (
      <ProductCard
        product={item}
        index={index}
        onPress={onProductPress}
        onAddToCart={onAddToCart}
        isAddingToCart={addingToCart[item.productID]}
        showHotDeal={showHotDeal}
      />
    );
  }, [onProductPress, onAddToCart, addingToCart, showHotDeal]);

  // Key extractor (memoized)
  const keyExtractor = useCallback((item) => item.productID, []);

  // Get item layout for better performance
  const getItemLayout = useCallback((data, index) => ({
    length: CARD_WIDTH + CARD_MARGIN,
    offset: (CARD_WIDTH + CARD_MARGIN) * index,
    index,
  }), []);

  if (loading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        {Array(showLoadingCards).fill().map((_, idx) => (
          <LoadingCard key={`loading-${idx}`} />
        ))}
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        {Array(showLoadingCards).fill().map((_, idx) => (
          <LoadingCard key={`empty-${idx}`} />
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
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
    />
  );
});

OptimizedProductList.displayName = 'OptimizedProductList';

const styles = StyleSheet.create({
  // Product Card Styles
  productCard: {
    backgroundColor: "#fff",
    padding: 4,
    borderRadius: 12,
    width: 160,
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

  // List Styles
  productList: {
    paddingRight: 10,
    paddingVertical: 20,
  },

  loadingContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
});

// Export components
export { ProductCard, LoadingCard, OptimizedProductList };
export default ProductCard;