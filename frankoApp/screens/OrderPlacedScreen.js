import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { useDispatch } from 'react-redux';
import { updateOrderDelivery, checkOutOrder } from "../redux/slice/orderSlice";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

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
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Processing your order...</Text>
          <Text style={styles.loadingSubText}>Please wait while we confirm your order</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!orderDetails) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>Order details not found</Text>
          <Text style={styles.errorSubText}>Please try again later or contact support</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Success Icon and Header */}
        <View style={styles.successHeader}>
          <View style={styles.successIconContainer}>
            <Text style={styles.successIcon}>✅</Text>
          </View>
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Thank you for your purchase. Your order has been received and is being processed.
          </Text>
        </View>

        {/* Order Details Card */}
        <View style={styles.orderCard}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          
          <View style={styles.orderDetailRow}>
            <Text style={styles.orderLabel}>Order ID</Text>
            <Text style={styles.orderValue}>{orderDetails.orderId || orderDetails.orderCode}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.orderDetailRow}>
            <Text style={styles.orderLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>${orderDetails.totalAmount || '0.00'}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.orderDetailRow}>
            <Text style={styles.orderLabel}>Payment Method</Text>
            <Text style={styles.orderValue}>{orderDetails.PaymentMode || 'N/A'}</Text>
          </View>
        </View>

        {/* Status Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.cardTitle}>Order Status</Text>
          <View style={styles.timelineItem}>
            <View style={styles.timelineIconActive}>
              <Text style={styles.timelineIconText}>✓</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Order Confirmed</Text>
              <Text style={styles.timelineSubtitle}>Your order has been placed successfully</Text>
            </View>
          </View>
          
          <View style={styles.timelineItem}>
            <View style={styles.timelineIconInactive}>
              <Text style={styles.timelineIconText}>2</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitleInactive}>Processing</Text>
              <Text style={styles.timelineSubtitle}>We're preparing your order</Text>
            </View>
          </View>
          
          <View style={styles.timelineItem}>
            <View style={styles.timelineIconInactive}>
              <Text style={styles.timelineIconText}>3</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitleInactive}>On the way</Text>
              <Text style={styles.timelineSubtitle}>Your order is being delivered</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('OrderHistory')}
          >
            <Text style={styles.primaryButtonText}>📋 View Orders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.secondaryButtonText}>🏠 Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  
  // Loading States
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Error States
  errorContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Success Header
  successHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#e8f5e8',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  
  // Cards
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timelineCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  
  // Order Details
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  orderLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  orderValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
  },
  totalAmount: {
    fontSize: 18,
    color: '#2e7d32',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  
  // Timeline
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineIconActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIconInactive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  timelineTitleInactive: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  timelineSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  
  // Buttons
  buttonContainer: {
    gap: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderPlacedScreen;