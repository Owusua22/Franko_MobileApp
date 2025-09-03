import React, { useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Share,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  SafeAreaView,
} from "react-native";
import { FontAwesome, Ionicons, MaterialCommunityIcons } from "react-native-vector-icons";
import { useNavigation } from "@react-navigation/native";
import Feather from '@expo/vector-icons/Feather';
const { width, height } = Dimensions.get("window");

const InviteScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const androidLink = "https://play.google.com/store/apps/details?id=com.poldark.mrfranky2";
  const iosLink = "https://apps.apple.com/us/app/franko-trading/id6741319907";

  const message = `🛒 Discover Franko Trading - Your Ultimate Shopping Destination! 

🔥 Premium phones, laptops, smart TVs, appliances & more at incredible prices!
💨 Lightning-fast delivery & secure payment
🎁 Exclusive deals just for you!

📱 Download now:
Android: ${androidLink}
iOS: ${iosLink}

Join thousands of happy customers! 🌟`;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: "whatsapp",
      color: "#25D366",
      iconLibrary: FontAwesome,
    },
    {
      name: "SMS",
      icon: "comments", // Changed from "message" to "comments"
      color: "#007AFF",
      iconLibrary: FontAwesome,
    },
    {
      name: "Facebook",
      icon: "facebook",
      color: "#1877F2",
      iconLibrary: FontAwesome,
    },
    {
      name: "More",
      icon: "share-alt",
      color: "#8E44AD",
      iconLibrary: FontAwesome,
    },
  ];

  const shareApp = async (platform = "general") => {
    try {
      const result = await Share.share({ 
        message,
        title: "Franko Trading App"
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const AnimatedTouchable = ({ children, onPress, style, delay = 0 }) => {
    const animValue = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      Animated.timing(animValue, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={[
          style,
          {
            opacity: animValue,
            transform: [
              {
                translateY: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const GradientView = ({ colors, style, children }) => {
    const gradientColors = colors || ['#5DD39E', '#3CB371'];
    return (
      <View style={[style, { backgroundColor: gradientColors[0] }]}>
        {children}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>

      
      <GradientView colors={['#5DD39E', '#51C878', '#3CB371']} style={styles.container}>
        {/* Decorative circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />

        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <View style={styles.backButtonInner}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </View>
          </TouchableOpacity>
          
          <Animated.Text
            style={[
              styles.headerTitle,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            Invite Friends
          </Animated.Text>
        </View>

        {/* Main content card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* Icon and title section */}
          <View style={styles.iconContainer}>
            <GradientView colors={['#5DD39E', '#3CB371']} style={styles.iconGradient}>
              <Ionicons name="people" size={40} color="white" />
            </GradientView>
          </View>

          <Text style={styles.title}>Share the Love!</Text>
          <Text style={styles.subtitle}>
         Share the app with your friends discover amazing deals on Franko Trading. 
            
          </Text>

          {/* Benefits section */}
          <View style={styles.benefitsContainer}>
            {[
              { icon: "pricetag", text: "Best Prices" },
              { icon: "car", text: "Fast Delivery" },
              { icon: "shield-checkmark", text: "Secure Payment" },
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Ionicons 
                  name={benefit.icon} 
                  size={20} 
                  color="#5DD39E" 
                />
                <Text style={styles.benefitText}>{benefit.text}</Text>
              </View>
            ))}
          </View>

          {/* Share buttons */}
          <View style={styles.buttonsContainer}>
            {shareOptions.map((option, index) => {
              const IconComponent = option.iconLibrary;
              return (
                <AnimatedTouchable
                  key={option.name}
                  delay={index * 100}
                  style={styles.shareButton}
                  onPress={() => shareApp(option.name.toLowerCase())}
                >
                  <View style={[styles.buttonGradient, { backgroundColor: option.color }]}>
                    <IconComponent 
                      name={option.icon} 
                      size={24} 
                      color="white" 
                    />
                    <Text style={styles.buttonText}>
                      {option.name === "More" ? "More Options" : `Share via ${option.name}`}
                    </Text>
                  </View>
                </AnimatedTouchable>
              );
            })}
          </View>

          
        </Animated.View>
      </GradientView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#5DD39E",
  },
  container: {
    flex: 1,
    position: "relative",
  },
  circle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -50,
    right: -50,
  },
  circle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    bottom: -30,
    left: -30,
  },
  circle3: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    top: height * 0.3,
    right: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: Platform.OS === "ios" ? 10 : 10,
  
    zIndex: 10,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 10,
    paddingHorizontal: 2,
    paddingBottom: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#5DD39E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2C3E50",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 10,
  },
  benefitsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
    paddingVertical: 20,
    backgroundColor: "#F8F9FA",
    borderRadius: 15,
  },
  benefitItem: {
    alignItems: "center",
    flex: 1,
  },
  benefitText: {
    fontSize: 12,
    color: "#5DD39E",
    fontWeight: "600",
    marginTop: 2,
    textAlign: "center",
  },
  buttonsContainer: {
    gap: 12,
  },
  shareButton: {
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  footerText: {
    fontSize: 14,
    color: "#95A5A6",
    textAlign: "center",
    marginTop: 5,
    fontStyle: "italic",
  },
});

export default InviteScreen;