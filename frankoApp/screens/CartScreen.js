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
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  getCartById,
  updateCartItem,
  deleteCartItem,
} from "../redux/slice/cartSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const CartScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { cartItems, loading } = useSelector((state) => state.cart);
  const [deleting, setDeleting] = useState(false);

  const backendBaseURL = "https://smfteapi.salesmate.app"; // Ensure this is declared at the top level

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

<<<<<<< HEAD
  const handleQuantityChange = async (cartId, productId, quantity) => {
    if (quantity < 1) {
      await dispatch(deleteCartItem({ cartId, productId }));
    } else {
      await dispatch(updateCartItem({ cartId, productId, quantity }));
    }
  
    // Refetch cart to get the latest state
    dispatch(getCartById(cartId));
  };
  
  const handleDeleteItem = async (cartId, productId) => {
    setDeleting(true);
    await dispatch(deleteCartItem({ cartId, productId }));
  
    // Refetch cart after deletion
    dispatch(getCartById(cartId));
    setDeleting(false);
  };
  
=======
  const handleQuantityChange = (cartId, productId, quantity) => {
    if (quantity < 1) {
      dispatch(deleteCartItem({ cartId, productId }));
    } else {
      dispatch(updateCartItem({ cartId, productId, quantity }));
    }
  };

  const handleDeleteItem = (cartId, productId) => {
    setDeleting(true);
    dispatch(deleteCartItem({ cartId, productId })).finally(() => {
      setDeleting(false);
    });
  };
>>>>>>> 4418917 (Initial commit)

  const calculateSubtotal = () =>
    cartItems?.reduce((total, item) => total + item.price * item.quantity, 0) || 0;

  const handleCheckout = async () => {
    try {
      const userDetails = await AsyncStorage.getItem("customer");
      if (!userDetails) {
        navigation.navigate("Signup");
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

  const renderCartItem = ({ item }) => {
    const imageUrl = item.imagePath
      ? `${backendBaseURL}/Media/Products_Images/${item.imagePath.split("\\").pop()}`
      : null;

    return (
      <View style={styles.cartItem}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.productImage} />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        <View style={styles.itemDetails}>
          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.price}>₵{item.price.toLocaleString()}.00</Text>
          <View style={styles.actionContainer}>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[styles.quantityButton, { backgroundColor: "#FFB6B6" }]}
                onPress={() =>
                  handleQuantityChange(item.cartId, item.productId, item.quantity - 1)
                }
              >
                <Text style={styles.quantityText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <TouchableOpacity
                style={[styles.quantityButton, { backgroundColor: "#006838" }]}
                onPress={() =>
                  handleQuantityChange(item.cartId, item.productId, item.quantity + 1)
                }
              >
                <Text style={styles.quantityText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => handleDeleteItem(item.cartId, item.productId)}
              style={styles.deleteButton}
            >
              <MaterialIcons name="delete" size={24} color="#FF6347" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading || deleting) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color="#fff"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.titleText}>My Cart</Text>
        </View>
        {cartItems && cartItems.length > 0 ? (
         <FlatList
         data={cartItems}
         keyExtractor={(item) => item.cartId}  // Use cartId as the unique key
         renderItem={renderCartItem}
         ListFooterComponent={
           <View style={styles.summaryContainer}>
             <Text style={styles.subtotalText}>
               Subtotal: ₵{calculateSubtotal().toLocaleString()}.00
             </Text>
             <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
               <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
             </TouchableOpacity>
           </View>
         }
         contentContainerStyle={styles.contentContainer}
       />
       
        ) : (
          <Text style={styles.emptyCartText}>Your cart is empty.</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 3, backgroundColor: "#f4f4f4" },
  container: { flex: 4, padding: 20, backgroundColor: "#fff" },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#006838",
    borderRadius: 30,
  },
  titleText: {
    color: "#fff", fontSize: 14, fontWeight: "bold", marginLeft: 10 
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#eee",
  },
  productImage: { width: 60, height: 60, borderRadius: 12, borderWidth: 1, borderColor: "#ddd" },
  productImagePlaceholder: {
    width: 60, height: 60, justifyContent: "center", alignItems: "center", backgroundColor: "#f0f0f0", borderRadius: 12
  },
  placeholderText: { fontSize: 12, color: "#bbb" },
  itemDetails: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  price: { fontSize: 14, color: "#666", marginTop: 4 },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  quantityContainer: { flexDirection: "row", alignItems: "center" },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  quantityText: { fontSize: 18, fontWeight: "bold" },
  quantity: { marginHorizontal: 10, fontSize: 16 },
  deleteButton: {
    padding: 8,
    backgroundColor: "#FFEBEB",
    borderRadius: 8,
  },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 14, color: "red" },
  emptyCartText: { fontSize: 16, color: "#888", textAlign: "center" },
  summaryContainer: {
    flexDirection: "column", // Stack the subtotal and checkout button vertically
    alignItems: "flex-end", // Align to the right
    marginTop: 16,
    padding: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
  },
  subtotalText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  checkoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: "#e63946",
    borderRadius: 20,
  },
  checkoutButtonText: { fontSize: 14, color: "#fff", fontWeight: "bold" },
  contentContainer: { paddingBottom: 40 },
  deleteSelectedButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#FF6347",
    borderRadius: 20,
    alignItems: "center",
  },
  deleteSelectedText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
  }
});

export default CartScreen;