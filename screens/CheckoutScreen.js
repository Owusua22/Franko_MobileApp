
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
 
} from "react-native";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import UUID from "react-native-uuid";
import { checkOutOrder, updateOrderDelivery } from "../redux/slice/orderSlice";
import { clearCart } from "../redux/slice/cartSlice";
import ShippingComponent from "../components/ShippingComponent"; // Assuming ShippingComponent is in a `components` folder.

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
  const [isShippingModalVisible, setShippingModalVisible] = useState(false);

  

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

        const savedShippingDetails = JSON.parse(
          await AsyncStorage.getItem("shippingDetails")
        );

        if (savedShippingDetails) {
          setShippingDetails(savedShippingDetails);
          setRecipientAddress(savedShippingDetails.location || "Add Address");
        } else {
          setRecipientAddress("Add Address");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load data. Please try again.");
      }
    };

    fetchData();
  }, []);
  

  const handleCheckout = async () => {
    if (!paymentMethod) {
        Alert.alert("Error", "Please select a payment method to proceed.");
        return;
    }

    if (!recipientAddress) {
        Alert.alert("Error", "Please enter your delivery address to proceed.");
        return;
    }

    if (paymentMethod === "Cash on Delivery" && shippingDetails.locationCharge === 0) {
        Alert.alert("Error", "Please select another payment method.");
        return;
    }

    setLoading(true);
    const orderId = UUID.v4();
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
        if (["Mobile Money", "Credit Card"].includes(paymentMethod)) {
            await storeCheckoutDetailsLocally(checkoutDetails, addressDetails);

            const paymentUrl = await initiatePayment(checkoutDetails.totalAmount, cartItems, orderId);
            if (paymentUrl) {
                navigation.navigate("PaymentGatewayScreen", { url: paymentUrl });
            }
        } else {
            await processDirectCheckout(orderId, checkoutDetails, addressDetails);
            Alert.alert("Success", "Your order has been placed successfully!");
            navigation.navigate("OrderReceivedScreen");
        }
    } catch (error) {
        console.error("Checkout Error:", error);
        Alert.alert("Error", error.message || "An error occurred during checkout.");
    } finally {
        setLoading(false);
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
        const checkoutPayload = { Cartid: await AsyncStorage.getItem("cartId"), ...checkoutDetails };
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
    const encodedCredentials = btoa(`${username}:${password}`);

    const payload = {
        totalAmount,
        description: `Payment for ${cartItems.map((item) => item.productName).join(", ")}`,
        callbackUrl: "https://www.frankotrading.com/order-history",
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

        const result = await response.json();
        if (result.status === "Success") return result.data.checkoutUrl;
        throw new Error(`Payment initiation failed: ${result.message || "Unknown error"}`);
    } catch (error) {
        throw new Error("Payment initiation failed. Please try again.");
    }
};

const calculateTotalAmount = () => {
    return (
        cartItems.reduce((total, item) => total + (item.total || 0), 0) +
        (shippingDetails.locationCharge || 0)
    );
};

// Callback function to reload shipping details
const handleShippingDetailsUpdated = async (updatedDetails) => {
  setShippingDetails(updatedDetails);
};

  // Conditionally add Cash on Delivery to available payment methods if locationCharge > 0
  const availablePaymentMethods = ["Mobile Money", "Credit/Debit Card"];
  if (shippingDetails.locationCharge > 0 && shippingDetails.locationCharge !== "N/A") {
    availablePaymentMethods.unshift("Cash on Delivery");
  }
  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      <ScrollView>
        <View style={styles.header}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="#fff"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerText}>Confirm the Order</Text>
        </View>

        <View style={styles.customerDetailsContainer}>
          <View style={styles.formGroup}>
            <View style={styles.formField}>
              <Text style={styles.label}>Recipient Name</Text>
              <TextInput
                style={styles.inputField}
                value={recipientName}
                onChangeText={setRecipientName}
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.label}>Recipient Contact Number</Text>
              <TextInput
                style={styles.inputField}
                value={recipientContactNumber}
                onChangeText={setRecipientContactNumber}
                keyboardType="phone-pad"
              />
            </View>
            <Text style={styles.label}>Recipient Address</Text>
<View style={styles.addressRow}>
  <TextInput
    style={[styles.inputField, { flex: 1 }]}
    value={recipientAddress}
    placeholder="Enter your address"
    editable={false} // Ensure read-only to prevent manual input
  />
  <TouchableOpacity
    style={styles.changeButton}
    onPress={() => setShippingModalVisible(true)}
  >
    <Text style={styles.changeButtonText}>
      {recipientAddress === "Add Address" ? "Add Address" : "Change Address" }
    </Text>
  </TouchableOpacity>
