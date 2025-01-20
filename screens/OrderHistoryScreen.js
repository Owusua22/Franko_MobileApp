import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrdersByCustomer } from "../redux/slice/orderSlice";
import {View,Text,FlatList, TouchableOpacity, ActivityIndicator,
  StyleSheet,
  Modal,
  Image,
  Button,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import noOrders from "../assets/noOrders.avif";
import AsyncStorage from "@react-native-async-storage/async-storage";

const OrderHistoryScreen = () => {
  const dispatch = useDispatch();
  const ordersData = useSelector(state => state.order); // Ensure that ordersData is pointing to the state correctly

  // Access specific values from ordersData
  const orders = ordersData?.orders || []; // Default to an empty array if undefined
  const loading = ordersData?.loading?.orders || false; // Ensure loading is correctly referenced
  const error = ordersData?.error?.orders || null; // Ensure error is correctly referenced

  const today = moment();
  const defaultFromDate = moment("01/01/2000", "MM/DD/YYYY");
  const defaultToDate = today.clone().add(1, "days");

  const [dateRange, setDateRange] = useState([defaultFromDate, defaultToDate]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState("from");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [customerId, setCustomerId] = useState(null);

  // Fetch customer ID from AsyncStorage
  useEffect(() => {
    const getCustomerData = async () => {
      try {
        const customerData = await AsyncStorage.getItem("customer");
        if (customerData) {
          const customerObject = JSON.parse(customerData);
          setCustomerId(customerObject?.customerAccountNumber); // Set customerId from AsyncStorage
        } else {
         
        }
      } catch (error) {
       
      }
    };

    getCustomerData();
  }, []);

  // Dispatch action to fetch orders once customerId is available
  useEffect(() => {
    if (customerId) {
      const [from, to] = dateRange.map((date) => date.format("MM/DD/YYYY"));
    
  
      dispatch(fetchOrdersByCustomer({ from, to, customerId }));
    }
  }, [dateRange, customerId, dispatch]); // Only run when dateRange or customerId changes
  
  // Logging the Redux state after dispatch
  useEffect(() => {
    // Logs Redux state after dispatch

  
    if (ordersData) {
      // You can also check specific parts of the state for success or error messages
      if (ordersData.loading) {
     
      } else if (ordersData.error) {
      
      } else if (ordersData.orders && ordersData.orders.length > 0) {
      
      } else {
      
      }
    }
  }, [ordersData]); // Run this effect whenever ordersData changes
  
  // Handle date changes for the date picker
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const updatedDateRange = [...dateRange];
      updatedDateRange[datePickerMode === "from" ? 0 : 1] = moment(selectedDate);
      setDateRange(updatedDateRange);
    }
  };

  // Handle viewing a specific order in a modal
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  // Close the modal
  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  // Render each order item in the FlatList
  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleViewOrder(item)}
    >
      <Text style={styles.orderId}>Order ID: {item?.orderCode?.slice(-6) || "N/A"}</Text>
      <Text style={styles.orderDate}>Date: {moment(item?.orderDate).format("MM/DD/YYYY")}</Text>
      <Text style={styles.orderStatus}>Status: {item?.orderCycle || "N/A"}</Text>
    </TouchableOpacity>
  );

  const transformedOrders = orders
    .map((order) => ({
      ...order,
      key: `${order.orderCode}-${order.orderDate}`, // Ensure uniqueness by combining orderCode with orderDate
    }))
    .sort((a, b) =>
      moment(b.orderDate).isBefore(moment(a.orderDate)) ? 1 : -1
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order History</Text>

      {/* Date Range Pickers */}
      {orders?.length > 0 && (
        <View style={styles.datePickerContainer}>
          <Button
            title={`From: ${dateRange[0].format("MM/DD/YYYY")}`}
            onPress={() => {
              setDatePickerMode("from");
              setShowDatePicker(true);
            }}
          />
          <Button
            title={`To: ${dateRange[1].format("MM/DD/YYYY")}`}
            onPress={() => {
              setDatePickerMode("to");
              setShowDatePicker(true);
            }}
          />
        </View>
      )}

      {/* Loading or Error Display */}
      {loading ? (
        <ActivityIndicator size="large" color="#f00" />
      ) : error ? (
        <Text style={styles.errorText}>Error: {error}</Text>
      ) : orders?.length > 0 ? (
        <FlatList
          data={transformedOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.key}
        />
      ) : (
        <View style={styles.noOrdersContainer}>
          <Image source={noOrders} style={styles.noOrdersImage} />
          <Text style={styles.noOrdersText}>You have no orders yet.</Text>
          <Button
            title="Start Shopping"
            color="#f00"
            onPress={() => alert("Redirect to shopping page")}
          />
        </View>
      )}

      {/* DateTime Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={dateRange[datePickerMode === "from" ? 0 : 1].toDate()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Modal for Order Details */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Order Details</Text>
          <Text>Order ID: {selectedOrder?.orderCode || "N/A"}</Text>
          <Text>Date: {moment(selectedOrder?.orderDate).format("MM/DD/YYYY")}</Text>
          <Text>Status: {selectedOrder?.orderCycle || "N/A"}</Text>
          <Button title="Close" onPress={handleModalClose} />
        </View>
      </Modal>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f00",
    marginBottom: 16,
    textAlign: "center",
  },
  datePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  orderCard: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
  },
  orderDate: {
    fontSize: 14,
    color: "#555",
  },
  orderStatus: {
    fontSize: 14,
    color: "#007b00",
  },
  noOrdersContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noOrdersImage: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  noOrdersText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  errorText: {
    color: "#f00",
    textAlign: "center",
  },
  modalContent: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
});

export default OrderHistoryScreen;
