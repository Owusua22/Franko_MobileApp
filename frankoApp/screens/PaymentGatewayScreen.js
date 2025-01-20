import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Alert, BackHandler } from "react-native";
import { WebView } from "react-native-webview";

const PaymentGatewayScreen = ({ route, navigation }) => {
  const { url } = route.params; // The payment gateway URL passed from the previous screen.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle Android hardware back button
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      Alert.alert("Cancel Payment", "Are you sure you want to cancel the payment?", [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  const handleNavigationStateChange = (navState) => {
    if (navState.url.includes("order-success")) {
      Alert.alert("Success", "Payment was successful!");
      navigation.navigate("OrderPlacedScreen");
    } else if (navState.url.includes("order-cancelled")) {
      Alert.alert("Cancelled", "Payment was cancelled.");
      navigation.goBack();
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
