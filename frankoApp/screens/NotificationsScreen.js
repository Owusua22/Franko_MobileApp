import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Image, Animated } from 'react-native';

const NotificationsScreen = () => {
    const imageOpacity = useRef(new Animated.Value(0)).current; // For fade-in animation
    const textTranslateY = useRef(new Animated.Value(30)).current; // For slide-up animation

    useEffect(() => {
        // Start animations when the component mounts
        Animated.sequence([
            Animated.timing(imageOpacity, {
                toValue: 1,
                duration: 1000, // Duration for fade-in
                useNativeDriver: true,
            }),
            Animated.timing(textTranslateY, {
                toValue: 0,
                duration: 1000, // Duration for slide-up
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            {/* Displaying the notification image from the assets folder */}
            <Animated.Image 
                source={require('../assets/notification.jpg')} // Replace with your image file path in the assets folder
                style={[styles.notificationImage, { opacity: imageOpacity }]} // Apply fade-in effect
            />
            {/* Displaying the notification text */}
            <Animated.Text 
                style={[styles.notificationText, { transform: [{ translateY: textTranslateY }] }]} // Apply slide-up effect
            >
                New Notification!
            </Animated.Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    notificationImage: {
        width: 300,
        height: 300,
        borderRadius: 10, // Optional: rounds the corners of the image
        marginBottom: 20, // Adds spacing between the image and text
    },
    notificationText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
});

export default NotificationsScreen;
