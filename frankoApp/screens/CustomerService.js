import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ScrollView,
  StatusBar,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const CustomerServiceScreen = () => {
  const navigation = useNavigation();

  const handleCall = () => {
    Linking.openURL("tel:+233302225651");
  };

  const handleEmail = () => {
    Linking.openURL("mailto:it@frankotrading.com");
  };

  const handleWhatsApp = () => {
    Linking.openURL("https://wa.me/+233555939311");
  };

  const handleLiveChat = () => {
    // Add your live chat functionality here
    console.log("Opening live chat...");
  };

  const contactMethods = [
    {
      id: 1,
      title: "Phone Support",
      subtitle: "Call us directly",
      icon: "phone",
      value: "+233 302 225 651",
      action: handleCall,
      color: "#4CAF50",
      bgColor: "#E8F5E8",
    },
    {
      id: 2,
      title: "Email Support",
      subtitle: "Send us an email",
      icon: "email",
      value: "it@frankotrading.com",
      action: handleEmail,
      color: "#2196F3",
      bgColor: "#E3F2FD",
    },
    {
      id: 3,
      title: "WhatsApp",
      subtitle: "Chat on WhatsApp",
      icon: "whatsapp",
      value: "+233 555 939 311",
      action: handleWhatsApp,
      color: "#25D366",
      bgColor: "#E8F8F5",
    },
  ];

  const quickActions = [
    { id: 1, title: "FAQ", icon: "help-circle", color: "#FF9800", bgColor: "#FFF3E0" },
    { id: 2, title: "Feedback", icon: "star", color: "#E91E63", bgColor: "#FCE4EC" },
    { id: 3, title: "Report Issue", icon: "alert-circle", color: "#F44336", bgColor: "#FFEBEE" },
    { id: 4, title: "Live Chat", icon: "message", color: "#9C27B0", bgColor: "#F3E5F5", action: handleLiveChat },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <View style={styles.backButtonCircle}>
            <Icon name="arrow-left" size={24} color="#1976D2" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Icon name="headset" size={28} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Customer Support</Text>
          <Text style={styles.headerSubtitle}>
            We're here to help
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
       


        {/* Contact Methods */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          {contactMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.contactCard, { backgroundColor: method.bgColor }]}
              onPress={method.action}
              activeOpacity={0.8}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: method.color }]}>
                <Icon name={method.icon} size={28} color="#fff" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{method.title}</Text>
                <Text style={styles.contactSubtitle}>{method.subtitle}</Text>
                <Text style={[styles.contactValue, { color: method.color }]}>
                  {method.value}
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Support Hours */}
        <View style={styles.supportHoursCard}>
          <View style={styles.supportHoursHeader}>
            <Icon name="clock-outline" size={24} color="#1976D2" />
            <Text style={styles.supportHoursTitle}>Support Hours</Text>
          </View>
          <View style={styles.supportHoursList}>
            <View style={styles.supportHoursItem}>
              <Text style={styles.dayText}>Monday - Saturday</Text>
              <Text style={styles.timeText}>8:00 AM - 6:00 PM</Text>
            </View>
            <View style={styles.supportHoursItem}>
              <Text style={styles.dayText}>Holidays</Text>
              <Text style={styles.timeText}>08:00 AM - 5:00 PM</Text>
            </View>
            
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingBottom: 40,
  },
  header: {
    backgroundColor: "#059669",
    paddingTop: 10,
    paddingBottom: 5,
    paddingHorizontal: 5,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
  },
  backButtonCircle: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  headerContent: {
    alignItems: "center",
    paddingTop: 10,
  },
  headerIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 40,
    padding: 10,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  liveChatCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
  },
  liveChatContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#764ba2",
  },
  chatIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 30,
    padding: 12,
    marginRight: 16,
  },
  liveChatText: {
    flex: 1,
  },
  liveChatTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  liveChatSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
  },
  arrowContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 8,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    paddingLeft: 4,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionCard: {
    width: (width - 60) / 2,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    borderRadius: 30,
    padding: 12,
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  contactIconContainer: {
    borderRadius: 30,
    padding: 12,
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 1,
  },
  contactSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  supportHoursCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  supportHoursHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  supportHoursTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 12,
  },
  supportHoursList: {
    gap: 12,
  },
  supportHoursItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dayText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  timeText: {
    fontSize: 14,
    color: "#666",
  },
});

export default CustomerServiceScreen;