import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { resetProducts, fetchProduct } from "../redux/slice/productSlice";

const screenWidth = Dimensions.get("window").width;

const formatPrice = (price) =>
  price
    ? new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(price)
    : "N/A";

export default function ProductsComponent() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);

  const [recentProducts, setRecentProducts] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(resetProducts());
      dispatch(fetchProduct());
    }, [dispatch])
  );

  useEffect(() => {
    if (products && products.length > 0) {
      const sortedProducts = products
        .slice()
        .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
        .slice(0, 24);
      setRecentProducts(sortedProducts);
    }
  }, [products]);

  const getValidImageURL = (imagePath) => {
    if (!imagePath) {
      return "https://via.placeholder.com/150";
    }
    if (imagePath.startsWith("F:\\") || imagePath.startsWith("D:\\")) {
      return `https://smfteapi.salesmate.app/Media/Products_Images/${imagePath.split("\\").pop()}`;
    }
    return imagePath;
  };

  const renderSkeleton = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonBackgroundLogo}>
        <Image
          source={require("../assets/frankoIcon.png")}
          style={styles.skeletonLogo}
        />
      </View>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonText} />
      <View style={[styles.skeletonText, styles.skeletonTextShort]} />
    </View>
  );

  const renderItem = ({ item }) => {
    const productImageURL = getValidImageURL(item.productImage);
    const discount =
      item.oldPrice > 0
        ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)
        : 0;

    return (
      <TouchableOpacity
        style={[styles.productCard]}
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
          {item.oldPrice > 0 && (
            <Text style={styles.oldPrice}>{formatPrice(item.oldPrice)}</Text>
          )}
        </View>
        <View style={styles.showroomButtonContainer}>
          <TouchableOpacity style={styles.showroomButton}>
            <Text style={styles.showroomButtonText}>{item.showRoomName}</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={require("../assets/frankoIcon.png")}
          style={styles.frankoLogo}
        />
      </TouchableOpacity>
    );
  };


  if (loading && recentProducts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Featured Products</Text>
        <FlatList
          data={Array.from({ length: 4 })}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderSkeleton}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="storefront" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.title}>Featured Products</Text>
      </View>
      <FlatList
        data={recentProducts}
        keyExtractor={(item) => item.productID?.toString() || Math.random().toString()}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity
        style={styles.shopNowButton}
        onPress={() => navigation.navigate("Products")}
      >
        <Ionicons name="cart" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.shopNowText}>Shop Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    marginBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  row: {
    justifyContent: "space-between",
  },
  productCard: {
    flex: 1,
    margin: 8,
    padding: 12,
    borderRadius: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    maxWidth: "48%",
    transform: [{ scale: 1 }],
  },
  productCardHovered: {
    transform: [{ scale: 1.05 }],
  },
  imageContainer: {
    position: "relative",
    marginBottom: 8,
  },
  productImage: {
    width: "100%",
    height: 120,
    resizeMode: "contain",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#D72638",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 12,
  },
  discountText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  productName: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
   
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  productPrice: {
    fontSize: 14,
    color: 'red',
    fontWeight: 'bold',
  },
  oldPrice: {
    fontSize: 12,
    color: "#aaa",
    textDecorationLine: "line-through",
  },
  frankoLogo: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  showroomButtonContainer: {
    marginBottom: 12,
  },
  showroomButton: {
    alignSelf: "flex-start",
    backgroundColor: "#28a745",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  showroomButtonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  buttonIcon: {
    marginRight: 5,
  },
  shopNowButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D72638",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  buttonIcon: {
    marginRight: 5,
  },
  shopNowText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
 
});
