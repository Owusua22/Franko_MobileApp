import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Shield,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  CreditCard,
  FileText,
  Info,
} from "lucide-react-native"; // make sure you install lucide-react-native
import logo from "../assets/frankoIcon.png";

const TermsScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Scroll to top when mounted (ScrollView starts at top by default)
  }, []);

  const handleContactSupport = () => {
    navigation.navigate("CustomerService"); // Change to your contact screen route
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.wrapper}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.title}>FRANKO TRADING LIMITED</Text>
          <Text style={styles.subtitle}>
            Your trusted partner in electronics. Review our terms and policies
            for a seamless shopping experience.
          </Text>
        </View>

        {/* Terms Card */}
        <View style={styles.card}>
          {/* Return Policy Header */}
          <View style={styles.policyHeader}>
            <FileText color="white" size={24} style={{ marginRight: 8 }} />
            <Text style={styles.policyTitle}>RETURN POLICY</Text>
          </View>

          <View style={styles.cardContent}>
            {/* Info Banner */}
            <View style={styles.infoBanner}>
              <Info color="#3B82F6" size={24} style={{ marginRight: 8 }} />
              <Text style={styles.infoText}>
                Subject to Terms and Conditions, Franko Trading Enterprise
                offers returns and/or exchange or refund for items purchased
                within{" "}
                <Text style={styles.highlight}>7 DAYS OF PURCHASE</Text>. We do
                not accept returns and or exchange for any reason whatsoever
                after the stated period has elapsed.
              </Text>
            </View>

            {/* Eligibility Section */}
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionTitle}>
                <CheckCircle color="green" size={24} style={{ marginRight: 8 }} />
                ELIGIBILITY FOR REFUND, RETURN, AND/OR EXCHANGE
              </Text>

              {/* Wrong Item Delivered */}
              <View style={[styles.sectionBox, { borderColor: "#FECACA", backgroundColor: "#FEF2F2" }]}>
                <View style={[styles.sectionHeader, { backgroundColor: "#EF4444" }]}>
                  <XCircle color="white" size={20} style={{ marginRight: 6 }} />
                  <Text style={styles.sectionHeaderText}>WRONG ITEM DELIVERED</Text>
                </View>
                <View style={styles.sectionContent}>
                  <Text style={styles.bullet}>• The seals on the box must not be broken/opened.</Text>
                  <Text style={styles.bullet}>• There should be no dents and liquid intrusion on the item.</Text>
                  <Text style={styles.bullet}>• Proof of Purchase/Receipt must be provided.</Text>
                </View>
              </View>

              {/* Manufacturing Defects */}
              <View style={[styles.sectionBox, { borderColor: "#BBF7D0", backgroundColor: "#F0FDF4" }]}>
                <View style={[styles.sectionHeader, { backgroundColor: "#22C55E" }]}>
                  <AlertTriangle color="white" size={20} style={{ marginRight: 6 }} />
                  <Text style={styles.sectionHeaderText}>MANUFACTURING DEFECTS</Text>
                </View>
                <View style={styles.sectionContent}>
                  <Text style={styles.bullet}>• Within 7 days, defective items will be replaced (depending on stock availability).</Text>
                  <Text style={styles.bullet}>• All items will go through inspection/diagnosis upon return.</Text>
                  <Text style={styles.bullet}>• After 7 days, defective items will be sent to the Brand's Service Centre for repairs under Manufacturer Warranty.</Text>
                </View>
              </View>

              {/* Incomplete Package */}
              <View style={[styles.sectionBox, { borderColor: "#FDE68A", backgroundColor: "#FFFBEB" }]}>
                <View style={[styles.sectionHeader, { backgroundColor: "#B45309" }]}>
                  <Package color="white" size={20} style={{ marginRight: 6 }} />
                  <Text style={styles.sectionHeaderText}>INCOMPLETE PACKAGE</Text>
                </View>
                <View style={styles.sectionContent}>
                  <Text style={styles.bullet}>
                    • Incomplete package or missing complementary items must be
                    reported within 7 days for immediate redress.
                  </Text>
                </View>
              </View>
            </View>

            {/* Refund Policy Section */}
            <View style={{ marginTop: 20 }}>
              <Text style={styles.sectionTitle}>
                <CreditCard color="#3B82F6" size={24} style={{ marginRight: 8 }} />
                REFUND/CHARGE BACK POLICY
              </Text>

              <View style={[styles.sectionBox, { borderColor: "#BFDBFE", backgroundColor: "#EFF6FF" }]}>
                <View style={[styles.sectionHeader, { backgroundColor: "#3B82F6" }]}>
                  <Package color="white" size={20} style={{ marginRight: 6 }} />
                  <Text style={styles.sectionHeaderText}>UNDELIVERED ORDER/PACKAGE</Text>
                </View>
                <View style={styles.sectionContent}>
                  <Text style={styles.bullet}>• Refund/charge back requests for undelivered orders will be vetted and refunded within 30 days.</Text>
                  <Text style={styles.bullet}>• Charge back requests must be initiated through customer's bank.</Text>
                  <Text style={styles.bullet}>• Refunds will be made by cheque for accounting purposes.</Text>
                </View>
              </View>
            </View>

            {/* Contact Section */}
            <View style={styles.contactBox}>
              <Text style={styles.contactTitle}>Questions about our policies?</Text>
              <Text style={styles.contactDesc}>
                Our customer service team is here to help you understand our
                terms and assist with your needs.
              </Text>
              <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
                <Shield color="white" size={18} style={{ marginRight: 6 }} />
                <Text style={styles.contactButtonText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last updated: {new Date().toLocaleDateString()}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 12 },
  wrapper: { flex: 1 },
  header: { alignItems: "center", marginBottom: 20 },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    marginBottom: 10,
  },
  logo: { height: 50, width: 50 },
  title: { fontSize: 22, fontWeight: "bold", color: "#111827", marginBottom: 6 },
  subtitle: { fontSize: 14, textAlign: "center", color: "#4B5563", maxWidth: "80%" },

  card: { backgroundColor: "white", borderRadius: 16, elevation: 4, overflow: "hidden" },
  policyHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    padding: 12,
  },
  policyTitle: { color: "white", fontWeight: "bold", fontSize: 16 },
  cardContent: { padding: 16 },

  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#DBEAFE",
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: { color: "#1F2937", fontSize: 14, flex: 1 },
  highlight: { fontWeight: "bold", color: "#DC2626", backgroundColor: "#FEE2E2", paddingHorizontal: 4 },

  sectionTitle: { flexDirection: "row", fontSize: 16, fontWeight: "bold", color: "#111827", marginBottom: 12 },
  sectionBox: { borderWidth: 1, borderRadius: 12, marginBottom: 16 },
  sectionHeader: { flexDirection: "row", alignItems: "center", padding: 10 },
  sectionHeaderText: { color: "white", fontWeight: "600", fontSize: 15 },
  sectionContent: { padding: 12 },
  bullet: { fontSize: 14, color: "#374151", marginBottom: 6 },

  contactBox: { marginTop: 20, backgroundColor: "#F3F4F6", borderRadius: 12, padding: 16, alignItems: "center" },
  contactTitle: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 6 },
  contactDesc: { fontSize: 14, color: "#4B5563", textAlign: "center", marginBottom: 12 },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  contactButtonText: { color: "white", fontWeight: "600", fontSize: 14 },

  footer: { alignItems: "center", marginTop: 16 },
  footerText: { fontSize: 12, color: "#6B7280" },
});

export default TermsScreen;
