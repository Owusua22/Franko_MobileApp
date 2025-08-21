import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
  Dimensions,
  StatusBar,
} from "react-native";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { fetchShippingCountries } from "../redux/slice/shippingSlice";
import { updateAccountStatus, logoutCustomer } from "../redux/slice/customerSlice";
import SignupScreen from "./SignupScreen"; // Import the SignupScreen component

const { width } = Dimensions.get('window');

const AccountScreen = () => {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignupModal, setShowSignupModal] = useState(false); // State to control SignupScreen visibility

  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customer = await AsyncStorage.getItem("customer");
        if (customer) setCustomerData(JSON.parse(customer));
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    dispatch(fetchShippingCountries());
  }, [dispatch]);

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(updateAccountStatus()).unwrap();
              Alert.alert("Account Deleted", "Your account has been deactivated.");
              navigation.navigate("Home");
            } catch (error) {
              Alert.alert("Error", "Failed to delete account.");
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "default",
          onPress: async () => {
            try {
              dispatch(logoutCustomer());
              setCustomerData(null);
              Alert.alert("Logged Out", "You have been successfully logged out.");
              navigation.navigate("Home");
            } catch (error) {
              Alert.alert("Error", "Failed to logout.");
            }
          },
        },
      ]
    );
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Handle signup modal close and refresh customer data
  const handleSignupClose = async () => {
    setShowSignupModal(false);
    
    // Refresh customer data after signup/login
    try {
      const customer = await AsyncStorage.getItem("customer");
      if (customer) {
        setCustomerData(JSON.parse(customer));
      }
    } catch (error) {
      console.error("Error refreshing customer data:", error);
    }
  };

  // Handle sign in button press
  const handleSignInPress = () => {
    setShowSignupModal(true);
  };

  // Handle register button press
  const handleRegisterPress = () => {
    setShowSignupModal(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading your account...</Text>
      </View>
    );
  }

  const orderActions = [
    { name: "To Pay", icon: "credit-card", color: "#059669", bgColor: "#d1fae5" },
    { name: "To Receive", icon: "truck", color: "#047857", bgColor: "#ecfdf5" },
    { name: "To Rate", icon: "star", color: "#065f46", bgColor: "#f0fdf4", badge: true },
    { name: "After Sale", icon: "archive", color: "#10b981", bgColor: "#dcfce7" },
  ];

  const accountOptions = [
    { 
      name: "Invite Friends", 
      icon: "gift", 
      extra: "Get Rewards", 
      screen: "Invite",
      color: "#059669",
      bgColor: "#d1fae5",
      description: "Share and earn rewards"
    },
    { 
      name: "Recently Viewed", 
      icon: "history", 
      screen: "RecentlyViewed",
      color: "#047857",
      bgColor: "#ecfdf5",
      description: "Your browsing history"
    },
    { 
      name: "Terms", 
      icon: "information", 
      screen: "terms",
      color: "#10b981",
      bgColor: "#dcfce7",
      description: "Our Terms and policy"
    },
    { 
      name: "Customer Service", 
      icon: "headphones", 
      screen: "CustomerService",
      color: "#065f46",
      bgColor: "#f0fdf4",
      description: "Get help and support"
    },
    { 
      name: "About Us", 
      icon: "information", 
      screen: "AboutUs",
      color: "#0f766e",
      bgColor: "#f0fdfa",
      description: "Learn more about us"
    }, 
      
    { 
      name: "Help & FAQ", 
      icon: "help-circle", 
      screen: "HelpFAQ",
      color: "#047857",
      bgColor: "#ecfdf5",
      description: "Frequently asked questions"
    },
  ];

  const ProfileHeader = () => (
    <View style={styles.headerContainer}>
      <StatusBar backgroundColor="#10b981" barStyle="light-content" />
      
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={handleGoBack}
        activeOpacity={0.7}
      >
        <Icon name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.headerContent}>
        {customerData ? (
          <View style={styles.userInfo}>
            <View style={styles.userMainInfo}>
              <View style={styles.avatarContainer}>
                <Icon name="account-circle" size={70} color="#fff" />
                <View style={styles.onlineIndicator} />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>
                  {customerData.firstName} {customerData.lastName}
                </Text>
                <Text style={styles.userEmail}>{customerData.email}</Text>
                <View style={styles.phoneContainer}>
                  <Icon name="phone" size={14} color="#e2e8f0" />
                  <Text style={styles.userPhone}>{customerData.contactNumber}</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.guestContainer}>
            <View style={styles.avatarContainer}>
              <Icon name="account-circle-outline" size={70} color="#fff" />
            </View>
            <Text style={styles.guestText}>Welcome Guest</Text>
            <Text style={styles.guestSubtext}>Sign in to access your account</Text>
            <View style={styles.authButtons}>
              <TouchableOpacity 
                style={styles.authButton} 
                onPress={handleSignInPress}
                activeOpacity={0.8}
              >
                <Text style={styles.authButtonText}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.authButton, styles.registerButton]} 
                onPress={handleRegisterPress}
                activeOpacity={0.8}
              >
                <Text style={styles.authButtonTextDark}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const OrderSection = () => (
    <View style={styles.orderSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Orders</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => navigation.navigate("OrderHistoryScreen")}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Icon name="chevron-right" size={16} color="#10b981" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.orderGrid}>
        {orderActions.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.orderItem}
            onPress={() => {
              // Check if user is logged in before navigating
              if (!customerData) {
                Alert.alert(
                  "Sign In Required",
                  "Please sign in to view your orders.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { 
                      text: "Sign In", 
                      onPress: () => setShowSignupModal(true)
                    }
                  ]
                );
                return;
              }

              // Navigate to specific order status screens
              const screenMap = {
                "To Pay": "PendingPayments",
                "To Receive": "PendingDeliveries", 
                "To Rate": "PendingReviews",
                "After Sale": "AfterSaleService"
              };
              const screenName = screenMap[item.name] || "OrderHistoryScreen";
              navigation.navigate(screenName);
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.orderIconContainer, { backgroundColor: item.bgColor }]}>
              <Icon name={item.icon} size={24} color={item.color} />
              {item.badge && <View style={styles.notificationBadge} />}
            </View>
            <Text style={styles.orderText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader />
        
        <View style={styles.contentContainer}>
          <OrderSection />
          
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Account Options</Text>
            {accountOptions.map((item, index) => (
              <TouchableOpacity 
                key={item.name} 
                style={[
                  styles.menuItem,
                  index === accountOptions.length - 1 && styles.lastMenuItem
                ]}
                onPress={() => {
                  // Check if user is logged in for certain screens
                  const loginRequiredScreens = ["AddressManagement", "Invite"];
                  if (loginRequiredScreens.includes(item.screen) && !customerData) {
                    Alert.alert(
                      "Sign In Required",
                      "Please sign in to access this feature.",
                      [
                        { text: "Cancel", style: "cancel" },
                        { 
                          text: "Sign In", 
                          onPress: () => setShowSignupModal(true)
                        }
                      ]
                    );
                    return;
                  }
                  navigation.navigate(item.screen);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIconContainer, { backgroundColor: item.bgColor }]}>
                    <Icon name={item.icon} size={20} color={item.color} />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuText}>{item.name}</Text>
                    {item.description && (
                      <Text style={styles.menuDescription}>{item.description}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.menuRight}>
                  {item.extra && (
                    <View style={styles.rewardBadge}>
                      <Text style={styles.rewardText}>{item.extra}</Text>
                    </View>
                  )}
                  <Icon name="chevron-right" size={20} color="#ccc" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Enhanced Action Buttons */}
          {customerData && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={styles.logoutMainButton} 
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <View style={styles.buttonIconContainer}>
                  <Icon name="logout" size={20} color="#fff" />
                </View>
                <Text style={styles.logoutMainButtonText}>Logout Account</Text>
                <Icon name="chevron-right" size={18} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteAccountButton} 
                onPress={handleDeleteAccount}
                activeOpacity={0.8}
              >
                <View style={styles.buttonIconContainer}>
                  <Icon name="delete-forever" size={20} color="#dc2626" />
                </View>
                <Text style={styles.deleteAccountText}>Delete Account</Text>
                <Icon name="chevron-right" size={18} color="#dc2626" />
              </TouchableOpacity>
            </View>
          )}

          {/* Guest Quick Actions */}
          {!customerData && (
            <View style={styles.guestActionsContainer}>
              <TouchableOpacity 
                style={styles.guestActionButton} 
                onPress={() => setShowSignupModal(true)}
                activeOpacity={0.8}
              >
                <View style={styles.buttonIconContainer}>
                  <Icon name="account-plus" size={20} color="#10b981" />
                </View>
                <Text style={styles.guestActionText}>Create Account or Sign In</Text>
                <Icon name="chevron-right" size={18} color="#10b981" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* SignupScreen Modal */}
      <SignupScreen 
        visible={showSignupModal} 
        onClose={handleSignupClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#10b981',
    fontWeight: '500',
  },
  headerContainer: {
    backgroundColor: '#10b981',
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 10,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 5) + 10,
    left: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 10,
  },
  userInfo: {
    width: '100%',
    alignItems: 'center',
  },
  userMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    backgroundColor: '#22c55e',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userDetails: {
    flex: 1,
    marginLeft: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userPhone: {
    fontSize: 14,
    color: '#e2e8f0',
    marginLeft: 6,
  },
  headerLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#fca5a5',
    minWidth: 120,
    justifyContent: 'center',
  },
  headerLogoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  guestContainer: {
    alignItems: 'center',
    width: '100%',
  },
  guestText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    marginTop: 16,
  },
  guestSubtext: {
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 24,
  },
  authButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  authButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#fff',
    minWidth: 100,
  },
  registerButton: {
    backgroundColor: '#fff',
  },
  authButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  authButtonTextDark: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  orderSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  orderGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderItem: {
    alignItems: 'center',
    flex: 1,
  },
  orderIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    backgroundColor: '#ef4444',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  orderText: {
    fontSize: 12,
    color: '#4a5568',
    textAlign: 'center',
    fontWeight: '500',
  },
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  menuDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#2d3748',
    fontWeight: '500',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  rewardText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  logoutMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  logoutMainButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fecaca',
    marginBottom: 40,
  },
  deleteAccountText: {
    color: '#dc2626',
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  buttonIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestActionsContainer: {
    marginBottom: 24,
  },
  guestActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guestActionText: {
    color: '#10b981',
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  footerContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  versionText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 11,
    color: '#d1d5db',
  },
});

export default AccountScreen;