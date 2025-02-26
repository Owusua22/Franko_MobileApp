import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const OrderCancellationScreen = () => {
  const navigation = useNavigation();

  const handleBackToShopping = () => {
    navigation.navigate("Home"); // Replace "Home" with the actual route name of your shopping screen
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.textCenter}>
          <Text style={styles.title}>Order Cancellation</Text>
          <Text style={styles.subtitle}>
            We're sorry to hear you're cancelling your order.
          </Text>

          {/* Cancellation Information */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Please note:</Text>
            <Text style={styles.infoText}>
              Cancelling an order will remove it from our system, and you will
              not be charged for this purchase.
            </Text>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleBackToShopping}
          >
            <Text style={styles.buttonText}>Back To Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    width: "100%",
    maxWidth: 400,
    padding: 16,
  },
  textCenter: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#dc2626", // Tailwind's red-600
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#4b5563", // Tailwind's gray-600
    marginBottom: 24,
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: "#fef3c7", // Tailwind's yellow-100
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b", // Tailwind's yellow-500
    padding: 12,
    marginBottom: 24,
    width: "100%",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#b45309", // Tailwind's yellow-700
  },
  infoText: {
    fontSize: 14,
    color: "#b45309", // Tailwind's yellow-700
  },
  button: {
    backgroundColor: "#10b981", // Tailwind's green-500
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 200,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default OrderCancellationScreen;
