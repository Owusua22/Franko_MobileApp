import React from 'react';
import { View, Dimensions, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';


const { width, height } = Dimensions.get('window');

const CarouselComponent = () => {
  const carouselItems = [
    { id: '1', image: require('../assets/newbanner.jpg'), title: 'shop now' },
    { id: '2', image: require('../assets/sama16.jpg'), title: 'shop now' },
    { id: '3', image: require('../assets/sam.jpg'), title: 'shop now' },
  ];

  const handleShopNow = (title) => {
    console.log(`Shopping for ${title}`);
  };
  return (
    <View style={styles.container}>
      <Swiper
        style={styles.wrapper}
        autoplay
        autoplayTimeout={5}
        loop
        dotColor="#fff"
        activeDotColor="#ff6347"
        removeClippedSubviews={false} // Improves performance on Android
      >
        {carouselItems.map((item) => (
          <View key={item.id} style={styles.card}>
            <Image source={item.image} style={styles.image} />
            
           
          </View>
        ))}
      </Swiper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapper: {
    height: 200,
  },
  card: {
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
  },
  title: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonGroup: {
    flexDirection: 'row',
    marginTop: 15,
  },
  shopButton: {
    backgroundColor: '#ff6347',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  buyButton: {
    backgroundColor: '#32cd32', // Green color for the "Buy Now" button
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CarouselComponent;
