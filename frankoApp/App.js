import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, ActivityIndicator, Image, StatusBar as RNStatusBar, Platform, Alert, Linking } from 'react-native';
import { StatusBar } from "expo-status-bar";
import { Provider, useDispatch } from 'react-redux';
import { store } from './redux/store';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Application from "expo-application";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadWishlistFromStorage } from "./redux/wishlistSlice";

// Screens
import HomeScreen from './screens/HomeScreen';
import ProductDetailsScreen from './screens/ProductDetailsScreen';
import CartScreen from './screens/CartScreen';
import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import AccountScreen from './screens/AccountScreen';
import CategoryScreen from './screens/CategoryScreen';
import BrandScreen from './screens/BrandScreen';
import ShopScreen from './screens/ShopScreen';
import OrderReceivedScreen from './screens/OrderReceivedScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import ProductsScreen from './screens/ProductsScreen';
import PaymentGatewayScreen from './screens/PaymentGatewayScreen';
import OrderPlacedScreen from './screens/OrderPlacedScreen';
import ShowroomScreen from './screens/ShowroomScreen';
import PhoneScreen from './screens/Categories/PhoneScreen';
import SpeakerScreen from './screens/Categories/SpeakerScreen';
import AccessoriesScreen from './screens/Categories/AccessoriesScreen';
import ComputerScreen from './screens/Categories/ComputerScreen';
import TelevisionScreen from './screens/Categories/TelevisionScreen';
import FanScreen from './screens/Categories/FanScreen';
import AirConditionScreen from './screens/Categories/AirConditionScreen';
import ComboScreen from './screens/Categories/ComboScreen';
import ApplianceScreen from './screens/Categories/ApplianceScreen';
import FridgeScreen from './screens/Categories/FridgeScreen';
import RecentlyViewedScreen from './screens/RecentlyViewedScreen';
import CustomerServiceScreen from './screens/CustomerService';
import InviteScreen from './screens/InviteScreen';
import AddressManagementScreen from './screens/AddressManagementScreen';
import SearchScreen from './screens/SearchScreen';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import AboutScreen from './screens/AboutScreen';
import FAQScreen from './screens/FAQScreen';
import OrderCancellationScreen from './screens/OrderCancellationScreen';
import MachineScreen from './screens/Categories/MachineScreen';
import TermsScreen from './screens/TermsScreen';
import FloatingTawkChat from './components/FloatingTawkChat';
import WishlistScreen from './screens/WishlistScreen';

const Stack = createStackNavigator();

const WelcomeScreen = ({ onReady }) => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
    useEffect(() => {
    dispatch(loadWishlistFromStorage()); // Load wishlist at startup
  }, [dispatch]);


  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setLoading(false);
      onReady();
    };
    fetchData();
  }, [dispatch, onReady]);

  return (
    <View style={styles.welcomeContainer}>
      <Image source={require('./assets/frankoIcon.png')} style={styles.logo} />
      <Text style={styles.welcomeText}>Welcome to Franko Trading Ent!</Text>
      {loading && <ActivityIndicator size="large" color="#e63946" />}
    </View>
  );
};

