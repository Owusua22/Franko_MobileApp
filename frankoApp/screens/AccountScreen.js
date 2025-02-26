import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchShippingCountries, fetchShippingDivisions, fetchShippingLocations } from "../redux/slice/shippingSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; 
import { updateAccountStatus } from "../redux/slice/customerSlice";

const AccountScreen = () => {
  const [customerData, setCustomerData] = useState(null);
  const [shippingDetails, setShippingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { countries, divisions, locations, loading: shippingLoading } = useSelector((state) => state.shipping);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customer = await AsyncStorage.getItem("customer");
        const shipping = await AsyncStorage.getItem("shippingDetails");
        if (customer) setCustomerData(JSON.parse(customer));
        if (shipping) setShippingDetails(JSON.parse(shipping));
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
          onPress: async () => {
            try {
              const result = await dispatch(updateAccountStatus()).unwrap();
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading account details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Account Information */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        {customerData ? (
          <>
            <View style={styles.infoRow}>
              <Icon name="account" size={22} color="#555" style={styles.icon} />
              <Text style={styles.infoText}>{customerData.firstName} {customerData.lastName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="email" size={22} color="#555" style={styles.icon} />
              <Text style={styles.infoText}>{customerData.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="phone" size={22} color="#555" style={styles.icon} />
              <Text style={styles.infoText}>{customerData.contactNumber}</Text>
            </View>
          </>
        ) : (
          <View>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")} style={styles.authButton}>
              <Text style={styles.authButtonText}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("SignIn")} style={styles.authButton}>
              <Text style={styles.authButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Delivery Address */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <Text style={styles.infoText}>
          {shippingDetails
            ? `${shippingDetails.location}, ${shippingDetails.division}, ${shippingDetails.country}`
            : "No shipping details found"}
        </Text>
      </View>

      {/* Shipping Information */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Shipping Information</Text>
        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>
            {shippingDetails ? "Update Shipping Details" : "Select Shipping Details"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Delete Account Button (Only if customer details exist) */}
      {customerData && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F7F8FA",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 16,
    color: "#555",
  },
  authButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  authButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#28A745",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 16,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AccountScreen;
