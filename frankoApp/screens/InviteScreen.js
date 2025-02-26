import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Share } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const InviteScreen = () => {
  const navigation = useNavigation();

  const androidLink = "https://play.google.com/store/apps/details?id=com.poldark.mrfranky2";
  const iosLink = "https://apps.apple.com/us/app/franko-trading/id6741319907";

  const message = `📢 Shop online with Franko Trading! 🚀  

🔥 Get the latest phones, laptops, smart TVs, fridges, and more – all at unbeatable prices! 
  
🛒 Shop now and enjoy best deals & fast delivery! 
  
📲 Download the app today:  
✅ Android: Tap here → ${androidLink}  
✅ iOS: Tap here → ${iosLink}  
  
Don't miss out on the best deals Now! 🎉`;

  const shareApp = async () => {
    try {
      await Share.share({ message });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>Invite Your Friends</Text>
        <Text style={styles.subtitle}>Share this app with your friends and family!</Text>

        {/* Share Buttons */}
        <TouchableOpacity style={[styles.button, { backgroundColor: "#25D366" }]} onPress={shareApp}>
          <FontAwesome name="whatsapp" size={24} color="white" />
          <Text style={styles.buttonText}>Share via WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: "#1DA1F2" }]} onPress={shareApp}>
          <FontAwesome name="comment" size={24} color="white" />
          <Text style={styles.buttonText}>Share via SMS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: "#1877F2" }]} onPress={shareApp}>
          <FontAwesome name="facebook" size={24} color="white" />
          <Text style={styles.buttonText}>Share via Facebook</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#5DD39E", // Gradient-like background
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    padding: 10,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    marginVertical: 8,
    justifyContent: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default InviteScreen;
