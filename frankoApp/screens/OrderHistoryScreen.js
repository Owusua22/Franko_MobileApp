import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrdersByCustomer } from "../redux/slice/orderSlice";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Image,
  Button,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import noOrders from "../assets/noOrders.avif";
import AsyncStorage from "@react-native-async-storage/async-storage";

const OrderHistoryScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const ordersData = useSelector((state) => state.order);

  const orders = ordersData?.orders || [];
  const loading = ordersData?.loading?.orders || false;
  const error = ordersData?.error?.orders || null;

  const today = moment();
  const defaultFromDate = moment("01/01/2000", "MM/DD/YYYY");
  const defaultToDate = today.clone().add(1, "days");

  const [dateRange, setDateRange] = useState([defaultFromDate, defaultToDate]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState("from");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [customerId, setCustomerId] = useState(null);

  useEffect(() => {
    const getCustomerData = async () => {
      try {
        const customerData = await AsyncStorage.getItem("customer");
        if (customerData) {
          const customerObject = JSON.parse(customerData);
          setCustomerId(customerObject?.customerAccountNumber);
        }
      } catch (error) {}
    };
    getCustomerData();
  }, []);

  useEffect(() => {
    if (customerId) {
      const [from, to] = dateRange.map((date) => date.format("MM/DD/YYYY"));
      dispatch(fetchOrdersByCustomer({ from, to, customerId }));
    }
  }, [dateRange, customerId, dispatch]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const updatedDateRange = [...dateRange];
      updatedDateRange[datePickerMode === "from" ? 0 : 1] = moment(selectedDate);
      setDateRange(updatedDateRange);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity style={styles.orderCard} onPress={() => handleViewOrder(item)}>
      <Text style={styles.orderId}>Order ID: {item?.orderCode?.slice(-6) || "N/A"}</Text>
      <Text style={styles.orderDate}>
        Date: {moment(item?.orderDate).format("MM/DD/YYYY")}
      </Text>
      <Text style={[styles.orderStatus, getStatusStyle(item?.orderCycle)]}>
        Status: {item?.orderCycle || "N/A"}
      </Text>
    </TouchableOpacity>
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "delivery":
        return { color: "#28a745", fontWeight: "bold" };
      case "Pending":
        return { color: "#ffc107", fontWeight: "bold" };
      case "Cancelled":
        return { color: "#dc3545", fontWeight: "bold" };
      default:
        return { color: "#6c757d", fontWeight: "bold" };
    }
  };

  const transformedOrders = orders
    .map((order) => ({
      ...order,
      key: `${order.orderCode}-${order.orderDate}`,
    }))
    .sort((a, b) => (moment(b.orderDate).isBefore(moment(a.orderDate)) ? 1 : -1));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order History</Text>

      {orders?.length > 0 && (
        <View style={styles.datePickerContainer}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              setDatePickerMode("from");
              setShowDatePicker(true);
            }}
          >
            <Text style={styles.dateButtonText}>From: {dateRange[0].format("MM/DD/YYYY")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              setDatePickerMode("to");
              setShowDatePicker(true);
            }}
          >
            <Text style={styles.dateButtonText}>To: {dateRange[1].format("MM/DD/YYYY")}</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#f00" />
      ) : error ? (
        <Text style={styles.errorText}>Error: {error}</Text>
      ) : orders?.length > 0 ? (
        <FlatList data={transformedOrders} renderItem={renderOrderItem} keyExtractor={(item) => item.key} />
      ) : (
        <View style={styles.noOrdersContainer}>
          <Image source={noOrders} style={styles.noOrdersImage} />
          <Text style={styles.noOrdersText}>You have no orders yet.</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => navigation.navigate("home", { screen: "Products" })}>
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={dateRange[datePickerMode === "from" ? 0 : 1].toDate()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Modal visible={isModalVisible} animationType="slide" onRequestClose={handleModalClose}>
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
  container: { flex: 1, padding: 16, backgroundColor: "#f8f9fa" },
  title: { fontSize: 24, fontWeight: "bold", color: "#dc3545", marginBottom: 16, textAlign: "center" },
  datePickerContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  dateButton: { padding: 10, backgroundColor: "#007bff", borderRadius: 5 },
  dateButtonText: { color: "#fff", fontWeight: "bold" },
  orderCard: { padding: 16, backgroundColor: "#fff", borderRadius: 10, marginBottom: 10, elevation: 3 },
  orderId: { fontSize: 16, fontWeight: "bold" },
  orderDate: { fontSize: 14, color: "#555" },
  orderStatus: { fontSize: 14 },
  noOrdersContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  shopButton: { backgroundColor: "#dc3545", padding: 10, borderRadius: 5 },
  shopButtonText: { color: "#fff", fontWeight: "bold" },
});

export default OrderHistoryScreen;