</View>

          </View>
    

  <Text style={styles} >Order Note</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Add a note for your order"
          value={orderNote}
          onChangeText={setOrderNote}
        />
    </View>


        <View style={styles.divider} />

        <Text style={styles.sectionHeader}>Payment Method</Text>
{availablePaymentMethods.map((method) => (
  <TouchableOpacity
    key={method}
    style={[
      styles.paymentOption,
      paymentMethod === method && styles.selectedOption,
    ]}
    onPress={() => setPaymentMethod(method)}
  >
    <Ionicons
      name={
        paymentMethod === method
          ? "radio-button-on"
          : "radio-button-off"
      }
      size={20}
      color={paymentMethod === method ? "#AD2831" : "#777"}
    />
    <Text
      style={[
        styles.paymentText,
        paymentMethod === method && { color: "#AD2831" },
      ]}
    >
      {method}
    </Text>
  </TouchableOpacity>
))}

        <View style={styles.divider} />

      {/* Cart Items Section */}
<Text style={styles.sectionHeader}>Order Summary</Text>
{cartItems.length > 0 ? (
  cartItems.map((item) => {
    const backendBaseURL = "https://smfteapi.salesmate.app";
    const imageUrl = item.imagePath
      ? `${backendBaseURL}/Media/Products_Images/${item.imagePath
          .split("\\")
          .pop()}`
      : null;

    return (
      <View key={item.cartId} style={styles.cartItem}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.cartImage} />
        ) : (
          <Ionicons name="image" size={50} color="#ddd" />
        )}
        <View style={styles.cartDetails}>
          <Text style={styles.cartTitle}>{item.productName}</Text>
          <Text style={styles.cartQty}>Quantity: {item.quantity}</Text>
          <Text style={styles.cartPrice}>GH₵ {item.total}</Text>
        </View>
      </View>
    );
  })
) : (
  <Text style={styles.emptyCartMessage}>Your cart is empty.</Text>
)}


        <View style={styles.divider} />

        <Text style={styles.summaryRow}>
  Shipping Fee: GH₵ {shippingDetails.locationCharge || 0}
</Text>
<Text style={styles.summaryRow}>
  Total: GH₵{" "}
  {cartItems.reduce((total, item) => total + (item.total || 0), 0) +
    (shippingDetails.locationCharge || 0)}
</Text>
        <TouchableOpacity style={styles.submitButton} onPress={handleCheckout}>
          <Text style={styles.submitButtonText}>Place Order</Text>
          <Ionicons name="cart-sharp" size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>

      <ShippingComponent
        isVisible={isShippingModalVisible}
        onClose={() => setShippingModalVisible(false)}
        onShippingDetailsUpdated={handleShippingDetailsUpdated} // Pass callback
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1},
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#006838",
  },
  headerText: { color: "#fff", fontSize: 14, fontWeight: "bold", marginLeft: 10 },
  customerDetails: {
    padding: 10,
    borderRadius: 10,
   
    elevation: 2,
  },
  customerDetailsContainer: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    elevation: 2,
    
  },
  formGroup: {
    marginBottom: 15,
  },
  formField: { marginBottom: 10 },
  label: { fontSize: 14, marginBottom: 5 },
  inputField: { padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5 },
  textInput: { padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, marginBottom: 10 },
  customerName: { fontSize: 14, marginTop: 5 },
  divider: { height: 1, backgroundColor: "#ddd", marginVertical: 10 },
  sectionHeader: { fontSize: 14, padding: 20, fontWeight: "bold" , color: "#006838"},
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginHorizontal: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginVertical: 5,  
    elevation: 1,
  },
  formField: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputField: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10, // Add space between input and button
  },
  changeButton: {
    backgroundColor: "#AD2831",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  changeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  selectedOption: { backgroundColor: "#D5F9DE" },
  paymentText: { marginLeft: 10, fontSize: 16, color: "#000" },
  cartItem: {
    flexDirection: "row",
    padding: 15,
    marginHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginVertical: 5,
    elevation: 2,
  },
  cartImage: { width: 60, height: 60, marginRight: 15, borderRadius: 10 },
  cartDetails: { flex: 1 },
  cartTitle: { fontSize: 14, fontWeight: "bold" },
  cartQty: { fontSize: 14, color: "#555" },
  cartPrice: { fontSize: 16, fontWeight: "bold", color: "#e63946" },
  summary: { padding: 20, backgroundColor: "#fff", margin: 10, borderRadius: 10 },
  summaryRow: {
    fontSize: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
    fontWeight: "bold",
  },
  summaryTotal: { fontSize: 16, fontWeight: "bold", marginTop: 10, color: "#e63946" },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e63946",
    padding: 15,
    borderRadius: 10,
    margin: 20,
  },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 5 },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  emptyCartMessage: { fontSize: 16, textAlign: "center", marginTop: 20 },
});
export default CheckoutScreen;