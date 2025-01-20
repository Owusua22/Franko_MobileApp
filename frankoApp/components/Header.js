import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TextInput, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { loadCart } from '../redux/slice/cartSlice'; // Adjust path as needed
import SearchModal from './SearchModal'; // Import SearchModal component

const Header = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { totalItems, cart } = useSelector((state) => state.cart);

  const [isSearchModalVisible, setSearchModalVisible] = useState(false);

  // Load the cart on the initial render
  useEffect(() => {
    if (!cart || cart.length === 0) {
      dispatch(loadCart());
    }
  }, [dispatch, cart]);

  const handleLogoPress = () => {
    navigation.navigate('Home');
  };

  const toggleDrawer = () => {
    if (navigation.canGoBack()) {
      navigation.dispatch(DrawerActions.toggleDrawer());
    }
  };

  const openSearchModal = () => {
    setSearchModalVisible(true);
  };

  const closeSearchModal = () => {
    setSearchModalVisible(false);
  };

  return (
    <View style={styles.headerContainer}>
      {/* Left: Drawer Icon */}
      <TouchableOpacity onPress={toggleDrawer} style={styles.iconWrapper}>
        <Icon name="bars" size={20} color="#000" />
      </TouchableOpacity>

      {/* Middle: Logo */}
      <TouchableOpacity onPress={handleLogoPress} style={styles.logoWrapper}>
        <Image
          source={require('../assets/frankoIcon.png')}
          style={styles.logo}
        />
      </TouchableOpacity>

      {/* Middle: Search Bar */}
      <TouchableOpacity onPress={openSearchModal} style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for products..."
          editable={false} // Non-editable, handled in modal
        />
      </TouchableOpacity>

      {/* Right: User and Cart Icons */}
      <View style={styles.iconsContainer}>
        

        {/* Cart Icon */}
        <TouchableOpacity onPress={() => navigation.navigate('cart')}>
          <View style={styles.cartIconContainer}>
            <Icon name="shopping-cart" size={30} color="#000" />
            {totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalItems}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Search Modal */}
      <SearchModal visible={isSearchModalVisible} onClose={closeSearchModal} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    height: 70,
    marginTop: 15,
  },
  iconWrapper: {
    padding: 5,
  },
  logoWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
  },
  searchContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    width: '90%',
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    borderColor: '#ddd',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  icon: {
    marginHorizontal: 10,
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Header;
