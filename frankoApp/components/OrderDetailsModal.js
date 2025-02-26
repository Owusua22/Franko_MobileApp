import React, { useEffect } from 'react';
import { View, Text, Modal, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSalesOrderById, fetchOrderDeliveryAddress } from '../redux/slice/orderSlice';
import Icon from 'react-native-vector-icons/FontAwesome';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

const OrderModal = ({ orderId, isModalVisible, onClose }) => {
  const dispatch = useDispatch();
  const { salesOrder = [], loading, error, deliveryAddress = [] } = useSelector((state) => state.orders || {});

  useEffect(() => {
    if (orderId) {
      console.log("Fetching sales order for ID:", orderId);
      dispatch(fetchSalesOrderById(orderId));
      dispatch(fetchOrderDeliveryAddress(orderId));
    }
  }, [dispatch, orderId]);
  

  if (loading) return <ActivityIndicator size="large" color="#4CAF50" />;
  if (error) return <Text>Error loading order: {error.message || 'An error occurred'}</Text>;
  if (!salesOrder || salesOrder.length === 0) return <Text>No order details available.</Text>;

  const order = salesOrder[0];
  const address = deliveryAddress?.[0] || {};
  const backendBaseURL = 'https://smfteapi.salesmate.app';
  const totalAmount = salesOrder.reduce((acc, item) => acc + item.total, 0);

  // Function to generate and download invoice as a PDF
  const downloadInvoice = async () => {
    const htmlContent = `
      <h2 style="text-align: center; color: #4CAF50;">Invoice</h2>
      <p><strong>Order Code:</strong> ${order?.orderCode}</p>
      <p><strong>Order Date:</strong> ${new Date(order?.orderDate).toLocaleDateString()}</p>
      <p><strong>Recipient:</strong> ${address?.recipientName || 'N/A'}</p>
      <p><strong>Contact:</strong> ${address?.recipientContactNumber || 'N/A'}</p>
      <p><strong>Address:</strong> ${address?.address || 'N/A'}</p>
      <table border="1" style="width: 100%; border-collapse: collapse;">
        <tr><th>SN</th><th>Product</th><th>Qty</th><th>Price (₵)</th></tr>
        ${salesOrder.map((item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.productName || 'N/A'}</td>
            <td>${item.quantity || 0}</td>
            <td>${formatPrice(item.price || 0)}</td>
          </tr>
        `).join('')}
      </table>
      <h3 style="text-align: right;">Total: ₵${formatPrice(totalAmount)}</h3>
    `;

    try {
      const options = {
        html: htmlContent,
        fileName: `Invoice_${order?.orderCode}`,
        directory: 'Documents',
      };
      const file = await RNHTMLtoPDF.convert(options);
      Alert.alert('Success', `Invoice saved at: ${file.filePath}`);
    } catch (err) {
      Alert.alert('Error', 'Failed to generate invoice.');
    }
  };

  const formatPrice = (amount) => amount.toFixed(2);

  return (
    <Modal visible={isModalVisible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Order: {order?.orderCode || 'Details'}</Text>

          <ScrollView style={{ maxHeight: 500 }}>
            <Text style={styles.detailText}><Icon name="calendar" size={16} /> Order Date: {new Date(order?.orderDate).toLocaleDateString()}</Text>

            {address && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <Text style={styles.detailText}><Icon name="user" size={16} /> Recipient: {address?.recipientName}</Text>
                <Text style={styles.detailText}><Icon name="phone" size={16} /> Contact: {address?.recipientContactNumber}</Text>
                <Text style={styles.detailText}><Icon name="home" size={16} /> Address: {address?.address}</Text>
                <Text style={styles.detailText}><Icon name="sticky-note" size={16} /> Note: {address?.orderNote}</Text>
              </View>
            )}

            {salesOrder.map((item, index) => {
              const imagePath = item?.imagePath;
              const imageUrl = imagePath ? `${backendBaseURL}/Media/Products_Images/${imagePath.split('\\').pop()}` : null;

              return (
                <View key={index} style={styles.productItem}>
                  {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.productImage} />
                  ) : (
                    <Text style={{ color: 'red' }}>Image not available.</Text>
                  )}
                  <View style={styles.productDetails}>
                    <Text style={styles.detailText}><Icon name="tag" size={16} /> {item?.productName || 'N/A'}</Text>
                    <Text style={styles.detailText}><Icon name="cube" size={16} /> Quantity: {item?.quantity || 0}</Text>
                    <Text style={styles.detailText}><Icon name="money" size={16} /> Price: ₵{formatPrice(item?.price || 0)}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.totalAmount}>Total: ₵{formatPrice(totalAmount)}</Text>
            <TouchableOpacity style={styles.downloadButton} onPress={downloadInvoice}>
              <Icon name="download" size={20} color="white" />
              <Text style={styles.downloadText}>Download Invoice</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  detailText: { fontSize: 14, marginBottom: 5 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  card: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 5, marginBottom: 10 },
  productItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  productImage: { width: 50, height: 50, borderRadius: 5, marginRight: 10 },
  productDetails: { flex: 1 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  totalAmount: { fontSize: 18, fontWeight: 'bold' },
  downloadButton: { flexDirection: 'row', backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, alignItems: 'center' },
  downloadText: { color: 'white', marginLeft: 5 },
  closeButton: { marginTop: 10, alignSelf: 'center' },
  closeButtonText: { color: 'red', fontSize: 16 },
};

export default OrderModal;
