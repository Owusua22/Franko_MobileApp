import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, resetProducts } from '../redux/slice/productSlice';
import { addToCart } from '../redux/slice/cartSlice';
import { addToWishlist } from "../redux/wishlistSlice"; // ✅ FIX: import
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';


const { width } = Dimensions.get('window');
const CARD_WIDTH = 170;
const CARD_MARGIN = 8;

// ✅ FIX: correct function name
const formatCurrency = (price) =>
  new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(price || 0);

// ✅ Memoized Product Card (prevents unnecessary re-renders)
const ProductCard = memo(({ product, index, onPress, onAddToCart, isAddingToCart, isInWishlist, onToggleWishlist }) => {
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
              <ActivityIndicator size="large" color="#E63946" />
            </View>
          )}
          
          <Image
            source={{
              uri: `https://smfteapi.salesmate.app/Media/Products_Images/${product.productImage?.split("\\").pop()}`,
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

          {/* Wishlist Button */}
          <TouchableOpacity style={styles.wishlistButton} onPress={() => onToggleWishlist(product, isInWishlist)}>
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
});

const ComboComponent = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { products, loading } = useSelector((state) => state.products);
  const cartId = useSelector((state) => state.cart.cartId);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const [recentProducts, setRecentProducts] = useState([]);
  const [addingToCart, setAddingToCart] = useState({});

  // Reset products + fetch fresh
  useFocusEffect(
    React.useCallback(() => {
      dispatch(resetProducts());
      dispatch(fetchProducts());
    }, [dispatch])
  );

  // Sort + take 10 newest
  useEffect(() => {
    if (products?.length > 0) {
      const sorted = products
        .slice()
        .sort((a, b) => new Date(b.dateCreated || b.createdAt || 0) - new Date(a.dateCreated || a.createdAt || 0))
        .slice(0, 10);

      setRecentProducts(sorted);
    } else {
      setRecentProducts([]);
    }
  }, [products]);

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
        Alert.alert("Success", `${product.productName} added to cart!`);
      })
      .catch((err) => {
        Alert.alert("Error", err.message || "Failed to add product");
      })
      .finally(() => {
        setAddingToCart((prev) => {
          const next = { ...prev };
          delete next[product.productID];
          return next;
        });
      });
  }, [dispatch, cartId]);

  const handleToggleWishlist = useCallback((product, isInWishlist) => {
    if (isInWishlist) {
      Alert.alert("Info", `${product.productName} is already in wishlist.`);
    } else {
      dispatch(addToWishlist(product));
      Alert.alert("Added", `${product.productName} added to wishlist ❤️`);
    }
  }, [dispatch]);

  const handleProductPress = useCallback((id) => {
    navigation.navigate('ProductDetails', { productID: id });
  }, [navigation]);

  const renderProduct = useCallback(({ item, index }) => {
    const isInWishlist = wishlistItems.some((w) => w.productID === item.productID);
    return (
      <ProductCard
        product={item}
        index={index}
        onPress={() => handleProductPress(item.productID)}
        onAddToCart={handleAddToCart}
        isAddingToCart={addingToCart[item.productID]}
        isInWishlist={isInWishlist}
        onToggleWishlist={handleToggleWishlist}
      />
    );
  }, [wishlistItems, handleProductPress, handleAddToCart, addingToCart, handleToggleWishlist]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>New Arrivals</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.subtitle}>Fresh picks just for you</Text>
        </View>
        
        <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('Products')}>
          <Text style={styles.viewAllText}>Shop All</Text>
          <View style={styles.arrowContainer}>
            <Text style={styles.arrow}>→</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Products */}
      <FlatList
        data={recentProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.productID?.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 16,
    backgroundColor: "#F8FAFC",
    marginBottom: 80,
  },
  // Enhanced Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  titleContainer: {
    alignItems: 'flex-start',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  titleUnderline: {
    width: 80,
    height: 4,
    backgroundColor: '#16A34A',
    borderRadius: 2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f0fdf4',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginRight: 6,
  },
  arrowContainer: {
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  flatListContent: {
    paddingBottom: 20
  },
  row: {
    justifyContent: 'space-between',
  },

  // Product Card Styles (matching Deals component exactly)
  productCard: {
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 12,
    width: CARD_WIDTH,
    marginRight: CARD_MARGIN,
    marginLeft: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.9,
    shadowRadius: 2,
    elevation: 5,
    marginBottom: 20,
    height: 240,
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
  
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  
  outOfStockText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
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
  
  // Loading Card Styles (matching product card exactly)
  skeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  loadingCard: {
    width: CARD_WIDTH,
    marginRight: CARD_MARGIN,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    height: 240,
    marginBottom: 20,
    marginLeft: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.9,
    shadowRadius: 2,
    elevation: 5,
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
});

export default ComboComponent;