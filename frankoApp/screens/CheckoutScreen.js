import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  StyleSheet,
  AppState,
  StatusBar,
} from "react-native";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { encode as base64Encode } from "base-64";
import { checkOutOrder, updateOrderDelivery } from "../redux/slice/orderSlice";
import { getHubtelCallbackById } from "../redux/slice/paymentSlice";
import { clearCart } from "../redux/slice/cartSlice";
import LocationsModal from "../components/Locations";

const CheckoutScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [customer, setCustomer] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientContactNumber, setRecipientContactNumber] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({ locationCharge: 0 });
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [manualAddressVisible, setManualAddressVisible] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [paymentCheckInterval, setPaymentCheckInterval] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [usedOrderIds, setUsedOrderIds] = useState(new Set());

  // Generate unique 6-7 digit order ID in format APP-XXX-XXX
  const generateOrderId = () => {
    let orderId;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      const firstPart = Math.floor(Math.random() * 900) + 100; // 100-999
      const secondPart = Math.floor(Math.random() * 900) + 100; // 100-999
      orderId = `APP-${firstPart}-${secondPart}`;
      attempts++;
    } while (usedOrderIds.has(orderId) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      // Fallback to timestamp-based ID if we can't generate unique one
      const timestamp = Date.now().toString().slice(-6);
      orderId = `APP-${timestamp.slice(0, 3)}-${timestamp.slice(3)}`;
    }

    // Add to used IDs set
    setUsedOrderIds(prev => new Set([...prev, orderId]));
    return orderId;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customerData = JSON.parse(await AsyncStorage.getItem("customer"));
        setCustomer(customerData || {});
        setRecipientName(
          customerData ? `${customerData.firstName} ${customerData.lastName}` : ""
        );
        setRecipientContactNumber(customerData?.contactNumber || "");

        const cartData = JSON.parse(await AsyncStorage.getItem("cartDetails"));
        setCartItems(cartData?.cartItems || []);

        const savedLocation = JSON.parse(
          await AsyncStorage.getItem("selectedLocation")
        );

        if (savedLocation) {
          setSelectedLocation(savedLocation);
          setShippingDetails({ locationCharge: savedLocation.town.delivery_fee });
          setRecipientAddress(`${savedLocation.town.name}, ${savedLocation.region}`);
        } else {
          setRecipientAddress("");
          setShippingDetails({ locationCharge: 0 });
        }

        // Load previously used order IDs from storage
        const storedOrderIds = await AsyncStorage.getItem("usedOrderIds");
        if (storedOrderIds) {
          setUsedOrderIds(new Set(JSON.parse(storedOrderIds)));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to load data. Please try again.");
      }
    };

    fetchData();
  }, []);

  // Save used order IDs to storage whenever the set changes
  useEffect(() => {
    const saveUsedOrderIds = async () => {
      try {
        await AsyncStorage.setItem("usedOrderIds", JSON.stringify([...usedOrderIds]));
      } catch (error) {
        console.error("Error saving used order IDs:", error);
      }
    };

    if (usedOrderIds.size > 0) {
      saveUsedOrderIds();
    }
  }, [usedOrderIds]);

  // App State change listener for payment callback handling
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && appState === 'background') {
        checkPaymentStatus();
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [appState]);

  // Payment status monitoring - now includes Credit/Debit Card
  useEffect(() => {
    let intervalId;

    const checkHubtelStatus = async () => {
      const orderId = await AsyncStorage.getItem("pendingOrderId");
      if (!orderId) return;

      try {
        const action = await dispatch(getHubtelCallbackById(orderId));
        const response = action?.payload;

        if (response?.responseCode === "0000") {
          if (intervalId) clearInterval(intervalId);
          await AsyncStorage.removeItem("pendingOrderId");
          setPaymentCheckInterval(null);
          
          await processPaymentSuccess(orderId);
          
          Alert.alert(
            "Payment Successful!",
            "Your order has been placed successfully.",
            [{ text: "OK", onPress: () => navigation.navigate("OrderReceivedScreen") }]
          );
        } else if (response?.responseCode === "2001") {
          if (intervalId) clearInterval(intervalId);
          await AsyncStorage.removeItem("pendingOrderId");
          setPaymentCheckInterval(null);
          
          Alert.alert(
            "Payment Cancelled",
            "Your payment was cancelled or failed. Please try again.",
            [{ text: "OK" }]
          );
        }
      } catch (error) {
        console.error("Payment status check error:", error);
      }
    };

    // Updated to include Credit/Debit Card alongside Mobile Money
    if (["Mobile Money", "Credit/Debit Card"].includes(paymentMethod)) {
      intervalId = setInterval(checkHubtelStatus, 3000);
      setPaymentCheckInterval(intervalId);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [paymentMethod, dispatch, navigation]);

  useEffect(() => {
    return () => {
      if (paymentCheckInterval) {
        clearInterval(paymentCheckInterval);
      }
    };
  }, [paymentCheckInterval]);

  const checkPaymentStatus = async () => {
    const orderId = await AsyncStorage.getItem("pendingOrderId");
    if (!orderId) return;

    try {
      const action = await dispatch(getHubtelCallbackById(orderId));
      const response = action?.payload;

      if (response?.responseCode === "0000") {
        await AsyncStorage.removeItem("pendingOrderId");
        await processPaymentSuccess(orderId);
        
        Alert.alert(
          "Payment Successful!",
          "Your order has been placed successfully.",
          [{ text: "OK", onPress: () => navigation.navigate("OrderReceivedScreen") }]
        );
      } else if (response?.responseCode === "2001") {
        await AsyncStorage.removeItem("pendingOrderId");
        Alert.alert("Payment Failed", "Your payment was not successful. Please try again.");
      }
    } catch (error) {
      console.error("Payment status check error:", error);
    }
  };

  const processPaymentSuccess = async (orderId) => {
    try {
      const checkoutDetails = JSON.parse(
        await AsyncStorage.getItem("checkoutDetails") || "{}"
      );
      const addressDetails = JSON.parse(
        await AsyncStorage.getItem("orderDeliveryDetails") || "{}"
      );

      if (checkoutDetails && addressDetails) {
        await dispatchOrderCheckout(orderId, checkoutDetails);
        await dispatchOrderAddress(orderId, addressDetails);
        
        await AsyncStorage.removeItem("checkoutDetails");
        await AsyncStorage.removeItem("orderDeliveryDetails");
      }
    } catch (error) {
      console.error("Error processing payment success:", error);
    }
  };

  const handleLocationSelect = async (locationData) => {
    try {
      setSelectedLocation(locationData);
      setShippingDetails({ locationCharge: locationData.town.delivery_fee });
      setRecipientAddress(`${locationData.town.name}, ${locationData.region}`);
      
      // Reset manual address mode when location is selected
      setManualAddressVisible(false);
      
      await AsyncStorage.setItem("selectedLocation", JSON.stringify(locationData));
      
      setLocationModalVisible(false);
    } catch (error) {
      console.error("Error saving location:", error);
      Alert.alert("Error", "Failed to save location. Please try again.");
    }
  };

  const handleManualAddressToggle = () => {
    const newManualAddressVisible = !manualAddressVisible;
    setManualAddressVisible(newManualAddressVisible);
    
    if (newManualAddressVisible) {
      // When switching to manual mode, clear location data
      setSelectedLocation(null);
      setShippingDetails({ locationCharge: 0 });
      setRecipientAddress("");
      // Clear payment method to force user to select again
      setPaymentMethod("");
      // Remove saved location
      AsyncStorage.removeItem("selectedLocation");
    }
  };

  const handleCheckout = async () => {
    // Check for guest name validation
    const isGuestName = recipientName.toLowerCase().trim() === "Guest" || 
                       recipientName.toLowerCase().trim() === "guest user" ||
                       recipientName.toLowerCase().trim().includes("guest");
    
    if (isGuestName) {
      Alert.alert(
        "Please Enter Your Actual Name", 
        "For delivery purposes, please enter your real name instead of 'Guest'.",
        [{ 
          text: "OK", 
          onPress: () => {
            // Focus on the name input field if possible
            // You might want to add a ref to the TextInput for better UX
          }
        }]
      );
      return;
    }

    // Validation with modern alert
    if (!paymentMethod) {
      Alert.alert(
        "Payment Method Required", 
        "Please select a payment method to continue with your order.",
        [{ text: "Got it", style: "default" }]
      );
      return;
    }
    
    if (!recipientAddress.trim()) {
      Alert.alert(
        "Delivery Address Required", 
        "Please add a valid delivery address to complete your order.",
        [{ 
          text: "Select Location", 
          onPress: () => setLocationModalVisible(true) 
        }, {
          text: "Enter Manually",
          onPress: () => setManualAddressVisible(true)
        }]
      );
      return;
    }

    if (!recipientName.trim()) {
      Alert.alert(
        "Recipient Name Required", 
        "Please enter the recipient's name.",
        [{ text: "OK" }]
      );
      return;
    }

    if (!recipientContactNumber.trim()) {
      Alert.alert(
        "Contact Number Required", 
        "Please enter the recipient's contact number.",
        [{ text: "OK" }]
      );
      return;
    }

    // For manual address, don't allow Cash on Delivery
    if (paymentMethod === "Cash on Delivery" && (manualAddressVisible || shippingDetails.locationCharge === 0)) {
      Alert.alert(
        "Payment Method Not Available", 
        "Cash on Delivery is not available for manual addresses or your selected location. Please select another payment method.",
        [{ text: "Choose Payment" }]
      );
      return;
    }

    setLoading(true);
    // Use the new order ID format: APP-XXX-XXX
    const orderId = generateOrderId();
    const orderDate = new Date().toISOString();

    const checkoutDetails = {
      Cartid: await AsyncStorage.getItem("cartId"),
      customerId: customer.customerAccountNumber,
      orderCode: orderId,
      PaymentMode: paymentMethod,
      PaymentAccountNumber: customer.contactNumber,
      customerAccountType: customer.accountType || "Customer",
      paymentService: paymentMethod === "Mobile Money" ? "Mtn" : "Visa",
      totalAmount: calculateTotalAmount(),
      recipientName,
      recipientContactNumber,
      orderNote: orderNote || "N/A",
      orderDate,
    };

    const addressDetails = {
      orderCode: orderId,
      address: recipientAddress,
      Customerid: customer.customerAccountNumber,
      recipientName,
      recipientContactNumber,
      orderNote: orderNote || "N/A",
      geoLocation: "N/A",
    };

    try {
      // Updated condition: Both Mobile Money and Credit/Debit Card go through payment gateway
      if (!["Mobile Money", "Credit/Debit Card"].includes(paymentMethod)) {
        await processDirectCheckout(orderId, checkoutDetails, addressDetails);
        Alert.alert("Order Placed Successfully!", "Your order has been confirmed and is being processed.");
        navigation.navigate("OrderReceivedScreen");
      } else {
        await storeCheckoutDetailsLocally(checkoutDetails, addressDetails);
        
        const paymentUrl = await initiatePayment(checkoutDetails.totalAmount, cartItems, orderId);
        if (paymentUrl && isValidUrl(paymentUrl)) {
          await AsyncStorage.setItem("pendingOrderId", orderId);
          
          navigation.navigate("PaymentGatewayScreen", { 
            url: paymentUrl,
            orderId: orderId
          });
        } else {
          throw new Error("Invalid payment URL received");
        }
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      Alert.alert("Checkout Error", error.message || "An error occurred during checkout.");
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol) && 
             !url.includes('about:') && 
             !url.includes('srcdoc');
    } catch (error) {
      return false;
    }
  };

  const processDirectCheckout = async (orderId, checkoutDetails, addressDetails) => {
    try {
      await dispatchOrderCheckout(orderId, checkoutDetails);
      await dispatchOrderAddress(orderId, addressDetails);
      dispatch(clearCart());
      await AsyncStorage.removeItem("cartDetails");
      await AsyncStorage.removeItem("cartId");
      await AsyncStorage.removeItem("cart");
    } catch (error) {
      throw new Error("An error occurred during direct checkout.");
    }
  };

  const dispatchOrderCheckout = async (orderId, checkoutDetails) => {
    try {
      const checkoutPayload = { 
        Cartid: await AsyncStorage.getItem("cartId"), 
        ...checkoutDetails 
      };
      await dispatch(checkOutOrder(checkoutPayload)).unwrap();
    } catch (error) {
      console.error("Checkout Error:", error);
      throw new Error("An error occurred during order checkout.");
    }
  };

  const dispatchOrderAddress = async (orderId, addressDetails) => {
    try {
      await dispatch(updateOrderDelivery(addressDetails)).unwrap();
    } catch (error) {
      console.error("Address Update Error:", error);
      throw new Error("An error occurred while updating the order address.");
    }
  };

  const storeCheckoutDetailsLocally = async (checkoutDetails, addressDetails) => {
    try {
      await AsyncStorage.setItem("checkoutDetails", JSON.stringify(checkoutDetails));
      await AsyncStorage.setItem("orderDeliveryDetails", JSON.stringify(addressDetails));
    } catch (error) {
      console.error("Error storing checkout details locally:", error);
      throw new Error("Failed to store checkout details locally.");
    }
  };

  const initiatePayment = async (totalAmount, cartItems, orderId) => {
    const username = "RMWBWl0";
    const password = "3c42a596cd044fed81b492e74da4ae30";
    
    const credentials = `${username}:${password}`;
    const encodedCredentials = base64Encode(credentials);

    const payload = {
      totalAmount,
      description: `Payment for ${cartItems.map((item) => item.productName).join(", ")}`,
      callbackUrl: "https://smfteapi.salesmate.app/PaymentSystem/PostHubtelCallBack",
      returnUrl: `https://www.frankotrading.com/order-success/${orderId}`,
      merchantAccountNumber: "2020892",
      cancellationUrl: "https://www.frankotrading.com/order-cancelled",
      clientReference: orderId,
    };

    try {
      const response = await fetch("https://payproxyapi.hubtel.com/items/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${encodedCredentials}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === "Success" && result.data && result.data.checkoutUrl) {
        const checkoutUrl = result.data.checkoutUrl;
        
        if (isValidUrl(checkoutUrl)) {
          return checkoutUrl;
        } else {
          throw new Error("Invalid checkout URL received from payment gateway");
        }
      }
      
      throw new Error(`Payment initiation failed: ${result.message || "Unknown error"}`);
    } catch (error) {
      console.error("Payment initiation error:", error);
      throw new Error("Payment initiation failed. Please try again.");
    }
  };

  const calculateTotalAmount = () => {
    return (
      cartItems.reduce((total, item) => total + (item.amount || item.total || 0), 0) +
      (shippingDetails.locationCharge || 0)
    );
  };

  const getAvailablePaymentMethods = () => {
    const methods = ["Mobile Money", "Credit/Debit Card"];
 
    if (!manualAddressVisible && 
        selectedLocation && 
        shippingDetails.locationCharge > 0 && 
        shippingDetails.locationCharge !== "N/A") {
      methods.unshift("Cash on Delivery");
    }

    return methods;
  };

  const availablePaymentMethods = getAvailablePaymentMethods();

  const getPaymentIcon = (method) => {
    switch (method) {
      case "Mobile Money":
        return "phone-portrait-outline";
      case "Credit/Debit Card":
        return "card-outline";
      case "Cash on Delivery":
        return "cash-outline";
      default:
        return "wallet-outline";
    }
  };

  return (
    <View style={styles.container}>
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.loadingText}>Processing your order...</Text>
          </View>
        </View>
      )}
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Checkout</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Customer Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={20} color="#059669" />
            <Text style={styles.cardTitle}>Delivery Information</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Recipient Name *</Text>
            <TextInput
              style={[styles.input, !recipientName.trim() && styles.inputError]}
              value={recipientName}
              onChangeText={setRecipientName}
              placeholder="Enter your actual name (required for delivery)"
              placeholderTextColor="#9CA3AF"
            />
            {recipientName.toLowerCase().includes("guest") && (
              <View style={styles.warningCard}>
                <Ionicons name="warning-outline" size={16} color="#F59E0B" />
                <Text style={styles.warningTextSmall}>
                  Please enter your actual name for delivery purposes
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Number *</Text>
            <TextInput
              style={[styles.input, !recipientContactNumber.trim() && styles.inputError]}
              value={recipientContactNumber}
              onChangeText={setRecipientContactNumber}
              keyboardType="phone-pad"
              placeholder="Enter contact number"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Delivery Address *</Text>
            
            {!manualAddressVisible ? (
              <>
                <View style={styles.addressContainer}>
                  <TextInput
                    style={[styles.addressInput, !recipientAddress.trim() && styles.inputError]}
                    value={recipientAddress}
                    placeholder="Select delivery address"
                    placeholderTextColor="#9CA3AF"
                    editable={false}
                  />
                  <TouchableOpacity
                    style={styles.addressButton}
                    onPress={() => setLocationModalVisible(true)}
                  >
                    <Ionicons 
                      name={recipientAddress ? "location" : "add-circle"} 
                      size={20} 
                      color="#fff" 
                    />
                    <Text style={styles.addressButtonText}>
                      {recipientAddress ? "Change" : "Select"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {selectedLocation && (
                  <View style={styles.deliveryInfoCard}>
                    <Ionicons name="car-outline" size={16} color="#059669" />
                    <Text style={styles.deliveryInfoText}>
                      Delivery Fee: {selectedLocation.town.delivery_fee === 0 
                        ? "N/A" 
                        : `GH₵${selectedLocation.town.delivery_fee}`
                      }
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.manualAddressContainer}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter your complete delivery address (House number, street, area, city)"
                  value={recipientAddress}
                  onChangeText={setRecipientAddress}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#9CA3AF"
                />
               
              </View>
            )}

            <TouchableOpacity
              style={styles.manualAddressToggle}
              onPress={handleManualAddressToggle}
            >
              <View style={styles.toggleContent}>
                <Ionicons 
                  name={manualAddressVisible ? "location-outline" : "create-outline"} 
                  size={16} 
                  color="#059669" 
                />
                <Text style={styles.manualAddressToggleText}>
                  {manualAddressVisible ? "Select from locations" : "Enter address manually"}
                </Text>
              </View>
              <Ionicons 
                name={manualAddressVisible ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#059669" 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Order Note (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add special instructions for your order"
              value={orderNote}
              onChangeText={setOrderNote}
              multiline
              numberOfLines={3}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Payment Method Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet-outline" size={20} color="#059669" />
            <Text style={styles.cardTitle}>Payment Method *</Text>
          </View>
          
          {availablePaymentMethods.map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.paymentOption,
                paymentMethod === method && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod(method)}
            >
              <View style={styles.paymentOptionLeft}>
                <View style={styles.paymentIconContainer}>
                  <Ionicons
                    name={getPaymentIcon(method)}
                    size={20}
                    color={paymentMethod === method ? "#059669" : "#6B7280"}
                  />
                </View>
                <Text
                  style={[
                    styles.paymentOptionText,
                    paymentMethod === method && styles.paymentOptionTextSelected,
                  ]}
                >
                  {method}
                </Text>
              </View>
              <View
                style={[
                  styles.radioButton,
                  paymentMethod === method && styles.radioButtonSelected,
                ]}
              >
                {paymentMethod === method && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}

          
        </View>

        {/* Order Summary Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="receipt-outline" size={20} color="#059669" />
            <Text style={styles.cardTitle}>Order Summary</Text>
          </View>

          {cartItems.length > 0 ? (
            cartItems.map((item, index) => {
              const backendBaseURL = "https://smfteapi.salesmate.app";
              const imageUrl = item.imagePath
                ? `${backendBaseURL}/Media/Products_Images/${item.imagePath
                    .split("\\")
                    .pop()}`
                : null;

              return (
                <View key={`${item.cartId}-${index}`} style={styles.orderItem}>
                  {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.orderItemImage} />
                  ) : (
                    <View style={styles.orderItemImagePlaceholder}>
                      <Ionicons name="image-outline" size={20} color="#9CA3AF" />
                    </View>
                  )}
                  <View style={styles.orderItemDetails}>
                    <Text style={styles.orderItemName}>{item.productName}</Text>
                    <Text style={styles.orderItemQty}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.orderItemPrice}>
                    GH₵{(item.amount || item.total || 0).toFixed(2)}
                  </Text>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyCart}>
              <Ionicons name="cart-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyCartText}>No items in your order</Text>
            </View>
          )}

          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                GH₵{cartItems.reduce((total, item) => total + (item.amount || item.total || 0), 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>
                {(manualAddressVisible || shippingDetails.locationCharge === 0) ? 
                  "N/A" : 
                  `GH₵${shippingDetails.locationCharge.toFixed(2)}`}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>
                GH₵{calculateTotalAmount().toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

   

      {/* Place Order Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={styles.placeOrderButton}
          onPress={handleCheckout}
          disabled={loading}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
          <Text style={styles.placeOrderText}>
            Place Order • GH₵{calculateTotalAmount().toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>

      <LocationsModal
        isVisible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onLocationSelect={handleLocationSelect}
        selectedLocation={selectedLocation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    color: "#374151",
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    paddingHorizontal: 10,
    paddingVertical: 10,
    paddingTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    padding: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  addressContainer: {
    flexDirection: "row",
    gap: 12,
  },
  addressInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
  },
  addressButton: {
    backgroundColor: "#059669",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },

  addressButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  deliveryInfoCard: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  deliveryInfoText: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "500",
  },
  manualAddressToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  manualAddressToggleText: {
    color: "#059669",
    fontSize: 14,
    fontWeight: "500",
  },
  manualAddressContainer: {
    marginTop: 12,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
  },
  paymentOptionSelected: {
    borderColor: "#059669",
    backgroundColor: "#ECFDF5",
  },
  paymentOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  paymentOptionText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  paymentOptionTextSelected: {
    color: "#059669",
    fontWeight: "600",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: "#059669",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#059669",
  },
  warningCard: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  orderItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  orderItemImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 2,
  },
  orderItemQty: {
    fontSize: 12,
    color: "#6B7280",
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  emptyCart: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyCartText: {
    fontSize: 16,
    color: "#9CA3AF",
    marginTop: 8,
  },
  summarySection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#EF4444",
  },
  bottomSection: {
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  placeOrderButton: {
    backgroundColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#F8FAFC",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    gap: 8,
  },
  placeOrderText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default CheckoutScreen;