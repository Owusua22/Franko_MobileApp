import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,

} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsByBrand , clearProducts} from '../redux/slice/productSlice';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
const screenWidth = Dimensions.get('window').width;

const BrandScreen = () => {
  const route = useRoute();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const brandId = route.params?.brandId || null;
  const productsState = useSelector((state) => state.products || { products: [], loading: false });
  const brandsState = useSelector((state) => state.brands || { brands: [], loading: false });
  const [selectedBrandId, setSelectedBrandId] = useState(brandId);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200000);

  const scrollPositionRef = useRef(0);
  const flatListRef = useRef(null);
  const onScroll = async (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollPositionRef.current = offsetY;
    await AsyncStorage.setItem(`scrollPosition_${brandId}`, JSON.stringify(offsetY));
  };
  

  // Fetch brands and products when brandId changes
  useFocusEffect(
    useCallback(() => {
      const restoreScrollPosition = async () => {
        const savedPosition = await AsyncStorage.getItem(`scrollPosition_${brandId}`);
        if (savedPosition !== null && flatListRef.current) {
          flatListRef.current.scrollToOffset({
            offset: JSON.parse(savedPosition),
            animated: false,
          });
        }
      };
  
      dispatch(clearProducts());
      dispatch(fetchProductsByBrand(brandId)).then(() => {
        restoreScrollPosition();
      });
  
      return () => {
        AsyncStorage.removeItem(`scrollPosition_${brandId}`);
      };
    }, [brandId, dispatch])
  );
  
  // Restore scroll position when products update
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset?.({
        offset: scrollPositionRef.current || 0,
        animated: false,
      });
    }
  }, [productsState.products]);
  
  
  

  const selectedBrand = brandsState.brands?.find((brand) => brand.brandId === brandId) || {};

  const relatedBrands = selectedBrand?.categoryId
  ? brandsState.brands.filter((brand) => brand.categoryId === selectedBrand.categoryId)
  : [];
  const handleNavigateProduct = (productId) => {
    // Store scroll position correctly
    scrollPositionRef.current = scrollPositionRef.current || 0;
  
    navigation.navigate('ProductDetails', { productId, brandId });
  };
  

  const formatPrice = (price) =>
    price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const renderProduct = ({ item }) => {
    const discount =
      item.oldPrice > item.price
        ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)
        : 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleNavigateProduct(item.productID)}
      >
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{`${discount}% OFF`}</Text>
          </View>
        )}
        <Image
          source={{
            uri: item.productImage?.startsWith('F:\\') || item.productImage?.startsWith('D:\\')
              ? `https://smfteapi.salesmate.app/Media/Products_Images/${item.productImage.split('\\').pop()}`
              : item.productImage || 'https://via.placeholder.com/150',
          }}
          style={styles.productImage}
          resizeMode="contain"
        />
        <Text style={styles.productName} numberOfLines={1}>
          {item.productName}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>{`₵${formatPrice(item.price)}`}.00</Text>
          {item.oldPrice > 0 && (
            <Text style={styles.oldPrice}>{`₵${formatPrice(item.oldPrice)}`}</Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={20} color="#e63946" />
        </TouchableOpacity>
        <Text style={styles.heading}>
          {selectedBrand ? `${selectedBrand.brandName}` : 'Brand Products'}
        </Text>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterHeading}>Related Brands</Text>
        <FlatList
          horizontal
          data={relatedBrands}
          keyExtractor={(item) => item.brandId.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.brandBadge,
                item.brandId === brandId && styles.activeBrandBadge,
              ]}
             onPress={() => {
  setSelectedBrandId(item.brandId);
  navigation.navigate('Brands', { brandId: item.brandId });
}}

            >
              <Text
                style={[
                  styles.brandText,
                  item.brandId === brandId && styles.activeBrandText,
                ]}
              >
                {item.brandName}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.priceFilterSection}>
        <TextInput
          style={styles.priceInput}
          placeholder="Min Price"
          keyboardType="number-pad"
          value={minPrice.toString()}
          onChangeText={(text) => setMinPrice(Number(text))}
        />
        <Text style={styles.priceSeparator}>-</Text>
        <TextInput
          style={styles.priceInput}
          placeholder="Max Price"
          keyboardType="number-pad"
          value={maxPrice.toString()}
          onChangeText={(text) => setMaxPrice(Number(text))}
        />
        <TouchableOpacity style={styles.filterButton}>
          <AntDesign name="filter" size={20} color="#fff" />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {productsState.loading ? (
        <ActivityIndicator size="large" color="#ff6347" style={styles.loader} />
      ) : productsState.products.length === 0 ? (
        <View style={styles.noProductsContainer}>
          <AntDesign name="closecircleo" size={50} color="#e63946" />
          <Text style={styles.noProductsText}>No products found</Text>
        </View>
      ) : (
        <FlatList
        ref={flatListRef}
        data={productsState.products}
        keyExtractor={(item) => item.productID.toString()}
        renderItem={renderProduct}
        numColumns={2}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />
      
      
      
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: screenWidth > 600 ? 20 : 10,
   
    backgroundColor: '#f7f7f7',
 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    
  },
  backButton: {
    marginRight: 8,
  },
  heading:{
     fontSize: 14, fontWeight: "bold", marginLeft: 10, color: "#e63946" 
  
  },
    filterSection: {
      marginBottom: 16,
    },
    filterHeading: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    brandBadge: {
      backgroundColor: '#f1f1f1',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 8,
    },
    activeBrandBadge: {
      backgroundColor: '#ff6347',
    },
    brandText: {
      fontSize: 14,
      color: '#333',
    },
    activeBrandText: {
      color: '#fff',
    },
    priceFilterSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    priceInput: {
      flex: 1,
      backgroundColor: '#fff',
      padding: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#ddd',
      marginRight: 8,
    },
    priceSeparator: {
      fontSize: 10,
      marginHorizontal: 8,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#ff6347',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
    },
    filterButtonText: {
      color: '#fff',
      marginLeft: 8,
    },
    productList: {
      paddingBottom: 16,
    },
    productCard: {
      flex: 1,
      margin: 8,
      padding: 10,
      borderRadius: 10,
      backgroundColor: '#fff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.8,
      shadowRadius: 2,
      elevation: 5,
      maxWidth: '48%',
    },
    discountBadge: {
      position: 'absolute',
      top: 10,
      left: 10,
      backgroundColor: '#ff6347',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      zIndex: 10, // Ensures it stays on top of the product image
    },
    discountText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
    },
    productImage: {
      width: '100%',
      height: 150,
      borderRadius: 10,
      zIndex: 1, // Ensure image stays behind the discount badge
    },
    
    productName: {
      fontSize: 12,
      fontWeight: 'bold',
      marginTop: 10,
     
      
    },
    priceContainer: {
      flexDirection: 'row',
      
    },
    productPrice: {
      fontSize: 12,
      color: 'red',
      fontWeight: 'bold',
    },
    oldPrice: {
      fontSize: 10,
      color: '#777',
      textDecorationLine: 'line-through',
      marginLeft: 8,
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
      marginBottom: 10,
    },
    showroomButtonText: {
      color: "#fff",
      fontSize: 10,
      fontWeight: "bold",
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
    },
    errorText: {
      color: '#ff0000',
      textAlign: 'center',
      marginVertical: 20,
    },
  
    noProductsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    noProductsText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#e63946',
      marginTop: 10,
    },
  });

export default BrandScreen;