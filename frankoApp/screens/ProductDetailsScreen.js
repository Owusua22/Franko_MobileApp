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
<<<<<<< HEAD
  Modal,
=======
>>>>>>> 4418917 (Initial commit)
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
<<<<<<< HEAD
  const cartId = useSelector((state) => state.cart.cartId);

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
=======
  const cartItems = useSelector((state) => state.cart.cartItems);
  const cartId = useSelector((state) => state.cart.cartId);

  const [isAddingToCart, setIsAddingToCart] = useState(false);
>>>>>>> 4418917 (Initial commit)

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

<<<<<<< HEAD
=======
  // Show activity indicator while loading
>>>>>>> 4418917 (Initial commit)
  if (loading || !currentProduct || currentProduct.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }
<<<<<<< HEAD
  
=======
>>>>>>> 4418917 (Initial commit)

  const product = currentProduct[0];
  const imageUrl = `https://smfteapi.salesmate.app/Media/Products_Images/${product.productImage.split("\\").pop()}`;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="red" />
<<<<<<< HEAD
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsImageModalVisible(true)} style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.productImage} />
      </TouchableOpacity>
=======
      
      </TouchableOpacity>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.productImage} />
      </View>
>>>>>>> 4418917 (Initial commit)

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>
          <Text style={styles.productName}>{product.productName}</Text>
<<<<<<< HEAD
          <View style={styles.priceContainer}>
  {product.oldPrice ? (
    <Text style={styles.oldPrice}>{formatPrice(product.oldPrice)}</Text>
  ) : null}
  <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
</View>


<View style={styles.descriptionContainer}>
  <Text style={styles.sectionTitle}>Description</Text>
  <Text>{product.description || "No description available."}</Text>
</View>

=======
          <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>

          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text>{product.description}</Text>
          </View>
>>>>>>> 4418917 (Initial commit)
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
<<<<<<< HEAD
  <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
    <Icon name="share" size={24} color="#fff" />
    {/* Wrap text in a Text component */}
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
        {/* Wrap text in a Text component */}
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
=======
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
>>>>>>> 4418917 (Initial commit)
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
<<<<<<< HEAD
  productImage: { width: 370, height: 350, resizeMode: "cover" },
  scrollContent: { paddingBottom: 100 },
  contentContainer: { padding: 16 },
  productName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  priceContainer: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  oldPrice: { fontSize: 14, color: "#888", textDecorationLine: "line-through", marginLeft: 8 },
  productPrice: { fontSize: 18, color: "#e60000", fontWeight: "bold" },
  descriptionContainer: { marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
=======
  productImage: { width: "100%", height: "100%", resizeMode: "cover" },
  scrollContent: { paddingBottom: 100 },
  contentContainer: { padding: 16 },
  productName: { fontSize: 18, fontWeight: "bold", marginBottom: 8, color: "#333" },
  productPrice: { fontSize: 14, color: "#e60000", marginBottom: 16 , fontWeight: "bold"},
  descriptionContainer: { marginTop: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 8 },
>>>>>>> 4418917 (Initial commit)
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
<<<<<<< HEAD
=======
 
>>>>>>> 4418917 (Initial commit)
  shareText: { color: "#fff", marginLeft: 8 },
  addToCartButton: {
    backgroundColor: "#BF211E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 20,
<<<<<<< HEAD
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
=======
    flex: 1,
  },
  addToCartButtonDisabled: { backgroundColor: "#BF211E" },
  addToCartText: { color: "#fff", marginLeft: 8 },
});

export default ProductDetailsScreen;
>>>>>>> 4418917 (Initial commit)
