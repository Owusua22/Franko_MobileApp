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
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const categories = [
  { id: "51d1fff2", image: require("../assets/smart.jpg"), label: "Phones", path: "Phones" },
  { id: "12f11417", image: require("../assets/computer1.jpg"), label: "Computers", path: "Computers" },
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
      <Text style={styles.title}>Shop by Category</Text>
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
          >
            <Image source={category.image} style={styles.categoryImage} />
            <Text style={styles.label}>{category.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    paddingHorizontal: 15,
    backgroundColor: "#f8f8f8",
    paddingBottom: 5,
  },
  title: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#16A34A",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 15
  },
  
  scrollView: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryBox: {
    width: width * 0.26,
    height: width * 0.26,
    backgroundColor: "white",
    borderRadius: 10,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    transform: [{ scale: 1 }],
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    overflow: "hidden",
    marginBottom: 5,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    resizeMode: "cover",
  },
  label: {
    color: "#444",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
    textAlign: "center",
  },
});

export default CategoryComponent;
