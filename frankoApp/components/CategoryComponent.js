import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const categories = [
  { id: "51d1fff2", image: require("../assets/phones.jpeg"), label: "Phones", path: "Phones" },
  { id: "12f11417", image: require("../assets/lap.jpeg"), label: "Computers", path: "Computers" },
  { id: "db54033b", image: require("../assets/ac.jpeg"), label: "Air-Conditioners", path: "AirCondition" },
  { id: "38f7245d", image: require("../assets/speaker.jpg"), label: "Speakers", path: "Speakers" },
  { id: "2cfdb823", image: require("../assets/charg.jpeg"), label: "Accessories", path: "Accessories" },
  { id: "b51e02c2", image: require("../assets/tv.jpeg"), label: "Television", path: "Television" },
  { id: "4f5076f8", image: require("../assets/fridge.jpg"), label: "Fridge", path: "Fridge" },
  { id: "9170b363", image: require("../assets/blender.jpg"), label: "Appliances", path: "Appliances" },
  { id: "bbfdf52f", image: require("../assets/fan.jpeg"), label: "Fan", path: "Fan" },
  { id: "4bdb194e", image: require("../assets/combo.jpeg"), label: "Combo", path: "Combo" },
];

const CategoryComponent = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Modern Gradient Header */}
      <LinearGradient colors={["#16A34A", "#117A3D"]} style={styles.header}>
        <Text style={styles.title}>Shop by Category</Text>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryBox}
            onPress={() => navigation.navigate(category.path)}
            activeOpacity={0.8}
          >
            <Image source={category.image} style={styles.categoryImage} />
            <View style={styles.labelContainer}>
              <Text style={styles.label}>{category.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 3,
    paddingHorizontal: 15,
    backgroundColor: "#f0f0f0",
  
  },
  header: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  
    elevation: 5,
  },
  title: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    padding: 5
  },
  scrollView: {
    flexDirection: "row",

    paddingVertical: 10,
  },
  categoryBox: {
    width: width * 0.30,
    height: width * 0.35,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  categoryImage: {
    width: "80%",
    height: "80%",
    borderRadius: 10,
    resizeMode: "cover",
  },
  labelContainer: {
    position: "absolute",
    bottom: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  label: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default CategoryComponent;
