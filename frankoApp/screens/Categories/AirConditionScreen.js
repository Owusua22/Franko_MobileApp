import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../redux/slice/categorySlice";
import { fetchProductsByCategory } from "../../redux/slice/productSlice";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

const AirConditionScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.categories
  );
  const { productsByCategory = {}, loading: productsLoading } = useSelector(
    (state) => state.products
  );
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (!categories.length) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  useEffect(() => {
    if (categories.length) {
      categories.forEach((category) => {
        if (!productsByCategory[category.categoryId]) {
          dispatch(fetchProductsByCategory(category.categoryId));
        }
      });
    }
  }, [dispatch, categories, productsByCategory]);

  useEffect(() => {
    const products =
      productsByCategory["db54033b-e95d-4a6c-8744-45e4d462c19e"] || [];
    const sortedProducts = products
      .slice()
      .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
    setFilteredProducts(sortedProducts);
  }, [productsByCategory]);

  const formatPrice = (amount) =>
    amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const getValidImageURL = (imagePath) => {
    if (!imagePath) {
      return "https://via.placeholder.com/150";
    }
    return `https://smfteapi.salesmate.app/Media/Products_Images/${imagePath
      .split("\\")
      .pop()}`;
  };

  if (categoriesLoading || productsLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00cc66" />
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const productImageURL = getValidImageURL(item.productImage);
    const discount =
      item.oldPrice > 0
        ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)
        : 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() =>
          navigation.navigate("ProductDetails", { productId: item.productID })
        }
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: productImageURL }} style={styles.productImage} />
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          )}
        </View>
        <Text style={styles.productName} numberOfLines={1}>
          {item.productName}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>₵{formatPrice(item.price)}</Text>
          {item.oldPrice > 0 && (
            <Text style={styles.oldPrice}>{formatPrice(item.oldPrice)}</Text>
          )}
        </View>
        <View style={styles.showroomButtonContainer}>
          <TouchableOpacity style={styles.showroomButton}>
            <Text style={styles.showroomButtonText}>{item.brandName}</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={require("../../assets/frankoIcon.png")}
          style={styles.frankoLogo}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.productID}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <TouchableOpacity
             onPress={() => navigation.goBack()}
              style={{ marginRight: 16 }}

            >
              <AntDesign name="arrowleft" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Aircondition</Text>
          </View>
        )}
        renderItem={renderItem}
      />
    </View>
  );
};

// ✅ Fixed: Missing closing `}` before `const styles`
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    marginBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00cc66",
    padding: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
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
  },
  imageContainer: {
    position: "relative",
    marginBottom: 6,
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
    justifyContent: "space-between",
    marginTop: 2,
  },
  productPrice: {
    fontSize: 14,
    color: "red",
    fontWeight: "bold",
  },
  oldPrice: {
    fontSize: 10,
    color: "#aaa",
    textDecorationLine: "line-through",
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
  frankoLogo: {
    position: "absolute",
    bottom: 1,
    right: 2,
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
});

export default AirConditionScreen;
