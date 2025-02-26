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
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById, fetchProducts } from "../redux/slice/productSlice";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  const cartId = useSelector((state) => state.cart.cartId);

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchProductById(productId));

    if (currentProduct && currentProduct.length > 0) {
      storeProductInAsyncStorage(currentProduct[0]);
    }
    
  }, [dispatch, productId]);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchProductById(productId));
  }, [dispatch, productId]); // Fetch products when productId changes
  
  useEffect(() => {
    if (currentProduct && currentProduct.length > 0) {
      storeProductInAsyncStorage(currentProduct[0]);
    }
  }, [currentProduct]); // Store product when it updates
  
  const storeProductInAsyncStorage = async (product) => {
    try {
      const storedProducts = await AsyncStorage.getItem("recentProducts");
      let productList = storedProducts ? JSON.parse(storedProducts) : [];
  
      // Remove duplicate entries
      productList = productList.filter((item) => item.productID !== product.productID);
  
      // Add new product at the beginning
      productList.unshift(product);
  
      // Keep only the first 12 entries
      if (productList.length > 12) {
        productList = productList.slice(0, 12);
      }
  
      await AsyncStorage.setItem("recentProducts", JSON.stringify(productList));
     
    } catch (error) {
     
    }
  };
  
  

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

      <TouchableOpacity onPress={() => setIsImageModalVisible(true)} style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.productImage} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>
          <Text style={styles.productName}>{product.productName}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
            {product.oldPrice ? (
              <Text style={styles.oldPrice}>{formatPrice(product.oldPrice)}</Text>
            ) : null}
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text>{product.description || "No description available."}</Text>
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

      <Modal visible={isImageModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <Image source={{ uri: imageUrl }} style={styles.modalImage} />
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setIsImageModalVisible(false)}
          >
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
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
  productImage: { width: 370, height: 350, resizeMode: "cover" },
  scrollContent: { paddingBottom: 100 },
  contentContainer: { padding: 16 },
  productName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  priceContainer: { flexDirection: "row", alignItems: "center", marginVertical: 8, gap: 8 },
  oldPrice: { fontSize: 12, color: "#888", textDecorationLine: "line-through", marginLeft: 8 },
  productPrice: { fontSize: 18, color: "#e60000", fontWeight: "bold"},
  descriptionContainer: { marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
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
    flex: 2,
  },
  addToCartButtonDisabled: { backgroundColor: "#BF211E" },
  addToCartText: { color: "#fff", marginLeft: 8 },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: { width: "90%", height: "70%", resizeMode: "contain" },
  modalCloseButton: { position: "absolute", top: 40, right: 20 },
});

export default ProductDetailsScreen;