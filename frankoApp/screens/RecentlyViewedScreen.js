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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

const RecentlyViewedScreen = () => {
  const navigation = useNavigation();
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        const storedProducts = await AsyncStorage.getItem("recentProducts");
        if (storedProducts) {
          const parsedProducts = JSON.parse(storedProducts);
          setRecentlyViewed(Array.isArray(parsedProducts) ? parsedProducts : []);
        } else {
       
        }
      } catch (error) {
       
      }
      setLoading(false);
    };
  
    fetchRecentlyViewed();
  }, []);
  

  const formatPrice = (price) =>
    price ? price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) : "0.00";
  
  const calculateDiscount = (oldPrice, price) => {
    return oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  };

  const getValidImageURL = (imagePath) => {
    if (!imagePath) {
      return "https://via.placeholder.com/150";
    }
    return `https://smfteapi.salesmate.app/Media/Products_Images/${imagePath.split("\\").pop()}`;
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00cc66" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Recently Viewed</Text>
      </View>

      {/* Product List */}
      <FlatList
        data={recentlyViewed}
        keyExtractor={(item, index) => (item?.productID ? item.productID.toString() : index.toString())}

        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const discount = calculateDiscount(item.oldPrice, item.price);
          const productImageURL = getValidImageURL(item.productImage);

          return (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => navigation.navigate("ProductDetails", { productId: item.productID })}
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
                <Text style={styles.currentPrice}>₵{formatPrice(item.price)}</Text>
                {item.oldPrice > 0 && (
                  <Text style={styles.oldPrice}>₵{formatPrice(item.oldPrice)}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginBottom: "90"
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16A34A",
    padding: 3,
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
 
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 10,
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
    maxWidth: "48%",
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
    top: 8,
    left: 8,
    backgroundColor: "#FF0000",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 20,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  productName: {
    fontSize: 12,
    fontWeight: "bold",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
   
  },
  currentPrice: {
    color: "#FF0000",
    fontWeight: "bold",
    fontSize: 12,
  },
  oldPrice: {
    textDecorationLine: "line-through",
    marginLeft: 5,
    color: "#888",
   
    fontSize: 10,
  },
});
export default RecentlyViewedScreen;