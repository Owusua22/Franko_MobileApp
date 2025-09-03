import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Alert,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  getCartById,
  updateCartItem,
  deleteCartItem,
} from "../redux/slice/cartSlice";
import { removeFromWishlist, addToWishlist } from "../redux/wishlistSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SignupScreen from "./SignupScreen";

const CartScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { cartItems, loading } = useSelector((state) => state.cart);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const [deleting, setDeleting] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const backendBaseURL = "https://smfteapi.salesmate.app";

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cartId = await AsyncStorage.getItem("cartId");
        if (cartId) {
          dispatch(getCartById(cartId));
        }
      } catch (error) {
        console.error("Failed to fetch cart ID:", error);
      }
    };

    fetchCart();
  }, [dispatch]);

  const handleQuantityChange = async (cartId, productId, quantity) => {
    if (quantity < 1) {
      await dispatch(deleteCartItem({ cartId, productId }));
    } else {
      await dispatch(updateCartItem({ cartId, productId, quantity }));
    }
    dispatch(getCartById(cartId));
  };
  
  const handleDeleteItem = async (cartId, productId) => {
    setDeleting(true);
    await dispatch(deleteCartItem({ cartId, productId }));
    dispatch(getCartById(cartId));
    setDeleting(false);
  };

  // Wishlist toggle functionality
  const handleToggleWishlist = (item) => {
    const isInWishlist = wishlistItems.some(
      (w) => w.productID === item.productId
    );

    // Create product object with the structure expected by wishlist
    const productForWishlist = {
      productID: item.productId,
      productName: item.productName,
      price: item.price,
      productImage: item.imagePath,
      // Add any other fields that might be needed
      brandName: item.brandName || "",
      categoryName: item.categoryName || "",
      sellerName: item.sellerName || "",
    };

    if (isInWishlist) {
      dispatch(removeFromWishlist(item.productId));
      Alert.alert("Removed", `${item.productName} removed from wishlist.`);
    } else {
      dispatch(addToWishlist(productForWishlist));
      Alert.alert("Added", `${item.productName} added to wishlist ❤️`);
    }
  };

  // Check if item is in wishlist
  const isItemInWishlist = (productId) => {
    return wishlistItems.some((item) => item.productID === productId);
  };

  const calculateSubtotal = () =>
    cartItems?.reduce((total, item) => total + item.price * item.quantity, 0) || 0;

  const getTotalItems = () =>
    cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  const handleCheckout = async () => {
    try {
      const userDetails = await AsyncStorage.getItem("customer");
      if (!userDetails) {
        setShowSignupModal(true);
      } else {
        const cartData = {
          cartItems,
          subtotal: calculateSubtotal(),
          timestamp: new Date().toISOString(),
        };
        await AsyncStorage.setItem("cartDetails", JSON.stringify(cartData));
        navigation.navigate("Checkout");
      }
    } catch (error) {
      console.error("Failed to handle checkout:", error);
    }
  };

  const handleSignupModalClose = async () => {
    setShowSignupModal(false);
    
    try {
      const userDetails = await AsyncStorage.getItem("customer");
      if (userDetails) {
        const cartData = {
          cartItems,
          subtotal: calculateSubtotal(),
          timestamp: new Date().toISOString(),
        };
        await AsyncStorage.setItem("cartDetails", JSON.stringify(cartData));
        navigation.navigate("Checkout");
      }
    } catch (error) {
      console.error("Failed to check user status after modal close:", error);
    }
  };

  const handleShare = async () => {
    try {
      const totalItems = getTotalItems();
      const subtotal = calculateSubtotal();
      const itemsList = cartItems.map(item => 
        `•GH₵ ${item.productName} (${item.quantity}x) - ${item.price.toFixed(1)} `
      ).join('\n');

      const shareContent = {
        title: 'My Shopping Cart',
        message: `Check out my shopping cart from Franko! 🛒\n\n` +
                `${totalItems} item${totalItems !== 1 ? 's' : ''} - Total: ${subtotal.toFixed(1)} GH₵\n\n` +
                `Items:\n${itemsList}\n\n` +
                `Shop now on Franko trading app!`,
      };

      const result = await Share.share(shareContent);
    } catch (error) {
      console.error('Error sharing cart:', error);

    }
  };

  const renderCartItem = ({ item }) => {
    const imageUrl = item.imagePath
      ? `${backendBaseURL}/Media/Products_Images/${item.imagePath.split("\\").pop()}`
      : null;

    const inWishlist = isItemInWishlist(item.productId);

    return (
      <View style={styles.cartItem}>
        <View style={styles.productImageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.productImage} />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <MaterialIcons name="image" size={30} color="#E5E7EB" />
            </View>
          )}
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.productName}
          </Text>
          <Text style={styles.productPrice}>
           GH₵ {item.price.toFixed(2)} 
          </Text>
          
          <View style={styles.quantityRow}>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[styles.quantityButton, styles.quantityButtonLeft]}
                onPress={() =>
                  handleQuantityChange(item.cartId, item.productId, item.quantity - 1)
                }
                activeOpacity={0.7}
              >
                <MaterialIcons name="remove" size={16} color="#6B7280" />
              </TouchableOpacity>
              
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{item.quantity}</Text>
              </View>
              
              <TouchableOpacity
                style={[styles.quantityButton, styles.quantityButtonRight]}
                onPress={() =>
                  handleQuantityChange(item.cartId, item.productId, item.quantity + 1)
                }
                activeOpacity={0.7}
              >
                <MaterialIcons name="add" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.itemActions}>
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              inWishlist && styles.wishlistButtonActive
            ]} 
            onPress={() => handleToggleWishlist(item)}
            activeOpacity={0.7}
          >
            <MaterialIcons 
              name={inWishlist ? "favorite" : "favorite-border"} 
              size={18} 
              color={inWishlist ? "#EF4444" : "#9CA3AF"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteActionButton]}
            onPress={() => handleDeleteItem(item.cartId, item.productId)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="delete-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading || deleting) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>
          {deleting ? "Updating cart..." : "Loading..."}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>

      
      {/* Enhanced Header */}
      <View style={styles.Cartheader}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back-ios" size={20} color="#374151" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={styles.cartIconContainer}>
            <MaterialIcons name="shopping-cart" size={22} color="#059669" />
            {getTotalItems() > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
              </View>
            )}
          </View>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <MaterialIcons name="ios-share" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.container}>
        {cartItems && cartItems.length > 0 ? (
          <View style={styles.contentWrapper}>
            {/* Items Summary Header */}
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryHeaderText}>
                {getTotalItems()} {getTotalItems() === 1 ? 'Item' : 'Items'} in your cart
              </Text>
            </View>

            <FlatList
              data={cartItems}
              keyExtractor={(item, index) => `${item.cartId}-${item.productId}-${index}`}
              renderItem={renderCartItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              style={styles.flatList}
            />
            
            {/* Enhanced Bottom Container */}
            <View style={styles.bottomContainer}>
              <View style={styles.orderSummary}>
               
                <View style={styles.summaryDivider} />
                
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    GH₵ {calculateSubtotal().toFixed(2)}
                  </Text>
                </View>
              </View>
              
              {/* Enhanced Checkout Button */}
              <TouchableOpacity 
                style={styles.checkoutButton} 
                onPress={handleCheckout}
                activeOpacity={0.9}
              >
                <View style={styles.checkoutButtonContent}>
                  <View style={styles.checkoutButtonLeft}>
                    <MaterialIcons name="shopping-bag" size={16} color="#FFFFFF" />
                    <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                  </View>
                  <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <MaterialIcons name="shopping-cart" size={64} color="#E5E7EB" />
            </View>
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
            <Text style={styles.emptyCartSubtext}>
              Discover amazing products and add them to your cart
            </Text>
            <TouchableOpacity 
              style={styles.shopNowButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.shopNowButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Signup Modal */}
      <SignupScreen
        visible={showSignupModal}
        onClose={handleSignupModalClose}
      />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingBottom: 20

  },
  Cartheader: {
    flexDirection: "row",
    alignItems : "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  cartIconContainer: {
    position: "relative",
    marginRight: 8,
  },
  cartBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.5,
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  summaryHeader: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  summaryHeaderText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  contentWrapper: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 120,
    
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    

    
    padding: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      
    }),
  },
  productImageContainer: {
    marginRight: 16,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  productImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "700",
    marginBottom: 12,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  quantityButtonLeft: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  quantityButtonRight: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  quantityDisplay: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  quantityText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
    textAlign: "center",
    minWidth: 20,
  },
  itemActions: {
    alignItems: "center",
    justifyContent: "space-around",
    marginLeft: 12,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: "#F3F4F6",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    marginVertical: 4,
  },
  deleteActionButton: {
    backgroundColor: "#FEF2F2",
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingTop: 10,
    paddingHorizontal: 20,

    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
     
    }),
  },
  orderSummary: {
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "600",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 1 ,
  },
  totalRow: {
    paddingVertical: 1,
  },
  totalLabel: {
    fontSize: 18,
    color: "#111827",
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 17,
    color: "#111827",
    fontWeight: "800",
  },
  checkoutButton: {
    backgroundColor: "#059669",
    borderRadius: 16,
    paddingVertical:14,
    paddingHorizontal: 24,
  
  },
  checkoutButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  checkoutButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyCartText: {
    fontSize: 22,
    color: "#374151",
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyCartSubtext: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  shopNowButton: {
    backgroundColor: "#059669",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    ...Platform.select({
      ios: {
        shadowColor: "#059669",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  shopNowButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
});

export default CartScreen;