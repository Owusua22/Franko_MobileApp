import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSalesOrderById, fetchOrderDeliveryAddress } from '../redux/slice/orderSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Optional imports with error handling
let RNHTMLtoPDF = null;
let RNPrint = null;

try {
  RNHTMLtoPDF = require('react-native-html-to-pdf');
} catch (error) {
  console.warn('RNHTMLtoPDF not available:', error.message);
}

try {
  RNPrint = require('react-native-print');
} catch (error) {
  console.warn('RNPrint not available:', error.message);
}

const { width, height } = Dimensions.get('window');

const OrderModal = ({ orderId, orderCode, isModalVisible, onClose }) => {
  const dispatch = useDispatch();
  const { salesOrder = [], loading, error, deliveryAddress = [] } =
    useSelector((state) => state.order || {});
  const [imagePreview, setImagePreview] = useState({ visible: false, url: null });

  useEffect(() => {
    if (orderId && isModalVisible) {
      
      dispatch(fetchSalesOrderById(orderId));
      dispatch(fetchOrderDeliveryAddress(orderId));
    }
  }, [dispatch, orderId, isModalVisible]);

  const formatPrice = (amount) => parseFloat(amount || 0).toFixed(2);
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Alternative invoice generation methods
  const generateInvoiceHTML = () => {
    if (!salesOrder || salesOrder.length === 0) return null;
    
    const order = salesOrder[0];
    const address = deliveryAddress?.[0] || {};
    const totalAmount = salesOrder.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice - ${order?.orderCode || orderCode}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            color: #333; 
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 20px;
          }
          .company-name { 
            color: #4CAF50; 
            font-size: 32px; 
            font-weight: bold; 
            margin-bottom: 10px; 
          }
          .company-info { 
            font-size: 14px; 
            color: #666; 
          }
          .invoice-title { 
            font-size: 36px; 
            color: #4CAF50; 
            font-weight: bold; 
            margin: 30px 0; 
            text-align: center;
            text-transform: uppercase;
          }
          .invoice-info { 
            margin-bottom: 30px; 
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
          }
          .customer-info { 
            margin-bottom: 30px; 
            background: #e3f2fd;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2196F3;
          }
          .section-title { 
            color: #4CAF50; 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 15px; 
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 5px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 15px; 
            text-align: left; 
          }
          th { 
            background-color: #4CAF50; 
            color: white; 
            font-weight: bold; 
            text-transform: uppercase;
            font-size: 12px;
          }
          tr:nth-child(even) { 
            background-color: #f9f9f9; 
          }
          tr:hover { 
            background-color: #f5f5f5; 
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .total-section {
            margin-top: 30px;
            background: #f0f8ff;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #4CAF50;
          }
          .total-row { 
            font-weight: bold; 
            font-size: 24px; 
            color: #4CAF50; 
            text-align: right;
            margin-top: 15px;
          }
          .footer { 
            margin-top: 50px; 
            text-align: center; 
            color: #888; 
            font-size: 12px; 
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .info-item {
            background: white;
            padding: 10px;
            border-radius: 4px;
            border-left: 3px solid #4CAF50;
          }
          .info-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .info-value {
            font-weight: bold;
            color: #333;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Franko Trading Ltd.</div>
          <div class="company-info">
            123 Adabraka Street, Accra, Ghana<br>
            Contact: +233 123 456 789 | Email: online@frankotrading.com<br>
            Website: www.frankotrading.com
          </div>
        </div>
        
        <div class="invoice-title">INVOICE</div>
        
        <div class="invoice-info">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Order Code</div>
              <div class="info-value">${order?.orderCode || orderCode}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Order Date</div>
              <div class="info-value">${formatDate(order?.orderDate)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Invoice Date</div>
              <div class="info-value">${formatDate(new Date())}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Status</div>
              <div class="info-value">Active Order</div>
            </div>
          </div>
        </div>
        
        <div class="customer-info">
          <div class="section-title">📦 Delivery Information</div>
          <div class="info-grid">
            <div>
              <div class="info-label">👤 Recipient Name</div>
              <div class="info-value">${address?.recipientName || 'N/A'}</div>
            </div>
            <div>
              <div class="info-label">📞 Contact Number</div>
              <div class="info-value">${address?.recipientContactNumber || 'N/A'}</div>
            </div>
          </div>
          <div style="margin-top: 15px;">
            <div class="info-label">🏠 Delivery Address</div>
            <div class="info-value">${address?.address || 'N/A'}</div>
          </div>
          ${address?.orderNote ? `
            <div style="margin-top: 15px;">
              <div class="info-label">📝 Special Notes</div>
              <div class="info-value">${address.orderNote}</div>
            </div>
          ` : ''}
        </div>
        
        <div class="section-title">🛒 Order Items</div>
        <table>
          <thead>
            <tr>
              <th class="text-center">SN</th>
              <th>Product Name</th>
              <th class="text-center">Quantity</th>
              <th class="text-right">Unit Price (₵)</th>
              <th class="text-right">Total (₵)</th>
            </tr>
          </thead>
          <tbody>
            ${salesOrder.map((item, index) => `
              <tr>
                <td class="text-center" style="font-weight: bold;">${index + 1}</td>
                <td style="font-weight: 600;">${item.productName || 'N/A'}</td>
                <td class="text-center">${item.quantity || 0}</td>
                <td class="text-right">₵${formatPrice(item.price)}</td>
                <td class="text-right" style="font-weight: bold; color: #4CAF50;">₵${formatPrice(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total-section">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 14px; color: #666;">Total Items: <strong>${salesOrder.reduce((acc, item) => acc + item.quantity, 0)}</strong></div>
              <div style="font-size: 14px; color: #666; margin-top: 5px;">Payment Status: <strong>Pending</strong></div>
            </div>
            <div class="total-row">
              TOTAL: ₵${formatPrice(totalAmount)}
            </div>
          </div>
        </div>
        
        <div class="footer">
          <strong>Thank you for your business!</strong><br>
          This is a computer-generated invoice. No signature required.<br>
          For any queries, please contact us at online@frankotrading.com
        </div>
      </body>
      </html>
    `;
  };

  const downloadInvoice = async () => {
    if (!salesOrder || salesOrder.length === 0) {
      Alert.alert('Error', 'No order data available to generate invoice.');
      return;
    }

    const order = salesOrder[0];
    const invoiceHTML = generateInvoiceHTML();

    // Method 1: Try with RNHTMLtoPDF (if available)
    if (RNHTMLtoPDF && RNHTMLtoPDF.convert) {
      try {
        const options = {
          html: invoiceHTML,
          fileName: `Invoice_${order?.orderCode || orderCode}_${Date.now()}`,
          directory: Platform.OS === 'ios' ? 'Documents' : 'Download',
          base64: false,
          width: 612,
          height: 792,
          padding: 24,
        };

        const file = await RNHTMLtoPDF.convert(options);
        
        // Try to print on iOS
        if (Platform.OS === 'ios' && RNPrint && RNPrint.print) {
          await RNPrint.print({ filePath: file.filePath });
        }
        
        Alert.alert(
          'Success', 
          `Invoice generated successfully!\n\nSaved to: ${file.filePath}`,
          [
            {
              text: 'OK',
              style: 'default'
            },
            {
              text: 'Open Location',
              onPress: () => {
                // Try to open file location (Android)
                if (Platform.OS === 'android') {
                  Linking.openURL(`file://${file.filePath}`).catch(() => {
                    console.log('Could not open file location');
                  });
                }
              }
            }
          ]
        );
        return;
      } catch (err) {
        console.error('RNHTMLtoPDF Error:', err);
        // Continue to fallback methods
      }
    }

    // Method 2: Try with web print (if RNPrint is available)
    if (RNPrint && RNPrint.print) {
      try {
        await RNPrint.print({
          html: invoiceHTML,
          jobName: `Invoice_${order?.orderCode || orderCode}`,
        });
        return;
      } catch (err) {
        console.error('RNPrint Error:', err);
        // Continue to fallback methods
      }
    }

    // Method 3: Fallback - Save HTML content and show instructions
    try {
      // Create a simple text representation
      const textInvoice = `
INVOICE - ${order?.orderCode || orderCode}
=====================================

Order Date: ${formatDate(order?.orderDate)}
Invoice Date: ${formatDate(new Date())}

Delivery Information:
- Recipient: ${deliveryAddress?.[0]?.recipientName || 'N/A'}
- Contact: ${deliveryAddress?.[0]?.recipientContactNumber || 'N/A'}
- Address: ${deliveryAddress?.[0]?.address || 'N/A'}
${deliveryAddress?.[0]?.orderNote ? `- Notes: ${deliveryAddress[0].orderNote}` : ''}

Order Items:
${salesOrder.map((item, index) => `
${index + 1}. ${item.productName || 'N/A'}
   Quantity: ${item.quantity || 0}
   Unit Price: ₵${formatPrice(item.price)}
   Subtotal: ₵${formatPrice(item.price * item.quantity)}
`).join('')}

Total Items: ${salesOrder.reduce((acc, item) => acc + item.quantity, 0)}
TOTAL AMOUNT: ₵${formatPrice(salesOrder.reduce((total, item) => total + (item.price * item.quantity), 0))}

---
Franko Trading Ltd.
Thank you for your business!
      `;

      Alert.alert(
        'Invoice Ready',
        'PDF generation libraries are not available. Here are your options:',
        [
          {
            text: 'View Text Version',
            onPress: () => {
              Alert.alert('Invoice Details', textInvoice);
            }
          },
          {
            text: 'Copy HTML',
            onPress: () => {
              // Note: You might want to implement clipboard functionality here
              Alert.alert(
                'HTML Ready',
                'HTML content has been prepared. You can copy it and save as .html file to print from browser.',
                [
                  {
                    text: 'Show HTML',
                    onPress: () => {
                      Alert.alert('HTML Content', invoiceHTML.substring(0, 500) + '...');
                    }
                  },
                  { text: 'OK' }
                ]
              );
            }
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
    } catch (err) {
      console.error('Fallback Error:', err);
      Alert.alert('Error', 'Unable to generate invoice. Please try again later.');
    }
  };

  const backendBaseURL = 'https://smfteapi.salesmate.app';
  const totalAmount = salesOrder.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItems = salesOrder.reduce((acc, item) => acc + item.quantity, 0);

  const renderProductImage = (item) => {
    const imagePath = item?.imagePath;
    const imageUrl = imagePath
      ? `${backendBaseURL}/Media/Products_Images/${imagePath.split('\\').pop()}`
      : null;

    return (
      <TouchableOpacity 
        style={styles.productImageContainer}
        onPress={() => imageUrl && setImagePreview({ visible: true, url: imageUrl })}
        activeOpacity={0.8}
      >
        <View style={styles.imageWrapper}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.productImage}
              onError={() => console.log('Image failed to load')}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Icon name="inventory" size={32} color="#9ca3af" />
            </View>
          )}
          
          {/* Quantity Badge */}
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityBadgeText}>{item?.quantity || 0}</Text>
          </View>
          
          {/* View Icon Overlay */}
          {imageUrl && (
            <View style={styles.viewOverlay}>
              <Icon name="visibility" size={16} color="white" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Loading State
  if (loading) {
    return (
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Loading order details...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  // Error State
  if (error) {
    return (
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <View style={styles.errorIcon}>
              <Icon name="error-outline" size={48} color="#ef4444" />
            </View>
            <Text style={styles.errorTitle}>Unable to load order</Text>
            <Text style={styles.errorText}>{error?.message || error || 'An unexpected error occurred'}</Text>
            <TouchableOpacity style={styles.errorButton} onPress={onClose}>
              <Text style={styles.errorButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Empty State
  if (!salesOrder || salesOrder.length === 0) {
    return (
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <View style={styles.emptyIcon}>
              <Icon name="inbox" size={64} color="#9ca3af" />
            </View>
            <Text style={styles.emptyTitle}>No order details found</Text>
            <Text style={styles.emptyText}>Please check the order code and try again</Text>
            <TouchableOpacity style={styles.errorButton} onPress={onClose}>
              <Text style={styles.errorButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  const order = salesOrder[0];
  const address = deliveryAddress?.[0] || {};

  return (
    <>
      <Modal visible={isModalVisible} transparent animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.headerLeft}>
                  <View style={styles.headerIcon}>
                    <Icon name="receipt" size={24} color="white" />
                  </View>
                  <View>
                    <Text style={styles.headerTitle}>Order Details</Text>
                    <Text style={styles.headerSubtitle}>#{orderCode}</Text>
                  </View>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>Active Order</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeIconButton} onPress={onClose}>
                <Icon name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView 
              style={styles.scrollContent} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContentContainer}
            >
              
              {/* Summary Cards Row */}
              <View style={styles.summaryCardsRow}>
                <View style={[styles.summaryCard, styles.dateCard]}>
                  <View style={styles.summaryCardIcon}>
                    <Icon name="event" size={20} color="white" />
                  </View>
                  <View style={styles.summaryCardContent}>
                    <Text style={styles.summaryCardLabel}>Order Date</Text>
                    <Text style={styles.summaryCardValue}>
                      {formatDate(order?.orderDate)}
                    </Text>
                  </View>
                </View>

                <View style={[styles.summaryCard, styles.itemsCard]}>
                  <View style={[styles.summaryCardIcon, styles.itemsCardIcon]}>
                    <Icon name="shopping-cart" size={20} color="white" />
                  </View>
                  <View style={styles.summaryCardContent}>
                    <Text style={styles.summaryCardLabel}>Total Items</Text>
                    <Text style={[styles.summaryCardValue, styles.itemsValue]}>{totalItems}</Text>
                  </View>
                </View>

                <View style={[styles.summaryCard, styles.amountCard]}>
                  <View style={[styles.summaryCardIcon, styles.amountCardIcon]}>
                    <Icon name="attach-money" size={20} color="white" />
                  </View>
                  <View style={styles.summaryCardContent}>
                    <Text style={styles.summaryCardLabel}>Amount</Text>
                    <Text style={[styles.summaryCardValue, styles.amountValue]}>₵{formatPrice(totalAmount)}</Text>
                  </View>
                </View>
              </View>

              {/* Delivery Information Card */}
              <View style={styles.deliveryCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.cardHeaderIcon}>
                      <Icon name="local-shipping" size={20} color="white" />
                    </View>
                    <Text style={styles.cardHeaderTitle}>Delivery Information</Text>
                  </View>
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.deliveryInfoGrid}>
                    <View style={styles.deliveryInfoSection}>
                      <View style={styles.infoRow}>
                        <View style={styles.infoIconWrapper}>
                          <Icon name="person" size={18} color="#6366f1" />
                        </View>
                        <View style={styles.infoTextContainer}>
                          <Text style={styles.infoLabel}>Recipient Name</Text>
                          <Text style={styles.infoValue}>{address?.recipientName || 'N/A'}</Text>
                        </View>
                      </View>

                      <View style={styles.infoRow}>
                        <View style={styles.infoIconWrapper}>
                          <Icon name="phone" size={18} color="#10b981" />
                        </View>
                        <View style={styles.infoTextContainer}>
                          <Text style={styles.infoLabel}>Contact Number</Text>
                          <Text style={styles.infoValue}>{address?.recipientContactNumber || 'N/A'}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.deliveryInfoSection}>
                      <View style={styles.infoRow}>
                        <View style={styles.infoIconWrapper}>
                          <Icon name="location-on" size={18} color="#3b82f6" />
                        </View>
                        <View style={styles.infoTextContainer}>
                          <Text style={styles.infoLabel}>Delivery Address</Text>
                          <Text style={styles.infoValue}>{address?.address || 'N/A'}</Text>
                        </View>
                      </View>

                      {address?.orderNote && (
                        <View style={styles.infoRow}>
                          <View style={styles.infoIconWrapper}>
                            <Icon name="note" size={18} color="#8b5cf6" />
                          </View>
                          <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Special Notes</Text>
                            <Text style={[styles.infoValue, styles.noteText]}>{address.orderNote}</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>

              {/* Order Items Card */}
              <View style={styles.orderItemsCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.cardHeaderIcon, styles.orderItemsIcon]}>
                      <Icon name="shopping-cart" size={20} color="white" />
                    </View>
                    <Text style={styles.cardHeaderTitle}>Order Items</Text>
                  </View>
                  <View style={styles.itemsCountBadge}>
                    <Text style={styles.itemsCountBadgeText}>{salesOrder.length}</Text>
                  </View>
                </View>

                <View style={styles.cardContent}>
                  {salesOrder.map((item, index) => (
                    <View key={index} style={styles.productItem}>
                      {renderProductImage(item)}
                      
                      <View style={styles.productDetails}>
                        <View style={styles.productHeader}>
                          <Text style={styles.productName}>{item?.productName || 'Product Name Not Available'}</Text>
                          <Text style={styles.productItemNumber}>Item #{index + 1}</Text>
                        </View>
                        
                        <View style={styles.productInfoGrid}>
                          <View style={styles.productInfoItem}>
                            <Text style={styles.productInfoLabel}>Qty</Text>
                            <Text style={[styles.productInfoValue, styles.quantityValue]}>{item?.quantity || 0}</Text>
                          </View>
                          <View style={styles.productInfoItem}>
                            <Text style={styles.productInfoLabel}>Unit Price</Text>
                            <Text style={[styles.productInfoValue, styles.priceValue]}>₵{formatPrice(item?.price || 0)}</Text>
                          </View>
                          <View style={styles.productInfoItem}>
                            <Text style={styles.productInfoLabel}>Subtotal</Text>
                            <Text style={[styles.productInfoValue, styles.subtotalValue]}>
                              ₵{formatPrice((item?.price || 0) * (item?.quantity || 0))}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.footerContent}>
                <View style={styles.footerTotals}>
                  <View style={styles.totalSection}>
                    <Text style={styles.totalItemsLabel}>Total Items</Text>
                    <Text style={styles.totalItemsValue}>{totalItems}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.totalSection}>
                    <Text style={styles.totalAmountLabel}>Total Amount</Text>
                    <Text style={styles.totalAmountValue}>₵{formatPrice(totalAmount)}</Text>
                  </View>
                </View>
              
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Image Preview Modal */}
      <Modal visible={imagePreview.visible} transparent animationType="fade">
        <View style={styles.imagePreviewContainer}>
          <TouchableOpacity 
            style={styles.imagePreviewBackdrop}
            onPress={() => setImagePreview({ visible: false, url: null })}
            activeOpacity={1}
          >
            <View style={styles.imagePreviewContent}>
              <Image
                source={{ uri: imagePreview.url }}
                style={styles.previewImage}
                resizeMode="contain"
              />
              <TouchableOpacity 
                style={styles.closePreviewButton}
                onPress={() => setImagePreview({ visible: false, url: null })}
              >
                <Icon name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: width * 0.95,
    height: height * 0.9,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
  },
  // Loading States

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  loadingCard: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  // Error States
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  errorCard: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    maxWidth: 320,
  },
  errorIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#fee2e2',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  // Header
  header: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  statusBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  closeIconButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  // Scroll Content
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
  },
  // Summary Cards
  summaryCardsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  dateCard: {
    backgroundColor: '#dbeafe',
    borderColor: '#bfdbfe',
  },
  itemsCard: {
    backgroundColor: '#dcfce7',
    borderColor: '#bbf7d0',
  },
  amountCard: {
    backgroundColor: '#fed7aa',
    borderColor: '#fdba74',
  },
  summaryCardIcon: {
    backgroundColor: '#3b82f6',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemsCardIcon: {
    backgroundColor: '#10b981',
  },
  amountCardIcon: {
    backgroundColor: '#f97316',
  },
  summaryCardContent: {
    alignItems: 'center',
  },
  summaryCardLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  summaryCardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  itemsValue: {
    color: '#10b981',
    fontSize: 18,
  },
  amountValue: {
    color: '#f97316',
    fontSize: 16,
  },
  // Delivery Card
  deliveryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  cardHeader: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  cardHeaderTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cardContent: {
    padding: 20,
  },
  deliveryInfoGrid: {
    gap: 16,
  },
  deliveryInfoSection: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoIconWrapper: {
    marginRight: 12,
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    lineHeight: 20,
  },
  noteText: {
    fontStyle: 'italic',
    color: '#6b7280',
  },
  // Order Items Card
  orderItemsCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  orderItemsIcon: {
    backgroundColor: '#10b981',
  },
  itemsCountBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  itemsCountBadgeText: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '600',
  },
  // Product Items
  productItem: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  productImageContainer: {
    marginRight: 10,
    position: 'relative',
  },
  imageWrapper: {
    position: 'relative',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  placeholderImage: {
    width: 96,
    height: 96,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  quantityBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#10b981',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  quantityBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 4,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productHeader: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 18,
  },
  productItemNumber: {
    fontSize: 12,
    color: '#6b7280',
  },
  productInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 2,
    marginLeft: -30,
  },
  productInfoItem: {
    flex: 1,
    alignItems: 'center',

    borderRadius: 8,
  },
  productInfoLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  productInfoValue: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  quantityValue: {
    color: '#3b82f6',
  
  },
  priceValue: {
    color: '#10b981',
    backgroundColor: '#dcfce7',
  },
  subtotalValue: {
    color: '#f97316',
    backgroundColor: '#fed7aa',
  },
  // Footer
  footer: {
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerTotals: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  totalSection: {
    alignItems: 'center',
  },
  totalItemsLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  totalItemsValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#d1d5db',
  },
  totalAmountLabel: {
   
    color: '#6b7280',
    marginBottom: 2,
  },
  totalAmountValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  downloadButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  downloadButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  // Image Preview Modal
  imagePreviewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  imagePreviewBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewContent: {
    position: 'relative',
    maxWidth: width * 0.9,
    maxHeight: height * 0.8,
  },
  previewImage: {
    width: width * 0.9,
    height: height * 0.6,
    borderRadius: 8,
  },
  closePreviewButton: {
    position: 'absolute',
    top: -40,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
});

export default OrderModal;