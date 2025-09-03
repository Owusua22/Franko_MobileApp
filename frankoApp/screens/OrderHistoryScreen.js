import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrdersByCustomer } from "../redux/slice/orderSlice";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import noOrders from "../assets/noOrders.avif";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import OrderModal from "../components/OrderDetailsModal"; // Import the OrderModal component

const { width } = Dimensions.get('window');

const OrderHistoryScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const ordersData = useSelector((state) => state.order);

  const orders = ordersData?.orders || [];
  const loading = ordersData?.loading?.orders || false;
  const error = ordersData?.error?.orders || null;

  const today = moment();
  const defaultFromDate = moment().subtract(3, 'months');
  const defaultToDate = today.clone();

  const [dateRange, setDateRange] = useState([defaultFromDate, defaultToDate]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState("from");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null); // Changed to store order ID
  const [customerId, setCustomerId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dateFilterExpanded, setDateFilterExpanded] = useState(false);

  // Quick date filter presets
  const datePresets = [
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 3 Months', days: 90 },
    { label: 'Last 6 Months', days: 180 },
    { label: 'This Year', days: moment().dayOfYear() },
  ];

  useEffect(() => {
    const getCustomerData = async () => {
      try {
        const customerData = await AsyncStorage.getItem("customer");
        if (customerData) {
          const customerObject = JSON.parse(customerData);
          setCustomerId(customerObject?.customerAccountNumber);
        }
      } catch (error) {
        console.error("Error getting customer data:", error);
      }
    };
    getCustomerData();
  }, []);

  useEffect(() => {
    if (customerId) {
      fetchOrders();
    }
  }, [dateRange, customerId, dispatch]);

  const fetchOrders = () => {
    const [from, to] = dateRange.map((date) => date.format("MM/DD/YYYY"));
    dispatch(fetchOrdersByCustomer({ from, to, customerId }));
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const updatedDateRange = [...dateRange];
      updatedDateRange[datePickerMode === "from" ? 0 : 1] = moment(selectedDate);
      setDateRange(updatedDateRange);
    }
  };

  const handlePresetFilter = (days) => {
    const fromDate = moment().subtract(days, 'days');
    const toDate = moment();
    setDateRange([fromDate, toDate]);
    setDateFilterExpanded(false);
  };

  const handleViewOrder = (order) => {
    // Set the order ID and open the modal
    setSelectedOrderId(order.id || order.orderCode); // Use appropriate ID field
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedOrderId(null);
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "delivered":
      case "delivery":
      case "completed":
        return "#10B981";
      case "pending":
      case "processing":
        return "#F59E0B";
      case "cancelled":
      case "canceled":
        return "#EF4444";
      case "shipped":
      case "shipping":
        return "#059669";
      default:
        return "#6B7280";
        case "Wrong Number":
        return "#EF4444";

    }
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "delivered":
      case "delivery":
      case "completed":
        return "check-circle";
      case "pending":
      case "processing":
        return "schedule";
      case "cancelled":
      case "canceled":
        return "cancel";
      case "Wrong Number":
        return "phone-disabled";

      case "shipping":
        return "local-shipping";
      default:
        return "help-outline";
    }
  };

  // Memoized render functions for better performance
  const renderOrderItem = React.useCallback(({ item, index }) => (
    <TouchableOpacity 
      style={[styles.orderCard, { marginTop: index === 0 ? 0 : 16 }]}
      onPress={() => handleViewOrder(item)}
      activeOpacity={0.95}
    >
      <View style={styles.orderCardContent}>
        <View style={styles.orderHeader}>
          <View style={styles.orderIdContainer}>
            <View style={styles.receiptIconContainer}>
              <Icon name="receipt-long" size={20} color="#10B981" />
            </View>
            <View>
              <Text style={styles.orderIdLabel}>Order ID</Text>
              <Text style={styles.orderId}>#{item?.orderCode?.slice(-6) || "N/A"}</Text>
            </View>
          </View>
          
          <View style={styles.viewOrderButton}>
            <Icon name="visibility" size={18} color="#10B981" />
            <Text style={styles.viewOrderText}>View Details</Text>
            <Icon name="chevron-right" size={16} color="#10B981" />
          </View>
        </View>
        
        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Icon name="calendar-today" size={16} color="#059669" />
            </View>
            <Text style={styles.orderDate}>
              {moment(item?.orderDate).format("MMMM DD, YYYY")}
            </Text>
          </View>
          
          <View style={styles.statusRow}>
            <View style={styles.detailIconContainer}>
              <Icon 
                name={getStatusIcon(item?.orderCycle)} 
                size={16} 
                color={getStatusColor(item?.orderCycle)} 
              />
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item?.orderCycle)}15` }]}>
              <Text style={[styles.orderStatus, { color: getStatusColor(item?.orderCycle) }]}>
                {item?.orderCycle || "Unknown"}
              </Text>
            </View>
          </View>
        </View>
        
        {item?.totalAmount && (
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Total Amount:</Text>
            <Text style={styles.amountValue}>${item.totalAmount.toFixed(2)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  ), []);

  const renderDateFilter = () => (
    <View style={styles.dateFilterContainer}>
      <TouchableOpacity 
        style={styles.dateFilterHeader}
        onPress={() => setDateFilterExpanded(!dateFilterExpanded)}
        activeOpacity={0.8}
      >
        <View style={styles.dateFilterTitleContainer}>
          <Icon name="filter-list" size={20} color="#10B981" />
          <Text style={styles.dateFilterTitle}>Filter Orders</Text>
        </View>
        <Icon 
          name={dateFilterExpanded ? "expand-less" : "expand-more"} 
          size={24} 
          color="#10B981" 
        />
      </TouchableOpacity>
      
      {dateFilterExpanded && (
        <View style={styles.dateFilterContent}>
          {/* Quick Presets */}
          <View style={styles.presetsContainer}>
            <Text style={styles.presetsTitle}>Quick Filters</Text>
            <View style={styles.presetsRow}>
              {datePresets.map((preset, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.presetButton}
                  onPress={() => handlePresetFilter(preset.days)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.presetButtonText}>{preset.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Date Range */}
          <View style={styles.customDateContainer}>
            <Text style={styles.customDateTitle}>Custom Date Range</Text>
            <View style={styles.dateButtonsRow}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  setDatePickerMode("from");
                  setShowDatePicker(true);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.dateButtonContent}>
                  <Icon name="event" size={18} color="#FFFFFF" />
                  <View style={styles.dateButtonText}>
                    <Text style={styles.dateButtonLabel}>From Date</Text>
                    <Text style={styles.dateButtonValue}>
                      {dateRange[0].format("MMM DD, YYYY")}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.dateSeparator}>
                <Icon name="arrow-forward" size={20} color="#10B981" />
              </View>

              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  setDatePickerMode("to");
                  setShowDatePicker(true);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.dateButtonContent}>
                  <Icon name="event" size={18} color="#FFFFFF" />
                  <View style={styles.dateButtonText}>
                    <Text style={styles.dateButtonLabel}>To Date</Text>
                    <Text style={styles.dateButtonValue}>
                      {dateRange[1].format("MMM DD, YYYY")}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Results Summary */}
          <View style={styles.resultsSummary}>
            <Icon name="info-outline" size={16} color="#059669" />
            <Text style={styles.resultsSummaryText}>
              Showing {orders.length} order{orders.length !== 1 ? 's' : ''} from {dateRange[0].format("MMM DD")} to {dateRange[1].format("MMM DD, YYYY")}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateImageContainer}>
        <Image source={noOrders} style={styles.emptyStateImage} />
      </View>
      <Text style={styles.emptyStateTitle}>No Orders Found</Text>
      <Text style={styles.emptyStateSubtitle}>
        You haven't placed any orders in the selected date range.{'\n'}
        Try adjusting your filters or start shopping!
      </Text>
      <TouchableOpacity 
        style={styles.startShoppingButton} 
        onPress={() => navigation.navigate("Home", { screen: "Products" })}
        activeOpacity={0.9}
      >
        <View style={styles.startShoppingContent}>
          <Icon name="shopping-bag" size={20} color="#FFFFFF" />
          <Text style={styles.startShoppingText}>Start Shopping</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Memoized transformed orders for better performance
const transformedOrders = useMemo(
  () => orders
    .map((order, index) => ({
      ...order,
      key: `${order.orderCode}-${order.orderDate}-${index}`, // ✅ Index makes it unique
    }))
    .sort((a, b) => moment(b.orderDate).diff(moment(a.orderDate))),
  [orders]
);


  return (
    <SafeAreaView style={styles.container}>    
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Icon name="history" size={28} color="#10B981" />
            <View style={styles.headerText}>
              <Text style={styles.title}>Order History</Text>
              <Text style={styles.subtitle}>
                Track all your orders in one place
              </Text>
            </View>
          </View>
        </View>
      </View>

      {renderDateFilter()}

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Failed to load orders</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrders} activeOpacity={0.8}>
            <View style={styles.retryContent}>
              <Icon name="refresh" size={18} color="#FFFFFF" />
              <Text style={styles.retryText}>Try Again</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : orders?.length > 0 ? (
        <FlatList 
          data={transformedOrders} 
          renderItem={renderOrderItem} 
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#10B981']}
              tintColor="#10B981"
            />
          }
        />
      ) : (
        renderEmptyState()
      )}

      {showDatePicker && (
        <DateTimePicker
          value={dateRange[datePickerMode === "from" ? 0 : 1].toDate()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* OrderModal Component */}
      <OrderModal
        orderId={selectedOrderId}
        isModalVisible={isModalVisible}
        onClose={handleModalClose}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingBottom: 2,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#065f46",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 16,
    color: "#059669",
    fontWeight: "500",
  },
  dateFilterContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dateFilterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dateFilterTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dateFilterTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#065f46",
    marginLeft: 8,
  },
  dateFilterContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  presetsContainer: {
    marginBottom: 20,
  },
  presetsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  presetsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetButton: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#065f46",
  },
  customDateContainer: {
    marginBottom: 16,
  },
  customDateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  dateButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#10B981",
    overflow: "hidden",
  },
  dateButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  dateButtonText: {
    marginLeft: 12,
    flex: 1,
  },
  dateButtonLabel: {
    fontSize: 12,
    color: "#d1fae5",
    marginBottom: 2,
    fontWeight: "500",
  },
  dateButtonValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  dateSeparator: {
    paddingHorizontal: 8,
  },
  resultsSummary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resultsSummaryText: {
    fontSize: 14,
    color: "#065f46",
    marginLeft: 8,
    fontWeight: "500",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  orderCard: {
    borderRadius: 16,
    backgroundColor: "#ffffff",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  orderCardContent: {
    padding: 20,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  orderIdContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  receiptIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  orderIdLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "800",
    color: "#065f46",
  },
  viewOrderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  viewOrderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#065f46",
    marginLeft: 4,
    marginRight: 2,
  },
  orderDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  orderDate: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: "700",
  },
  amountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: "#ecfdf5",
  },
  amountLabel: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  amountValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#065f46",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyStateImageContainer: {
    marginBottom: 32,
  },
  emptyStateImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#065f46",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: "#059669",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    fontWeight: "500",
  },
  startShoppingButton: {
    borderRadius: 25,
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  startShoppingContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  startShoppingText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#059669",
    marginTop: 16,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#EF4444",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    borderRadius: 12,
    backgroundColor: "#10B981",
  },
  retryContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
});

export default OrderHistoryScreen;