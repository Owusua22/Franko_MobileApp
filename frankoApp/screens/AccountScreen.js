import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { fetchShippingCountries } from "../redux/slice/shippingSlice";
import { updateAccountStatus } from "../redux/slice/customerSlice";

const AccountScreen = () => {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading account details...</Text>
      </View>
    );
  }

  const orderActions = [
    { name: "To Pay", icon: "credit-card-outline" },
    { name: "To Receive", icon: "truck-outline" },
    { name: "To Rate", icon: "star-outline", badge: true },
    { name: "After sale", icon: "archive-outline" },
  ];

  const accountOptions = [
    { name: "Invite friends", icon: "gift-outline", extra: "Receive Reward", screen: "Invite" },
    { name: "Recently Viewed", icon: "clock-outline", screen: "RecentlyViewed" },
    { name: "Address Management", icon: "map-marker-outline", screen: "AddressManagement" },
    { name: "Contact customer service", icon: "phone-outline", screen: "CustomerService" },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View>
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
                  <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                    <Text style={styles.registerText}>Register</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
                    <Text style={styles.registerText}>Login</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {customerData && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              </TouchableOpacity>
            )}

            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.sectionTitle}>My Order</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.orderActions}>
                {orderActions.map((item, index) => (
                  <View key={index} style={styles.orderItem}>
                    <Icon name={item.icon} size={26} color="#333" />
                    {item.badge && <View style={styles.badge} />}
                    <Text style={styles.orderText}>{item.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        }
        data={accountOptions}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate(item.screen)}>
            <View style={styles.listLeft}>
              <Icon name={item.icon} size={22} color="#555" />
              <Text style={styles.listText}>{item.name}</Text>
            </View>
            {item.extra && (
              <View style={styles.extraTag}>
                <Text style={styles.extraText}>{item.extra}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8", padding: 10, paddingBottom: 90 },
  card: { backgroundColor: "#fff", padding: 15, margin: 10, borderRadius: 10, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "bold" },
  infoRow: { flexDirection: "row", alignItems: "center", marginVertical: 5 },
  icon: { marginRight: 10 },
  infoText: { fontSize: 14, color: "#333" },
  registerText: { color: "#00A86B", textAlign: "center", marginTop: 10 },
  deleteButton: { backgroundColor: "#FF6347", padding: 6, borderRadius: 7, margin: 10, alignItems: "center" },
  deleteButtonText: { color: "#fff", fontSize: 12 },
  orderCard: { backgroundColor: "#fff", margin: 10, padding: 15, borderRadius: 10, elevation: 2 },
  orderHeader: { flexDirection: "row", justifyContent: "space-between" },
  viewAll: { color: "#00A86B", fontSize: 14 },
  orderActions: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
  orderItem: { alignItems: "center" },
  orderText: { fontSize: 14, marginTop: 5 },
  badge: { position: "absolute", top: -5, right: -5, width: 10, height: 10, backgroundColor: "red", borderRadius: 5 },
  listItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  listLeft: { flexDirection: "row", alignItems: "center" },
  listText: { marginLeft: 10, fontSize: 14, color: "#333" },
  extraTag: { backgroundColor: "#00A86B", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
  extraText: { color: "#fff", fontSize: 12 },
});

export default AccountScreen;