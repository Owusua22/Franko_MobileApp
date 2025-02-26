import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

const CustomerServiceScreen = () => {
  const navigation = useNavigation();

  const handleCall = () => {
    Linking.openURL("tel:+233302225651");
  };

  const handleEmail = () => {
    Linking.openURL("mailto:it@frankotrading.com");
  };

  const handleWhatsApp = () => {
    Linking.openURL("https://wa.me/+233555939311");
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Service</Text>
        <Text style={styles.headerSubtitle}>
          Need help? Contact us via call, email, or WhatsApp.
        </Text>
      </View>

      {/* Online Communication Button */}
      <TouchableOpacity style={styles.onlineButton}>
        <Text style={styles.onlineButtonText}>🗨️ Chat with us</Text>
      </TouchableOpacity>

      {/* Contact Options */}
      <TouchableOpacity style={styles.contactBox} onPress={handleCall}>
        <Icon name="phone" size={24} color="#00cc66" />
        <Text style={styles.contactText}>+233 302 225 651</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.contactBox} onPress={handleEmail}>
        <Icon name="email" size={24} color="#00cc66" />
        <Text style={styles.contactText}>it@frankotrading.com</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.contactBox} onPress={handleWhatsApp}>
        <Icon name="whatsapp" size={24} color="#00cc66" />
        <Text style={styles.contactText}>+233 555 939 311</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
   
  },
  header: {
    width: "100%",
    paddingVertical: 15,
    paddingHorizontal: 15,
    alignItems: "center",
    backgroundColor: "#00cc66",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    position: "absolute",
    left: 15,
    top: 25,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  onlineButton: {
    backgroundColor: "#00cc66",
    width: "90%",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 15,
    shadowColor: "#00cc66",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 3,
  },
  onlineButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  contactBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    width: "90%",
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  contactText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});

export default CustomerServiceScreen;
