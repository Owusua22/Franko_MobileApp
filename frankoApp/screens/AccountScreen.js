import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  StatusBar,
} from "react-native";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { fetchShippingCountries } from "../redux/slice/shippingSlice";
import { updateAccountStatus, logoutCustomer } from "../redux/slice/customerSlice";
import SignupScreen from "./SignupScreen";

const { width } = Dimensions.get('window');

const AccountScreen = () => {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignupModal, setShowSignupModal] = useState(false);

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

  const handleSignupClose = async () => {
    setShowSignupModal(false);
    
    try {
      const customer = await AsyncStorage.getItem("customer");
      if (customer) {
        setCustomerData(JSON.parse(customer));
      }
    } catch (error) {
      console.error("Error refreshing customer data:", error);
    }
  };

  const handleRegisterPress = () => {
    setShowSignupModal(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Loading your account...</Text>
        </View>
      </View>
    );
  }

  const quickActions = [
    { 
      name: "My Orders", 
      icon: "package-variant-closed", 
      color: "#059669", 
      bgColor: "#d1fae5",
      screen: "OrderHistoryScreen",
      description: "Track your purchases"
    },
    { 
      name: "Wishlist", 
      icon: "heart", 
      color: "#dc2626", 
      bgColor: "#fee2e2",
      screen: "Wishlist",
      description: "Saved items"
    },
    { 
      name: "Recently Viewed", 
      icon: "history", 
      color: "#7c3aed", 
      bgColor: "#ede9fe",
      screen: "RecentlyViewed",
      description: "Browse history"
    },
    { 
      name: "Help Center", 
      icon: "help-circle", 
      color: "#0891b2", 
      bgColor: "#cffafe",
      screen: "HelpFAQ",
      description: "Get support"
    },
  ];

  const accountOptions = [
    { 
      name: "Invite Friends", 
      icon: "gift", 
      extra: "Earn Rewards", 
      screen: "Invite",
      color: "#059669",
      bgColor: "#d1fae5",
      description: "Share and get rewarded"
    },
    { 
      name: "Customer Service", 
      icon: "headphones", 
      screen: "CustomerService",
      color: "#065f46",
      bgColor: "#f0fdf4",
      description: "24/7 support available"
    },
    { 
      name: "Terms & Privacy", 
      icon: "shield-check", 
      screen: "terms",
      color: "#0f766e",
      bgColor: "#f0fdfa",
      description: "Our policies"
    },
    { 
      name: "About Us", 
      icon: "information", 
      screen: "AboutUs",
      color: "#047857",
      bgColor: "#ecfdf5",
      description: "Learn more"
    },
  ];

  const ProfileHeader = () => (
    <View style={styles.headerContainer}>
      <StatusBar backgroundColor="#10b981" barStyle="light-content" />
      
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
            <View style={styles.avatarContainer}>
              <View style={styles.avatarWrapper}>
                <Icon name="account-circle" size={80} color="#fff" />
                <View style={styles.onlineIndicator} />
              </View>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {customerData.firstName} {customerData.lastName}
              </Text>
              <View style={styles.userContactInfo}>
                <View style={styles.contactItem}>
                  <Icon name="email" size={14} color="#e2e8f0" />
                  <Text style={styles.contactText}>{customerData.email}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Icon name="phone" size={14} color="#e2e8f0" />
                  <Text style={styles.contactText}>{customerData.contactNumber}</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.guestContainer}>
            <View style={styles.guestIconContainer}>
              <Icon name="account-circle-outline" size={70} color="rgba(255,255,255,0.8)" />
            </View>
            <Text style={styles.guestTitle}>Welcome to Franko!</Text>
           
            
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Icon name="check-circle" size={16} color="#fff" />
                <Text style={styles.benefitText}>Track your orders</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="check-circle" size={16} color="#fff" />
                <Text style={styles.benefitText}>Save your wishlist</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="check-circle" size={16} color="#fff" />
                <Text style={styles.benefitText}>Get exclusive offers</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={handleRegisterPress}
              activeOpacity={0.9}
            >
              <Icon name="account-plus" size={20} color="#10b981" />
              <Text style={styles.registerButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const QuickActionsSection = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.quickActionItem}
            onPress={() => {
              if (!customerData && (item.screen === "OrderHistoryScreen" || item.screen === "Wishlist")) {
                Alert.alert(
                  "Account Required",
                  `Please create an account to access ${item.name.toLowerCase()}.`,
                  [
                    { text: "Cancel", style: "cancel" },
                    { 
                      text: "Create Account", 
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
            <View style={[styles.quickActionIcon, { backgroundColor: item.bgColor }]}>
              <Icon name={item.icon} size={28} color={item.color} />
            </View>
            <Text style={styles.quickActionName}>{item.name}</Text>
            <Text style={styles.quickActionDescription}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <ProfileHeader />
        
        <View style={styles.contentContainer}>
          <QuickActionsSection />
          
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Account & Support</Text>
            {accountOptions.map((item, index) => (
              <TouchableOpacity 
                key={item.name} 
                style={[
                  styles.menuItem,
                  index === accountOptions.length - 1 && styles.lastMenuItem
                ]}
                onPress={() => {
                  const loginRequiredScreens = ["Invite"];
                  if (loginRequiredScreens.includes(item.screen) && !customerData) {
                    Alert.alert(
                      "Account Required",
                      "Please create an account to access this feature.",
                      [
                        { text: "Cancel", style: "cancel" },
                        { 
                          text: "Create Account", 
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
                    <Icon name={item.icon} size={22} color={item.color} />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuText}>{item.name}</Text>
                    <Text style={styles.menuDescription}>{item.description}</Text>
                  </View>
                </View>
                <View style={styles.menuRight}>
                  {item.extra && (
                    <View style={styles.rewardBadge}>
                      <Text style={styles.rewardText}>{item.extra}</Text>
                    </View>
                  )}
                  <Icon name="chevron-right" size={20} color="#cbd5e1" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {customerData && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.buttonIconWrapper}>
                    <Icon name="logout" size={20} color="#dc2626" />
                  </View>
                  <Text style={styles.logoutButtonText}>Logout Account</Text>
                </View>
                <Icon name="chevron-right" size={18} color="#dc2626" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteAccountButton} 
                onPress={handleDeleteAccount}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.dangerButtonIconWrapper}>
                    <Icon name="delete-forever" size={20} color="#dc2626" />
                  </View>
                  <Text style={styles.deleteAccountText}>Delete Account</Text>
                </View>
                <Icon name="chevron-right" size={18} color="#dc2626" />
              </TouchableOpacity>
            </View>
          )}


          <View style={styles.appInfoSection}>
            <Text style={styles.appVersion}>Version 2.1.0</Text>
            <Text style={styles.copyright}>© 2025 Your Store Name</Text>
          </View>
        </View>
      </ScrollView>

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
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#10b981',
    fontWeight: '500',
  },
  
  // Header Styles
  headerContainer: {
    backgroundColor: '#10b981',
    paddingTop: StatusBar.currentHeight || 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  backButton: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 40) + 10,
    left: 20,
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
    marginTop: 15,
  },
  
  // User Info Styles
  userInfo: {
    alignItems: 'center',
    width: '100%',
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 18,
    height: 18,
    backgroundColor: '#22c55e',
    borderRadius: 9,
    borderWidth: 3,
    borderColor: '#fff',
  },
  userDetails: {
    alignItems: 'center',
    width: '100%',
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  userContactInfo: {
    alignItems: 'center',
    gap: 6,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 15,
    color: '#e2e8f0',
  },
  
  // Guest Styles
  guestContainer: {
    alignItems: 'center',
    width: '100%',
  },
  guestIconContainer: {
    marginBottom: 10,
    opacity: 0.9,
  },
  guestTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  benefitsList: {
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  benefitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonText: {
    color: '#10b981',
    fontWeight: '700',
    fontSize: 16,
  },
  
  // Content Styles
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  
  // Quick Actions Styles
  quickActionsContainer: {
    marginBottom: 28,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  quickActionItem: {
    backgroundColor: '#fff',
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  
  // Menu Styles
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
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
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rewardText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  
  // Action Buttons Styles
  actionButtonsContainer: {
    gap: 12,
    marginBottom: 28,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  buttonIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dangerButtonIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteAccountText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Guest Footer Styles
  guestFooterContainer: {
    marginBottom: 28,
  },
  featureHighlight: {
    backgroundColor: '#fff',
    padding: 28,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 10,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // App Info Styles
  appInfoSection: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
  },
  appVersion: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 4,
    fontWeight: '500',
  },
  copyright: {
    fontSize: 12,
    color: '#d1d5db',
  },
});
export default AccountScreen;