const AppStack = () => (
  <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreenWithFooter} />
    <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
    <Stack.Screen name="cart" component={CartScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
    <Stack.Screen name="SignIn" component={LoginScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
    <Stack.Screen name="Category" component={CategoryScreenWithFooter} />
    <Stack.Screen name="Account" component={AccountScreenWithFooter} />
    <Stack.Screen name="Brands" component={BrandScreen} />
    <Stack.Screen name="Shops" component={ShopScreenWithFooter} />
    <Stack.Screen name="OrderReceivedScreen" component={OrderReceivedScreen} />
    <Stack.Screen name="OrderHistoryScreen" component={OrderHistoryScreen} />
    <Stack.Screen name="Products" component={ProductsScreenWithFooter} />
    <Stack.Screen name="PaymentGatewayScreen" component={PaymentGatewayScreen} />
    <Stack.Screen name="OrderPlacedScreen" component={OrderPlacedScreen} />
    <Stack.Screen name="AboutUs" component={AboutScreen} />
    <Stack.Screen name="showroom" component={ShowroomScreen} />
    <Stack.Screen name="Phones" component={PhoneScreen} />
    <Stack.Screen name='WashingMachine' component={MachineScreen}/>
    <Stack.Screen name="Speakers" component={SpeakerScreen} />
    <Stack.Screen name="Accessories" component={AccessoriesScreen} />
    <Stack.Screen name="Computers" component={ComputerScreen} />
    <Stack.Screen name="Television" component={TelevisionScreen} />
    <Stack.Screen name="Fridge" component={FridgeScreen} />
    <Stack.Screen name="Fan" component={FanScreen} />
    <Stack.Screen name="AirCondition" component={AirConditionScreen} />
    <Stack.Screen name="OrderCancellationScreen" component={OrderCancellationScreen} />
    <Stack.Screen name="terms" component={TermsScreen} />
    <Stack.Screen name="Combo" component={ComboScreen} />
    <Stack.Screen name="Appliances" component={ApplianceScreen} />
    <Stack.Screen name="RecentlyViewed" component={RecentlyViewedScreenWithFooter} />
    <Stack.Screen name="CustomerService" component={CustomerServiceScreenWithFooter} />
    <Stack.Screen name="Invite" component={InviteScreenWithFooter} />
    <Stack.Screen name="AddressManagement" component={AddressManagementScreenWithFooter} />
    <Stack.Screen name="Search" component={SearchScreen} />
    <Stack.Screen name="HelpFAQ" component={FAQScreen} />
    <Stack.Screen name="Wishlist" component={WishlistScreen} />
  </Stack.Navigator>
);

const App = () => {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleReady = () => setShowWelcome(false);
useEffect(() => {
  const checkAppVersion = async () => {
    try {
      const currentVersion = Application.nativeApplicationVersion; // e.g. "57.0.1"

      // TODO: Replace with dynamic value from server
      const latestVersion = "57.0.2";

      if (currentVersion !== latestVersion) {
        // Check if we already showed this alert
        const alreadyShown = await AsyncStorage.getItem("updateAlertShown");

        if (!alreadyShown) {
          Alert.alert(
            "Update Available",
            "A newer version of Franko Trading is available. Please update to continue.",
            [
              {
                text: "Update Now",
                onPress: () =>
                  Linking.openURL(
                    Platform.OS === "ios"
                      ? "https://apps.apple.com/us/app/franko-trading/id6741319907"
                      : "https://play.google.com/store/apps/details?id=com.poldark.mrfranky2"
                  ),
              },
            ],
            { cancelable: false }
          );

          // Mark that we showed the alert
          await AsyncStorage.setItem("updateAlertShown", "true");
        }
      } else {
        // If user has latest version, reset the flag
        await AsyncStorage.removeItem("updateAlertShown");
      }
    } catch (err) {
      console.log("Version check failed:", err);
    }
  };

  checkAppVersion();
}, []);


  return (
    <Provider store={store}>
      <NavigationContainer>
        <View style={styles.statusBarBackground} />
        <SafeAreaView style={styles.container}>
          <StatusBar style="dark" translucent />
          {showWelcome ? (
            <WelcomeScreen onReady={handleReady} />
          ) : (
            <>
              <Header />
              <View style={styles.contentContainer}>
                <AppStack />
                <FloatingTawkChat />
              </View>
            </>
          )}
        </SafeAreaView>
      </NavigationContainer>
    </Provider>
  );
};

// Screens with Footer
const HomeScreenWithFooter = () => (<><HomeScreen /><Footer /></>);
const CategoryScreenWithFooter = () => (<><CategoryScreen /><Footer /></>);
const AccountScreenWithFooter = () => (<><AccountScreen /><Footer /></>);
const ProductsScreenWithFooter = () => (<><ProductsScreen /><Footer /></>);
const ShopScreenWithFooter = () => (<><ShopScreen /><Footer /></>);
const RecentlyViewedScreenWithFooter = () => (<><RecentlyViewedScreen /><Footer /></>);
const CustomerServiceScreenWithFooter = () => (<><CustomerServiceScreen /><Footer /></>);
const InviteScreenWithFooter = () => (<><InviteScreen /><Footer /></>);
const AddressManagementScreenWithFooter = () => (<><AddressManagementScreen /><Footer /></>);

export default App;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  statusBarBackground: {
    height: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 170,
    height: 120,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
});
