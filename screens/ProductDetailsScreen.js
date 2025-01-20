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
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById, fetchProducts } from "../redux/slice/productSlice";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { addToCart } from "../redux/slice/cartSlice";

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
  const cartItems = useSelector((state) => state.cart.cartItems);
  const cartId = useSelector((state) => state.cart.cartId);

  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchProductById(productId));
  }, [dispatch, productId]);

  const handleAddToCart = () => {
    const cartData = {
      cartId,
      productId: currentProduct[0].productID,
      price: currentProduct[0].price,
      quantity: 1,
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
      const message = `Check out this product: ${currentProduct[0].productName}\nPrice: ${formatPrice(currentProduct[0].price)}`;
      await Share.share({ message });
    } catch (error) {
      Alert.alert("Error", "Failed to share product.");
    }
  };

  // Show activity indicator while loading
  if (loading || !currentProduct || currentProduct.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  const product = currentProduct[0];
  const imageUrl = `https://smfteapi.salesmate.app/Media/Products_Images/${product.productImage.split("\\").pop()}`;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="red" />
      
      </TouchableOpacity>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.productImage} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>
          <Text style={styles.productName}>{product.productName}</Text>
          <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>

          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text>{product.description}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Icon name="share" size={24} color="#fff" />
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            isAddingToCart && styles.addToCartButtonDisabled,
          ]}
          onPress={handleAddToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="shopping-cart" size={24} color="#fff" />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: { marginTop: 10, fontSize: 16, color: "#555" },
  imageContainer: { height: 350, backgroundColor: "#f8f8f8" },
  productImage: { width: "100%", height: "100%", resizeMode: "cover" },
  scrollContent: { paddingBottom: 100 },
  contentContainer: { padding: 16 },
  productName: { fontSize: 18, fontWeight: "bold", marginBottom: 8, color: "#333" },
  productPrice: { fontSize: 14, color: "#e60000", marginBottom: 16 , fontWeight: "bold"},
  descriptionContainer: { marginTop: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 8 },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  shareButton: {
    backgroundColor: "#28a745",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 20,
    flex: 1,
    marginRight: 8,
  },
 
  shareText: { color: "#fff", marginLeft: 8 },
  addToCartButton: {
    backgroundColor: "#BF211E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 20,
    flex: 1,
  },
  addToCartButtonDisabled: { backgroundColor: "#BF211E" },
  addToCartText: { color: "#fff", marginLeft: 8 },
});

export default ProductDetailsScreen;
