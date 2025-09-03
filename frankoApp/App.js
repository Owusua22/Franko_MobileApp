import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, ActivityIndicator, Image, StatusBar as RNStatusBar, Platform, Alert, Linking, Animated, Dimensions } from 'react-native';
import { StatusBar } from "expo-status-bar";
import { Provider, useDispatch } from 'react-redux';
import { store } from './redux/store';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Application from "expo-application";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadWishlistFromStorage } from "./redux/wishlistSlice";
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

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
const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ onReady }) => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.3))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    dispatch(loadWishlistFromStorage());
  }, [dispatch]);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for logo
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setLoading(false);
      onReady();
    };
    fetchData();

    return () => pulseLoop.stop();
  }, [dispatch, onReady, fadeAnim, scaleAnim, slideAnim, pulseAnim]);

  return (
    <LinearGradient
      colors={['#BBF7D0', '#10B981', '#059669']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.welcomeContainer}
    >
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        {[...Array(20)].map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.patternDot, 
              { 
                left: `${Math.random() * 100}%`, 
                top: `${Math.random() * 100}%`,
                opacity: 0.1 + Math.random() * 0.2
              }
            ]} 
          />
        ))}
      </View>

      <Animated.View 
        style={[
          styles.contentWrapper,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Logo Container */}
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: pulseAnim }]
            }
          ]}
        >
          <View style={styles.logoShadow}>
            <Image 
              source={require('./assets/frankoIcon.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Welcome Text */}
        <Animated.View 
          style={[
            styles.textContainer,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.welcomeTitle}>Welcome to</Text>
          <Text style={styles.companyName}>Franko Trading Ent</Text>
          <Text style={styles.tagline}>Your trusted electronics partner</Text>
        </Animated.View>

        {/* Loading Indicator */}
        {loading && (
          <Animated.View 
            style={[
              styles.loadingContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Phone Papa fie...</Text>
          </Animated.View>
        )}
      </Animated.View>

      {/* Bottom Wave */}
      <View style={styles.bottomWave} />
    </LinearGradient>
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

// Safe Area Wrapper Component for Android
const SafeAreaWrapper = ({ children }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[
      styles.safeAreaWrapper,
      Platform.OS === 'android' && { 
        paddingBottom: Math.max(insets.bottom, 2)
      }
    ]}>
      {children}
    </View>
  );
};

// Function to compare version numbers
const isVersionOlder = (currentVersion, latestVersion) => {
  const current = currentVersion.split('.').map(Number);
  const latest = latestVersion.split('.').map(Number);
  
  for (let i = 0; i < Math.max(current.length, latest.length); i++) {
    const currentPart = current[i] || 0;
    const latestPart = latest[i] || 0;
    
    if (currentPart < latestPart) return true;
    if (currentPart > latestPart) return false;
  }
  return false;
};

// Main App Content Component
const AppContent = () => {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleReady = () => setShowWelcome(false);

  useEffect(() => {
    const checkAppVersion = async () => {
      try {
        const currentVersion = Application.nativeApplicationVersion;
        
        // TODO: Replace with dynamic value from server
        const latestVersion = "57.0.2";

        // Only show update alert if current version is older than latest version
        if (isVersionOlder(currentVersion, latestVersion)) {
          // Check if we already showed this alert for this specific version
          const alertKey = `updateAlertShown_${latestVersion}`;
          const alreadyShown = await AsyncStorage.getItem(alertKey);

          if (!alreadyShown) {
            Alert.alert(
              "Update Available",
              `A newer version (${latestVersion}) of Franko Trading is available. Please update to continue using the latest features.`,
              [
                {
                  text: "Later",
                  style: "cancel",
                  onPress: () => {
                    // Mark that user chose to skip this version update
                    AsyncStorage.setItem(alertKey, "skipped");
                  }
                },
                {
                  text: "Update Now",
                  style: "default",
                  onPress: () => {
                    AsyncStorage.setItem(alertKey, "true");
                    Linking.openURL(
                      Platform.OS === "ios"
                        ? "https://apps.apple.com/us/app/franko-trading/id6741319907"
                        : "https://play.google.com/store/apps/details?id=com.poldark.mrfranky2"
                    );
                  },
                },
              ],
              { cancelable: false }
            );
          }
        } else {
          // If user has latest version or newer, clean up old alert flags
          const keys = await AsyncStorage.getAllKeys();
          const updateAlertKeys = keys.filter(key => key.startsWith('updateAlertShown_'));
          if (updateAlertKeys.length > 0) {
            await AsyncStorage.multiRemove(updateAlertKeys);
          }
        }
      } catch (err) {
        console.log("Version check failed:", err);
      }
    };

    checkAppVersion();
  }, []);

  return (
    <NavigationContainer>
      <View style={styles.statusBarBackground} />
      <SafeAreaView style={styles.container}>
  
   
       
        {showWelcome ? (
          <WelcomeScreen onReady={handleReady} />
        ) : (
          <SafeAreaWrapper>
            <Header />
            <View style={styles.contentContainer}>
              <AppStack />
              <FloatingTawkChat />
            </View>
          </SafeAreaWrapper>
        )}
      </SafeAreaView>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
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
    backgroundColor: '#10B981',
  },
  contentContainer: {
    flex: 1,
  },
  safeAreaWrapper: {
    flex: 1,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  contentWrapper: {
    alignItems: 'center',
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  logo: {
    width: 120,
    height: 120,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: '#ffffff',
    marginBottom: 5,
    textAlign: 'center',
    letterSpacing: 1,
  },
  companyName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
  },
  bottomWave: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    right: -50,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
    transform: [{ scaleX: 1.5 }],
  },
});