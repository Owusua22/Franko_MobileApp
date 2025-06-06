import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import Swiper from "react-native-swiper";
import { useDispatch, useSelector } from "react-redux";
import { getBannerPageAdvertisment } from "../redux/slice/advertismentSlice";

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
        <Image source={require("../assets/na.jpeg")} style={styles.image} />
      ) : advertisments.length === 0 ? (
        <Image source={require("../assets/na.jpeg")} style={styles.image} />
      ) : (
      <Swiper
  autoplay={advertisments.length > 1}
  autoplayTimeout={5}
  loop={advertisments.length > 1}
  index={0}
  showsPagination={true}
  removeClippedSubviews={false} // Prevents flickering
  dotStyle={styles.dot}
  activeDotStyle={styles.activeDot}
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
    height: 150,
  },
  slide: {
    width: "100%", 
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%", // Match BannerComponent width
    height: 150, // Match BannerComponent height
    resizeMode: "cover",
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
    marginTop: 85
  },
  activeDot: {
    backgroundColor: "#007AFF",
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 85
  },
});

export default CarouselComponent;