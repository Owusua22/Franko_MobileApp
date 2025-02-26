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
import { fetchProductByShowroomAndRecord } from "../redux/slice/productSlice";
import { fetchHomePageShowrooms } from "../redux/slice/showroomSlice";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; 

const screenWidth = Dimensions.get("window").width;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amount);
};

const ComboComponent = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { homePageShowrooms } = useSelector((state) => state.showrooms);
  const { productsByShowroom, loading } = useSelector((state) => state.products);

  const [imageLoading, setImageLoading] = useState({});
  const containerRefs = useRef({});

  useEffect(() => {
    dispatch(fetchHomePageShowrooms());
  }, [dispatch]);

  useEffect(() => {
    if (homePageShowrooms?.length > 0) {
      homePageShowrooms.forEach((showroom) => {
        dispatch(fetchProductByShowroomAndRecord({ showRoomCode: showroom.showRoomID, recordNumber: 10 }));
      });
    }
  }, [dispatch, homePageShowrooms]);

  return (
    <View style={styles.container}>
      {homePageShowrooms?.length > 0 ? (
        homePageShowrooms.map((showroom) => (
          <View key={showroom.showRoomID} style={styles.showroomContainer}>
            <View style={styles.showroomHeader}>
              <Text style={styles.showroomTitle}>🔥 {showroom.showRoomName}</Text>
              <TouchableOpacity onPress={() => navigation.navigate("showroom", { showRoomID: showroom.showRoomID })}>
  <Text style={styles.viewMoreText}>
    View More <Icon name="arrow-right" size={16} color="#fff" />
  </Text>
</TouchableOpacity>

            </View>

            <ScrollView
              horizontal
              ref={(el) => (containerRefs.current[showroom.showRoomID] = el)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productList}
            >
              {loading ? (
                [...Array(6)].map((_, index) => (
                  <View key={index} style={styles.skeletonCard}>
                    <View style={styles.skeletonImage} />
                    <View style={styles.skeletonText} />
                    <View style={styles.skeletonTextSmall} />
                  </View>
                ))
              ) : productsByShowroom?.[showroom.showRoomID]?.length > 0 ? (
                productsByShowroom[showroom.showRoomID].slice(0, 10).map((product) => (
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

                    <Text style={styles.productName} numberOfLines={1}>{product.productName}</Text>
                    <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
                    {product.oldPrice > 0 && <Text style={styles.oldPrice}>{formatCurrency(product.oldPrice)}</Text>}
                  </TouchableOpacity>
                  
                ))

              ) : (
                <Text style={styles.noProductsText}>No products found.</Text>
              )}
            </ScrollView>

        
          </View>
           
        ))
      ) : (
        <Text style={styles.noShowroomsText}>No showrooms available.</Text>
      )}
<TouchableOpacity style={styles.shopNowButton} onPress={() => navigation.navigate("Products")}>
  <View style={styles.buttonContent}>
    <Icon name="cart-outline" size={20} color="#fff" style={styles.icon} />
    <Text style={styles.shopNowText}>Shop Now</Text>
  </View>
</TouchableOpacity>


    </View>
  );
};

export default ComboComponent;

const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: "#fff" , marginBottom: 50},
  showroomContainer: { marginBottom: 10 },
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
    transform: [{ scale: 1 }],
    marginBottom: 10
  },
  imageContainer: { height: 120, justifyContent: "center", alignItems: "center" },
  productImage: { width: "100%", height: "100%", resizeMode: "contain", borderRadius: 8 },
  productName: { fontWeight: "bold", fontSize: 12, marginTop: 6, color: "#333" },
  productPrice: { color: "#E63946", fontSize: 12, fontWeight: "bold", marginTop: 4 },
  oldPrice: { textDecorationLine: "line-through", color: "gray", fontSize: 10 },
  noProductsText: { color: "#555", marginTop: 10 },
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
  noShowroomsText: { textAlign: "center", marginTop: 20, color: "#444", fontSize: 14 },
  shopNowButton: {
    backgroundColor: "#E63946",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row", // Makes items appear in a row
    marginBottom: 10,
  },
  buttonContent: {
    flexDirection: "row", // Aligns icon and text in a row
    alignItems: "center",
  },
  icon: {
    marginRight: 8, // Space between icon and text
  },
  shopNowText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
