import React, { useEffect, useState } from "react";
import { View, Dimensions, StyleSheet, Image, Text } from "react-native";
import Swiper from "react-native-swiper";
import { useDispatch, useSelector } from "react-redux";
import { getBannerPageAdvertisment } from "../redux/slice/advertismentSlice";

const { width } = Dimensions.get("window"); // Get full screen width
const backendBaseURL = "https://smfteapi.salesmate.app";

const CarouselComponent = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const { advertisments = [] } = useSelector((state) => state.advertisment);

  useEffect(() => {
    dispatch(getBannerPageAdvertisment()).finally(() => setLoading(false));
  }, [dispatch]);

  return (
    <View style={styles.container}>
      {loading ? (
        <Image source={require("../assets/bn.jpeg")} style={styles.image} />
      ) : advertisments.length === 0 ? (
        <Text style={styles.noAdsText}>No Advertisements Available</Text>
      ) : (
        <Swiper
          autoplay={advertisments.length > 1} 
          autoplayTimeout={5}
          loop={advertisments.length > 1}
          index={0}
          showsPagination={true}
          dotStyle={styles.dot}
          activeDotStyle={styles.activeDot}
          containerStyle={styles.swiperContainer}
        >
          {advertisments.map((ad, index) => (
            <View key={index} style={styles.slide}>
              <Image
                source={{
                  uri: `${backendBaseURL}/Media/Ads/${ad.fileName.split("\\").pop()}`,
                }}
                style={styles.image}
              />
            </View>
          ))}
        </Swiper>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  swiperContainer: {
    width: "100%", // Ensure Swiper takes full width
    height: 200, // Adjust height if needed
  },
  slide: {
    width: "100%", // Ensure slide fills the container
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: width, // Full screen width
    height: 200, 
    resizeMode: "cover", // Ensure image covers the full width
  },
  noAdsText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginBottom: 10,
  },
  dot: {
    backgroundColor: "#ccc",
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 3,
  },
  activeDot: {
    backgroundColor: "#007AFF",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default CarouselComponent;
