import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Alert, BackHandler } from "react-native";
import { WebView } from "react-native-webview";

const PaymentGatewayScreen = ({ route, navigation }) => {
  const { url } = route.params; // Payment gateway URL
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle Android hardware back button
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      Alert.alert("Cancel Payment", "Are you sure you want to cancel the payment?", [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            navigation.navigate("CheckoutScreen", {
              fromPayment: true,
              paymentCancelled: true,
            
            });
          },
        },
      ]);
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  const handleNavigationStateChange = (navState) => {
    const { url } = navState;


    if (url.includes("order-success")) {
      Alert.alert("Success", "Payment was successful!");
      navigation.navigate("OrderPlacedScreen");
    } else if (url.includes("payment-failed") || url.includes("order-cancelled")) {
      Alert.alert("Payment Failed", "The payment was not successful. Please try again.");
      navigation.navigate("OrderCancellationScreen");
    } else if (url.includes("order-history")) {
      console.log("Callback URL triggered:", url);
    } else {

    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <ActivityIndicator size="large" color="#007BFF" style={styles.loading} />
      )}
      <WebView
        source={{ uri: url }}
        onLoad={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loading: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
});

export default PaymentGatewayScreen;
