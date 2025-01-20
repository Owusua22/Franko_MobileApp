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
<<<<<<< HEAD
import { fetchShippingCountries, fetchShippingDivisions, fetchShippingLocations } from "../redux/slice/shippingSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; 
import { updateAccountStatus } from "../redux/slice/customerSlice";
=======
import {
  fetchShippingCountries,
  fetchShippingDivisions,
  fetchShippingLocations,
} from "../redux/slice/shippingSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome"; // Importing icons
>>>>>>> 4418917 (Initial commit)

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
<<<<<<< HEAD
  const { countries, divisions, locations, loading: shippingLoading } = useSelector((state) => state.shipping);

=======
  const { countries, divisions, locations, loading: shippingLoading } = useSelector(
    (state) => state.shipping
  );

  // Fetch customer and shipping data from AsyncStorage
>>>>>>> 4418917 (Initial commit)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const customer = await AsyncStorage.getItem("customer");
        const shipping = await AsyncStorage.getItem("shippingDetails");
<<<<<<< HEAD
        if (customer) setCustomerData(JSON.parse(customer));
        if (shipping) setShippingDetails(JSON.parse(shipping));
      } catch (error) {
        console.error("Error fetching user data:", error);
=======

        if (customer) setCustomerData(JSON.parse(customer));
        if (shipping) setShippingDetails(JSON.parse(shipping));
      } catch (error) {
        // Handle error
>>>>>>> 4418917 (Initial commit)
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    dispatch(fetchShippingCountries());
  }, [dispatch]);

<<<<<<< HEAD
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
=======
  const handleSaveShippingDetails = async () => {
    try {
      const selectedLocationDetails = locations.find(
        (location) => location.locationCode === selectedLocation
      );
      const selectedDivisionDetails = divisions.find(
        (division) => division.divisionCode === selectedDivision
      );

      const shippingDetails = {
        country: selectedCountry,
        division: selectedDivisionDetails?.divisionName || "",
        location: selectedLocationDetails?.locationName || "",
        shippingCharge: selectedLocationDetails?.shippingCharge || 0,
      };

      await AsyncStorage.setItem("shippingDetails", JSON.stringify(shippingDetails));
      setShippingDetails(shippingDetails);
      Alert.alert("Success", "Shipping details saved successfully!");
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "Failed to save shipping details.");
    }
