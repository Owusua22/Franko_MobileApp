import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const brands = [
  { id: '760af684-7a19-46ab-acc5-7445ef32073a', logo: require('../assets/samsung.png'), name: 'Samsung' },
  { id: 'c163ee86-1d24-4c97-943b-1f82a09c6066', logo: require('../assets/infinix.png'), name: 'Infinix' },
  { id: 'fb694e59-77be-455f-9573-acf917ffb39d', logo: require('../assets/hmd.png'), name: 'HMD' },
  { id: '86cca959-70a4-448e-86f1-3601309f49a6', logo: require('../assets/tecno-logo.png'), name: 'Tecno' },
  { id: '5c6cf9ae-d44f-42a9-82e5-c82bbf6913cd', logo: require('../assets/apple.jpeg'), name: 'Apple' },
  { id: 'd643698d-f794-4d33-9237-4a913aa463a2', logo: require('../assets/huawel.jpeg'), name: 'Huawei' },
];

const BrandCard = React.memo(({ brand }) => {
  const navigation = useNavigation(); // Use navigation inside BrandCard

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Brands', { brandId: brand.id })}
      style={styles.brandCard}
    >
      <Image source={brand.logo} style={styles.brandImage} resizeMode="contain" />
    </TouchableOpacity>
  );
});

export default function ShopByBrandsBanner() {
  const [showArrows, setShowArrows] = useState(false);
  const scrollViewRef = useRef(null);
  const { width } = Dimensions.get('window');

  useEffect(() => {
    setShowArrows(brands.length * 120 > width); // 120px per brand card
  }, [width]);

  const scrollBy = (direction) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: direction === 'left' ? -200 : 200,
        animated: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.title}>Exclusive Brand Partners</Text>
        <View style={styles.scrollContainer}>
          {showArrows && (
            <>
              <TouchableOpacity style={styles.arrowLeft} onPress={() => scrollBy('left')}>
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.arrowRight} onPress={() => scrollBy('right')}>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </>
          )}
          <ScrollView
            horizontal
            ref={scrollViewRef}
            showsHorizontalScrollIndicator={false}
            style={styles.scrollView}
          >
            {brands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
    backgroundColor: '#f0f0f0',
  },
  banner: {
    backgroundColor: '#28a745',
    borderRadius: 10,
    padding: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  scrollContainer: {
    position: 'relative',
  },
  scrollView: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  brandCard: {
    width: 80, // Reduced width
    height: 60, // Reduced height
    marginRight: 8, // Adjusted spacing
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6, // Slightly smaller radius
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  brandImage: {
    width: 60, // Smaller width
    height: 40, // Smaller height
  },
  arrowLeft: {
    position: 'absolute',
    left: -10,
    top: '40%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  arrowRight: {
    position: 'absolute',
    right: -10,
    top: '40%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 6,
    borderRadius: 20,
    zIndex: 10,
  },
});
