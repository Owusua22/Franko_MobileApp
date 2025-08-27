import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ScrollView,
  StatusBar,
  Dimensions,
  Platform,
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
    const subject = encodeURIComponent("Customer Support Inquiry");
    const body = encodeURIComponent("Hello,\n\nI need assistance with:\n\n");
    const mailtoUrl = `mailto:it@frankotrading.com?subject=${subject}&body=${body}`;
    Linking.openURL(mailtoUrl);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Hello! I need customer support assistance.");
    Linking.openURL(`https://wa.me/233246422338?text=${message}`);
  };

  const handleSocialMedia = (platform, url) => {
    Linking.openURL(url);
  };

  const contactMethods = [
    {
      id: 1,
      title: "Phone Support",
      subtitle: "Talk to our support team",
      description: "Get immediate assistance",
      icon: "phone",
      value: "+233 302 225 651",
      action: handleCall,
      color: "#059669",
      bgColor: "#F0FDF4",
      iconBg: "rgba(5, 150, 105, 0.1)",
    },
    {
      id: 2,
      title: "Email Support",
      subtitle: "Send us your queries",
      description: "We'll respond within 24 hours",
      icon: "email-outline",
      value: "it@frankotrading.com",
      action: handleEmail,
      color: "#3B82F6",
      bgColor: "#EFF6FF",
      iconBg: "rgba(59, 130, 246, 0.1)",
    },
    {
      id: 3,
      title: "WhatsApp Chat",
      subtitle: "Quick messaging support",
      description: "Real-time chat assistance",
      icon: "whatsapp",
      value: "+233 246 422 338",
      action: handleWhatsApp,
      color: "#25D366",
      bgColor: "#F0FDF4",
      iconBg: "rgba(37, 211, 102, 0.1)",
    },
  ];

  const socialMediaLinks = [
    {
      id: 1,
      name: "Facebook",
   
      icon: "facebook",
      color: "#1877F2",
      bgColor: "#EFF6FF",
      url: "https://www.facebook.com/frankotradingenterprise"
    },
    {
      id: 2,
      name: "Instagram",

      icon: "instagram",
      color: "#E4405F",
      bgColor: "#FDF2F8",
      url: "https://instagram.com/frankotrading_fte"
    },
    {
      id: 3,
      name: "Twitter",

      icon: "twitter",
      color: "#1DA1F2",
      bgColor: "#EFF6FF",
      url: "https://x.com/frankotrading1"
    },
    {
      id: 4,
      name: "TikTok",

      icon: "music-note",
      color: "#000000",
      bgColor: "#F9FAFB",
      url: "https://www.tiktok.com/@frankotrading"
    }
  ];


  return (
    <View style={styles.container}>
    
      
      {/* Enhanced Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <View style={styles.backButtonCircle}>
            <Icon name="arrow-left" size={22} color="#059669" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Icon name="headset" size={22} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Customer Support</Text>
          <Text style={styles.headerSubtitle}>
            We're here to help you!
          </Text>
        </View>
        
        {/* Decorative elements */}
        <View style={[styles.decorativeCircle, styles.circle1]} />
        <View style={[styles.decorativeCircle, styles.circle2]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Methods */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Get In Touch</Text>
            <Text style={styles.sectionSubtitle}>Choose your preferred contact method</Text>
          </View>
          
          {contactMethods.map((method, index) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.contactCard,
                { backgroundColor: method.bgColor },
                index === contactMethods.length - 1 && styles.lastCard
              ]}
              onPress={method.action}
              activeOpacity={0.7}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: method.iconBg }]}>
                <Icon name={method.icon} size={28} color={method.color} />
              </View>
              
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{method.title}</Text>
                <Text style={styles.contactSubtitle}>{method.subtitle}</Text>
                <Text style={styles.contactDescription}>{method.description}</Text>
                <Text style={[styles.contactValue, { color: method.color }]}>
                  {method.value}
                </Text>
              </View>
              
              <View style={[styles.chevronContainer, { backgroundColor: method.color }]}>
                <Icon name="chevron-right" size={18} color="#fff" />
              </View>
            </TouchableOpacity>
          ))}
        </View>


        {/* Social Media Links */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Connect With Us</Text>
            <Text style={styles.sectionSubtitle}>Follow us for updates and news</Text>
          </View>
          
          <View style={styles.socialMediaGrid}>
            {socialMediaLinks.map((social) => (
              <TouchableOpacity
                key={social.id}
                style={[styles.socialMediaCard, { backgroundColor: social.bgColor }]}
                onPress={() => handleSocialMedia(social.name, social.url)}
                activeOpacity={0.7}
              >
                <View style={[styles.socialIconContainer, { backgroundColor: social.color }]}>
                  <Icon name={social.icon} size={22} color="#fff" />
                </View>
                <Text style={styles.socialMediaName}>{social.name}</Text>
                <Text style={styles.socialMediaUsername}>{social.username}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Enhanced Support Hours */}
        <View style={styles.supportHoursCard}>
          <View style={styles.supportHoursHeader}>
            <View style={styles.clockIconContainer}>
              <Icon name="clock-outline" size={24} color="#059669" />
            </View>
            <View>
              <Text style={styles.supportHoursTitle}>Business Hours</Text>
              <Text style={styles.supportHoursSubtitle}>Ghana Standard Time (GMT)</Text>
            </View>
          </View>
          
          <View style={styles.supportHoursList}>
            <View style={styles.supportHoursItem}>
              <View style={styles.dayContainer}>
                <Text style={styles.dayText}>Monday - Saturday</Text>
                <View style={styles.statusDot} />
              </View>
              <Text style={styles.timeText}>8:00 AM - 6:00 PM</Text>
            </View>
            
            <View style={[styles.supportHoursItem, styles.lastHoursItem]}>
              <View style={styles.dayContainer}>
                <Text style={styles.dayText}>Public Holidays</Text>
                <View style={[styles.statusDot, styles.limitedDot]} />
              </View>
              <Text style={styles.timeText}>8:00 AM - 5:00 PM</Text>
            </View>
          </View>
          
          <View style={styles.responseTimeInfo}>
            <Icon name="information-outline" size={16} color="#6B7280" />
            <Text style={styles.responseTimeText}>
              Average response time: 2-4 hours during business hours
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    backgroundColor: "#059669",

    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    overflow: "hidden",
    position: "relative",
  },
  decorativeCircle: {
    position: "absolute",
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  circle1: {
    width: 120,
    height: 120,
    top: -30,
    right: -20,
  },
  circle2: {
    width: 80,
    height: 80,
    bottom: -20,
    left: -10,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 55 : StatusBar.currentHeight + 25,
    left: 20,
    zIndex: 10,
  },
  backButtonCircle: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    alignItems: "center",
    paddingTop: 10,
  },
  headerIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 50,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontWeight: "400",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "400",
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  lastCard: {
    marginBottom: 0,
  },
  contactIconContainer: {
    borderRadius: 20,
    padding: 16,
    marginRight: 20,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 8,
    fontStyle: "italic",
  },
  contactValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  chevronContainer: {
    borderRadius: 15,
    padding: 8,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  quickActionCard: {
    width: (width - 60) / 2,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  quickActionIcon: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  socialMediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  socialMediaCard: {
    width: (width - 60) / 2,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  socialIconContainer: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  socialMediaName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    marginBottom: 2,
  },
  socialMediaUsername: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  supportHoursCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  supportHoursHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  clockIconContainer: {
    backgroundColor: "rgba(5, 150, 105, 0.1)",
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
  },
  supportHoursTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  supportHoursSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  supportHoursList: {
    gap: 16,
    marginBottom: 20,
  },
  supportHoursItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  lastHoursItem: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  dayContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dayText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
    marginRight: 8,
  },
  timeText: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "600",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  limitedDot: {
    backgroundColor: "#F59E0B",
  },
  responseTimeInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  responseTimeText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 8,
    flex: 1,
  },
});

export default CustomerServiceScreen;