import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo'; 
import Icon from "react-native-vector-icons/MaterialIcons";
const screenWidth = Dimensions.get('window').width;

export default function ProductsScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { products, status, error } = useSelector((state) => state.products);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isOnline, setIsOnline] = useState(true); // Network status state

  // Check network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch products from state if online
  useEffect(() => {
    if (isOnline) {
      const sortedProducts = [...products].sort(
        (a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)
      );
      setFilteredProducts(sortedProducts);
    }
  }, [dispatch, isOnline, products]);

  useEffect(() => {
    if (minPrice !== '' || maxPrice !== '') {
      const filtered = products.filter((item) => {
        const price = item.price;
        return (
          (minPrice ? price >= parseFloat(minPrice) : true) &&
          (maxPrice ? price <= parseFloat(maxPrice) : true)
        );
      });
      setFilteredProducts(filtered);
    } else {
      const sortedProducts = [...products].sort(
        (a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)
      );
      setFilteredProducts(sortedProducts);
    }
  }, [minPrice, maxPrice, products]);

  const resetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    const sortedProducts = [...products].sort(
      (a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)
    );
    setFilteredProducts(sortedProducts);
  };

  const formatPrice = (price) => {
    if (isNaN(price)) {
      return 'Invalid Price';
    }
    return price.toLocaleString('en-GH', {
      style: 'currency',
      currency: 'GHS',
    });
  };

  const renderItem = ({ item }) => { 
    const getValidImageURL = (imagePath) => {
      if (!imagePath) {
        return 'https://via.placeholder.com/150'; 
      }
      if (imagePath.startsWith('F:\\') || imagePath.startsWith('D:\\')) {
        return `https://smfteapi.salesmate.app/Media/Products_Images/${imagePath.split('\\').pop()}`;
      }
      return imagePath;
    };

    const productImageURL = getValidImageURL(item.productImage);
    const discount = item.oldPrice > 0 ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100) : 0;

    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => navigation.navigate('ProductDetails', { productId: item.productID })}
      >
        <Image
          source={{ uri: productImageURL }}
          style={styles.productImage}
          resizeMode="contain"
        />
        {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{`${discount}% OFF`}</Text>
            </View>
          )}
        <Text style={styles.productName} numberOfLines={1}>{item.productName}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          {item.oldPrice > 0 && (
            <Text style={styles.oldPrice}>{formatPrice(item.oldPrice)}</Text>
          )}
          
        </View>
      </TouchableOpacity>
    );
  };

  if (status === 'loading' && isOnline) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6347" />
        <Text style={styles.loadingText}>Loading Products...</Text>
      </View>
    );
  }

  if (status === 'failed' && !isOnline) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No internet connection. Using cached data.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="red" />
        </TouchableOpacity>
        <Text style={styles.heading}>Products</Text>
      </View>

      <View style={styles.filterContainer}>
        <TextInput
          style={styles.input}
          placeholder="Min Price"
          keyboardType="numeric"
          value={minPrice}
          onChangeText={setMinPrice}
        />
        <Text style={styles.dash}>-</Text>
        <TextInput
          style={styles.input}
          placeholder="Max Price"
          keyboardType="numeric"
          value={maxPrice}
          onChangeText={setMaxPrice}
        />
        <TouchableOpacity onPress={() => {}}>
          <MaterialIcons name="filter-list" size={28} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={resetFilters}>
          <MaterialCommunityIcons name="filter-remove" size={28} color="#ff0000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.productID.toString()}
        renderItem={renderItem}
        numColumns={screenWidth > 600 ? 3 : 2}
        contentContainerStyle={styles.productList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: screenWidth > 600 ? 20 : 10,
    paddingVertical: 10,
    backgroundColor: '#f7f7f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    marginRight: 10,
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: "#ff6347",
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    width: '40%',
    paddingLeft: 8,
    fontSize: 16,
  },
  dash: {
    marginHorizontal: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  productItem: {
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
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center', // Center the image horizontally
  },
  productName: {
    fontSize: screenWidth > 600 ? 16 : 14,
  
    marginTop: 10,
   
  },

  discountBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#D72638',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 12,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 13,
    color: '#D72638',
    
  },
  oldPrice: {
    fontSize: 10,
    color: '#aaa',
    textDecorationLine: 'line-through',
  },
  productList: {
    paddingBottom: 20,
  },
});
