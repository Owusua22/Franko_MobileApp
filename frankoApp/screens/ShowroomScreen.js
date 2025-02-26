import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  TextInput,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsByShowroom } from "../redux/slice/productSlice";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;

const ShowroomScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute(); 
  const { showRoomID, showRoomName, showRoomLogo } = route.params || {};

  const { productsByShowroom = {}, loading } = useSelector((state) => state.products);

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200000);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (showRoomID) {
      dispatch(fetchProductsByShowroom(showRoomID));
    }
  
    const restoreScrollPosition = async () => {
      try {
        const savedPosition = await AsyncStorage.getItem(`scrollPosition-${showRoomID}`);
        if (savedPosition !== null && flatListRef.current) {
          setTimeout(() => {
            flatListRef.current?.scrollToOffset({ 
              offset: parseFloat(savedPosition), 
              animated: false 
            });
          }, 500); // Small delay to ensure FlatList is ready
        }
      } catch (error) {
        console.error("Failed to load scroll position:", error);
      }
    };
  
    restoreScrollPosition();
  }, [dispatch, showRoomID]);
  
  

  const filteredProducts = (productsByShowroom[showRoomID] || [])
    .filter((product) => product.price >= minPrice && product.price <= maxPrice)
    .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

  const formatPrice = (price) =>
    price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

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
        <Text style={styles.title}>Showroom</Text>
        <Image source={{ uri: showRoomLogo }} style={styles.showroomLogo} />
      </View>

      {/* Price Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Filter by Price</Text>
        <View style={styles.filterInputs}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={minPrice.toString()}
            onChangeText={(text) => setMinPrice(Number(text))}
            placeholder="Min Price"
          />
          <Text>-</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={maxPrice.toString()}
            onChangeText={(text) => setMaxPrice(Number(text))}
            placeholder="Max Price"
          />
          <TouchableOpacity style={styles.filterButton}>
            <AntDesign name="filter" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Product List */}
      <FlatList
        ref={flatListRef}
        data={filteredProducts}
        keyExtractor={(item) => item.productID.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        onScrollEndDrag={async (event) => {
          try {
            const scrollPosition = event.nativeEvent.contentOffset.y;
            await AsyncStorage.setItem(`scrollPosition-${showRoomID}`, scrollPosition.toString());
          } catch (error) {
            console.error("Failed to save scroll position:", error);
          }
        }}
        
        renderItem={({ item }) => {
          const discount = calculateDiscount(item.oldPrice, item.price);
          const productImageURL = getValidImageURL(item.productImage);

          return (
            <TouchableOpacity
              style={styles.productCard}
              onPress={async () => {
                try {
                  const scrollPosition = await AsyncStorage.getItem(`scrollPosition-${showRoomID}`);
                  await AsyncStorage.setItem(`scrollPosition-${showRoomID}`, scrollPosition || "0");
                } catch (error) {
                  console.error("Failed to save scroll position:", error);
                }

                navigation.navigate("ProductDetails", { productId: item.productID });
              }}
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
              <Image source={require("../assets/frankoIcon.png")} style={styles.frankoLogo} />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default ShowroomScreen;




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  filterContainer: {
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#008000",
  },
  filterInputs: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    width: 80,
  },
  filterButton: {
    marginLeft: 8,
    backgroundColor: "#FF0000",
    padding: 10,
    borderRadius: 8,
  },
  listContainer: {
    paddingBottom: 20,
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
    transform: [{ scale: 1 }],
    maxWidth: "48%"
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
    marginBottom: 20
  },
  currentPrice: {
    color: "#FF0000",
    fontWeight: "bold",
    fontSize: 12
  },
  oldPrice: {
    textDecorationLine: "line-through",
    marginLeft: 5,
    color: "#888",
    marginBottom: 10,
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