>>>>>>> 4418917 (Initial commit)
  };

  if (loading) {
    return (
      <View style={styles.centered}>
<<<<<<< HEAD
        <ActivityIndicator size="large" color="#007AFF" />
=======
        <ActivityIndicator size="large" color="#0000ff" />
>>>>>>> 4418917 (Initial commit)
        <Text>Loading account details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
<<<<<<< HEAD
      {/* Account Information */}
      <View style={styles.card}>
=======
      {/* Customer Information */}
      <View style={styles.section}>
>>>>>>> 4418917 (Initial commit)
        <Text style={styles.sectionTitle}>Account Information</Text>
        {customerData ? (
          <>
            <View style={styles.infoRow}>
<<<<<<< HEAD
              <Icon name="account" size={22} color="#555" style={styles.icon} />
              <Text style={styles.infoText}>{customerData.firstName} {customerData.lastName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="email" size={22} color="#555" style={styles.icon} />
              <Text style={styles.infoText}>{customerData.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="phone" size={22} color="#555" style={styles.icon} />
=======
              <Icon name="user" size={20} color="#000" style={styles.icon} />
              <Text style={styles.infoText}>{customerData.firstName} {customerData.lastName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="envelope" size={20} color="#000" style={styles.icon} />
              <Text style={styles.infoText}>{customerData.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="phone" size={20} color="#000" style={styles.icon} />
>>>>>>> 4418917 (Initial commit)
              <Text style={styles.infoText}>{customerData.contactNumber}</Text>
            </View>
          </>
        ) : (
          <View>
<<<<<<< HEAD
            <TouchableOpacity onPress={() => navigation.navigate("Signup")} style={styles.authButton}>
              <Text style={styles.authButtonText}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("SignIn")} style={styles.authButton}>
              <Text style={styles.authButtonText}>Login</Text>
=======
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.registerText}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
              <Text style={styles.registerText}>Login</Text>
>>>>>>> 4418917 (Initial commit)
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Delivery Address */}
<<<<<<< HEAD
      <View style={styles.card}>
=======
      <View style={styles.section}>
>>>>>>> 4418917 (Initial commit)
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <Text style={styles.infoText}>
          {shippingDetails
            ? `${shippingDetails.location}, ${shippingDetails.division}, ${shippingDetails.country}`
            : "No shipping details found"}
        </Text>
      </View>

      {/* Shipping Information */}
<<<<<<< HEAD
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Shipping Information</Text>
        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
=======
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Information</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalVisible(true)}
        >
>>>>>>> 4418917 (Initial commit)
          <Text style={styles.buttonText}>
            {shippingDetails ? "Update Shipping Details" : "Select Shipping Details"}
          </Text>
        </TouchableOpacity>
      </View>

<<<<<<< HEAD
      {/* Delete Account Button (Only if customer details exist) */}
      {customerData && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      )}
=======
      {/* Shipping Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Shipping Details</Text>

            {shippingLoading ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading shipping details...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.label}>Select Country</Text>
                <Picker
                  selectedValue={selectedCountry}
                  onValueChange={(itemValue) => {
                    setSelectedCountry(itemValue);
                    setSelectedDivision("");
                    setSelectedLocation("");
                    dispatch(fetchShippingDivisions(itemValue));
                  }}
                >
                  <Picker.Item label="Select Country" value="" />
                  {countries.map((country) => (
                    <Picker.Item key={country.countryCode} label={country.countryName} value={country.countryCode} />
                  ))}
                </Picker>

                {selectedCountry && (
                  <>
                    <Text style={styles.label}>Select Division</Text>
                    <Picker
                      selectedValue={selectedDivision}
                      onValueChange={(itemValue) => {
                        setSelectedDivision(itemValue);
                        setSelectedLocation("");
                        dispatch(fetchShippingLocations(itemValue));
                      }}
                    >
                      <Picker.Item label="Select Division" value="" />
                      {divisions.map((division) => (
                        <Picker.Item key={division.divisionCode} label={division.divisionName} value={division.divisionCode} />
                      ))}
                    </Picker>
                  </>
                )}

                {selectedDivision && (
                  <>
                    <Text style={styles.label}>Select Location</Text>
                    <Picker
                      selectedValue={selectedLocation}
                      onValueChange={(itemValue) => setSelectedLocation(itemValue)}
                    >
                      <Picker.Item label="Select Location" value="" />
                      {locations.map((location) => (
                        <Picker.Item
                          key={location.locationCode}
                          label={`${location.locationName} - ₵${location.shippingCharge || "N/A"}`}
                          value={location.locationCode}
                        />
                      ))}
                    </Picker>
                  </>
                )}

                <TouchableOpacity
                  style={[styles.button, { marginTop: 20 }]}
                  onPress={handleSaveShippingDetails}
                >
                  <Text style={styles.buttonText}>Save Shipping Details</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
>>>>>>> 4418917 (Initial commit)
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
<<<<<<< HEAD
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
=======
    padding: 20,
  },
  section: {
    marginBottom: 20,
>>>>>>> 4418917 (Initial commit)
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
<<<<<<< HEAD
    marginBottom: 12,
    color: "#333",
=======
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 10,
>>>>>>> 4418917 (Initial commit)
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
<<<<<<< HEAD
    marginBottom: 12,
=======
    marginBottom: 10,
>>>>>>> 4418917 (Initial commit)
  },
  icon: {
    marginRight: 10,
  },
<<<<<<< HEAD
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
=======
  registerText: {
    color: "blue",
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "green",
    padding: 10,
>>>>>>> 4418917 (Initial commit)
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
<<<<<<< HEAD
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
=======
  label: {
    fontSize: 16,
    marginBottom: 10,
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  closeButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 16,
>>>>>>> 4418917 (Initial commit)
  },
});

export default AccountScreen;
