import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchPaginatedProducts } from "../redux/slice/productSlice";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

const ProductsScreen = () => {
  const dispatch = useDispatch();
  const { products = [], loading } = useSelector((state) => state.products || {});

  const [currentPage, setCurrentPage] = useState(1);
  const navigation = useNavigation();
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [allProducts, setAllProducts] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const itemsPerPage = 24;

  useEffect(() => {
    setLoadingMore(true);
    dispatch(fetchPaginatedProducts({ pageNumber: currentPage, pageSize: itemsPerPage })).then(
      (response) => {
        if (response.payload) {
          setAllProducts((prevProducts) => [...prevProducts, ...response.payload]);
        }
        setLoadingMore(false);
      }
    );
  }, [currentPage]); // Removed dispatch from dependencies

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const price = parseFloat(product.price);
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;

      return product.status !== "0" && price >= min && price <= max;
    });
  }, [allProducts, minPrice, maxPrice]);

  const getValidImageURL = (imagePath) => {
    if (!imagePath) {
      return "https://via.placeholder.com/150";
    }
    if (imagePath.startsWith("F:\\") || imagePath.startsWith("D:\\")) {
      return `https://smfteapi.salesmate.app/Media/Products_Images/${imagePath.split("\\").pop()}`;
    }
    return imagePath;
  };

  const formatPrice = (price) =>
    price ? new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(price) : "N/A";

  const renderItem = ({ item }) => {
    const productImageURL = getValidImageURL(item.productImage);
    const discount =
      item.oldPrice > 0 ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100) : 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate("ProductDetails", { productId: item.productID })}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: productImageURL }} style={styles.productImage} />
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{`${discount}% OFF`}</Text>
            </View>
          )}
        </View>

        <Text style={styles.productName} numberOfLines={1}>
          {item.productName}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          {item.oldPrice > 0 && <Text style={styles.oldPrice}>{formatPrice(item.oldPrice)}</Text>}
        </View>

        <Image source={require("../assets/frankoIcon.png")} style={styles.frankoLogo} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Products</Text>
      
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.productID.toString()}
        numColumns={2}
        contentContainerStyle={styles.productGrid}
        onEndReached={() => setCurrentPage((prevPage) => prevPage + 1)}
        onEndReachedThreshold={0.1}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="red" /> : null}
        renderItem={renderItem}
      />
    </View>
  );
};

export default ProductsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16A34A",
    padding: 10,
    color: "white",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
   
    color: "white",
  },
  productGrid: {
    paddingBottom: 20,
  },
  productCard: {
    flex: 1,
    margin: 8,
    padding: 12,
    borderRadius: 15,
    backgroundColor: "#fff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    transform: [{ scale: 1 }],
    maxWidth: "48%"
  },
  imageContainer: {
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: 120,
    resizeMode: "contain",
  },
  discountBadge: {
    position: "absolute",
    top: 5,
    left: 5,
    backgroundColor: "red",
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 5,
  },
  discountText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  productName: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 5,
   
  },
  priceContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  productPrice: {
    color: "red",
    fontWeight: "bold",
    fontSize: 12,
  },
  oldPrice: {
    textDecorationLine: "line-through",
    color: "gray",
    marginLeft: 2,
    fontSize: 10
  },
  frankoLogo: {
    position: "absolute",
    bottom: 1,
    right: 2,
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
});
