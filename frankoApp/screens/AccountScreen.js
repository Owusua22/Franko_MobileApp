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
import {
  fetchShippingCountries,
  fetchShippingDivisions,
  fetchShippingLocations,
} from "../redux/slice/shippingSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome"; // Importing icons

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
  const { countries, divisions, locations, loading: shippingLoading } = useSelector(
    (state) => state.shipping
  );

  // Fetch customer and shipping data from AsyncStorage
  useEffect(() => {
    const fetchData = async () => {
      try {
        const customer = await AsyncStorage.getItem("customer");
        const shipping = await AsyncStorage.getItem("shippingDetails");

        if (customer) setCustomerData(JSON.parse(customer));
        if (shipping) setShippingDetails(JSON.parse(shipping));
      } catch (error) {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    dispatch(fetchShippingCountries());
  }, [dispatch]);

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
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading account details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Customer Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        {customerData ? (
          <>
            <View style={styles.infoRow}>
              <Icon name="user" size={20} color="#000" style={styles.icon} />
              <Text style={styles.infoText}>{customerData.firstName} {customerData.lastName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="envelope" size={20} color="#000" style={styles.icon} />
              <Text style={styles.infoText}>{customerData.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="phone" size={20} color="#000" style={styles.icon} />
              <Text style={styles.infoText}>{customerData.contactNumber}</Text>
            </View>
          </>
        ) : (
          <View>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.registerText}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
              <Text style={styles.registerText}>Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Delivery Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <Text style={styles.infoText}>
          {shippingDetails
            ? `${shippingDetails.location}, ${shippingDetails.division}, ${shippingDetails.country}`
            : "No shipping details found"}
        </Text>
      </View>

      {/* Shipping Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Information</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>
            {shippingDetails ? "Update Shipping Details" : "Select Shipping Details"}
          </Text>
        </TouchableOpacity>
      </View>

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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  registerText: {
    color: "blue",
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
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
  },
});

export default AccountScreen;
