import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Button } from 'react-native';
import { useDispatch } from 'react-redux';
import { updateOrderDelivery, checkOutOrder } from "../redux/slice/orderSlice"; // Adjust import path
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderPlacedScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);

  const clearAsyncStorageKeys = async () => {
    const keysToClear = [
      "checkoutDetails",
      "orderDeliveryDetails",
      "cartId",
      "cart",
      "cartDetails"
    ];
    try {
      await Promise.all(keysToClear.map((key) => AsyncStorage.removeItem(key)));
      console.log("Cart and order details cleared from storage.");
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
    }
  };

  useEffect(() => {
    const processOrder = async () => {
      try {
        const checkoutDetails = JSON.parse(await AsyncStorage.getItem("checkoutDetails"));
        const orderDeliveryDetails = JSON.parse(await AsyncStorage.getItem("orderDeliveryDetails"));

        if (!checkoutDetails || !orderDeliveryDetails) {
          throw new Error("Required order data not found in AsyncStorage.");
        }

        setOrderDetails(checkoutDetails);

        // Dispatch actions for checkout and delivery
        await dispatch(checkOutOrder({
          Cartid: checkoutDetails.Cartid,
          customerId: checkoutDetails.customerId,
          orderCode: checkoutDetails.orderCode,
          PaymentMode: checkoutDetails.PaymentMode,
          paymentService: checkoutDetails.paymentService,
          PaymentAccountNumber: checkoutDetails.PaymentAccountNumber,
          customerAccountType: checkoutDetails.customerAccountType
        }));

        await dispatch(updateOrderDelivery({
          orderCode: orderDeliveryDetails.orderCode,
          address: orderDeliveryDetails.address,
          recipientName: orderDeliveryDetails.recipientName,
          recipientContactNumber: orderDeliveryDetails.recipientContactNumber,
          orderNote: orderDeliveryDetails.orderNote,
          geoLocation: orderDeliveryDetails.geoLocation,
          Customerid: orderDeliveryDetails.Customerid
        }));

        // Clear AsyncStorage after successful dispatch
        await clearAsyncStorageKeys();
      } catch (error) {
        console.error("Error during order processing:", error);
      } finally {
        setLoading(false);
      }
    };

    processOrder();
  }, [dispatch]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Processing your order...</Text>
      </View>
    );
  }

  if (!orderDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Order details not found. Please try again later.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Thank You for Your Order!</Text>
      <Text style={styles.subText}>Your order has been successfully received and is being processed.</Text>

      <View style={styles.orderDetailsContainer}>
        <Text style={styles.orderText}>Order ID: <Text style={styles.boldText}>{orderDetails.orderId}</Text></Text>
        <Text style={styles.orderText}>Total Amount: <Text style={styles.boldText}>${orderDetails.totalAmount}</Text></Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="View Orders"
          onPress={() => navigation.navigate('OrderHistory')}
          color="#28a745"
        />
        <Button
          title="Back to Shopping"
          onPress={() => navigation.navigate('Home')}
          color="#007bff"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  orderDetailsContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  orderText: {
    fontSize: 18,
    marginVertical: 5,
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 20,
  },
});

export default OrderPlacedScreen;
