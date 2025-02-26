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
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { fetchProductsByCategory } from "../redux/slice/productSlice";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; 
import frankoLogo from "../assets/frankoIcon.png"; 

const screenWidth = Dimensions.get("window").width;
const hardcodedCategoryId = "b51e02c2-540a-484a-9307-392fac7b50ed"

const TelevisionComponent = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { productsByCategory = {}, loading } = useSelector((state) => state.products);
  const [imageLoading, setImageLoading] = useState({});
  const containerRef = useRef(null);

  useEffect(() => {
    dispatch(fetchProductsByCategory(hardcodedCategoryId));
  }, [dispatch]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amount);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.skeletonShowroom}>
          <View style={styles.skeletonHeader} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productList}>
            {[...Array(6)].map((_, i) => (
              <View key={i} style={styles.skeletonCard}>
                <Image source={frankoLogo} style={styles.frankoLogo} />
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.showroomContainer}>
          {/* Showroom Header */}
          <View style={styles.showroomHeader}>
            <Text style={styles.showroomTitle}>🛍️ Smart Televisions</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Television")}>
              <Text style={styles.viewMoreText}>
                View All <Icon name="arrow-right" size={16} color="#fff" />
              </Text>
            </TouchableOpacity>
          </View>

          {/* Product List */}
          <ScrollView
            horizontal
            ref={containerRef}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          >
            {loading ? (
              [...Array(6)].map((_, index) => (
                <View key={index} style={styles.skeletonCard}>
                  <Image source={frankoLogo} style={styles.frankoLogo} />
                </View>
              ))
            ) : productsByCategory[hardcodedCategoryId]?.length > 0 ? (
              productsByCategory[hardcodedCategoryId].slice(0, 10).map((product) => (
                <TouchableOpacity
                  key={product.productID}
                  style={styles.productCard}
                  onPress={() => navigation.navigate("ProductDetails", { productId: product.productID })}
                >
                  {product.oldPrice > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>
                        {`${Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF`}
                      </Text>
                    </View>
                  )}

                  <View style={styles.imageContainer}>
                    {imageLoading[product.productID] ? (
                      <ActivityIndicator size="large" color="#ccc" />
                    ) : (
                      <Image
                        source={{
                          uri: `https://smfteapi.salesmate.app/Media/Products_Images/${product.productImage.split("\\").pop()}`,
                        }}
                        style={styles.productImage}
                        onLoad={() => setImageLoading((prev) => ({ ...prev, [product.productID]: false }))}
                        onError={() => setImageLoading((prev) => ({ ...prev, [product.productID]: true }))}
                      />
                    )}
                  </View>

                  <Text style={styles.productName} numberOfLines={1}>
                    {product.productName}
                  </Text>
                  <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
                  {product.oldPrice > 0 && <Text style={styles.oldPrice}>{formatCurrency(product.oldPrice)}</Text>}
                </TouchableOpacity>
              ))
            ) : (
              [...Array(6)].map((_, index) => (
                <View key={index} style={styles.skeletonCard}>
                  <Image source={frankoLogo} style={styles.frankoLogo} />
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}

    
    </View>
  );
};

export default TelevisionComponent;

const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: "#fff" },
  
  showroomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#16A34A",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  showroomTitle: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  viewMoreText: { color: "#fff", fontSize: 12, fontWeight: "500" },
  productList: { flexDirection: "row", marginTop: 10 },
  productCard: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    width: 150,
    marginRight: 8,
    marginLeft: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    marginBottom: 10,
  },
  imageContainer: { height: 120, justifyContent: "center", alignItems: "center" },
  productImage: { width: "100%", height: "100%", resizeMode: "contain", borderRadius: 8 },
  productName: { fontWeight: "bold", fontSize: 12, marginTop: 6, color: "#333" },
  productPrice: { color: "#E63946", fontSize: 12, fontWeight: "bold", marginTop: 4 },
  oldPrice: { textDecorationLine: "line-through", color: "gray", fontSize: 10 },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#E63946",
    padding: 6,
    borderRadius: 5,
    zIndex: 1,
  },
  discountText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  shopNowButton: {
    backgroundColor: "#E63946",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 10,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 8,
  },
  shopNowText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  skeletonShowroom: { marginBottom: 10 },
  skeletonHeader: { height: 30, backgroundColor: "#f0f0f0", borderRadius: 8, marginBottom: 8 },
  skeletonCard: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 12,
    width: 150,
    height: 140,
    marginRight: 8,
    marginLeft: 10,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  
  frankoLogo: {
    width: 50, // Increase size
    height: 50,
    resizeMode: "contain",
    position: "absolute",
    opacity: 0.15, // Reduce opacity to make it a watermark
  },
  
});
