import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Card, Divider, Tab, TabView } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: screenWidth } = Dimensions.get('window'); // Get screen width

const AboutScreen = () => {
  const [tabIndex, setTabIndex] = React.useState(0);

  useEffect(() => {
    // Focus reset or any initialization logic here
  }, []);

  // Calculate card width dynamically based on screen size
  const cardWidth = screenWidth > 600 ? '48%' : '100%'; // 48% for larger screens, 100% for smaller screens

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>About Us</Text>
          <Text style={styles.description}>
            Franko Trading Limited is the leading retail and wholesale company of mobile phones, computers, laptops,
            televisions, and accessories. Established in 2004, we are committed to bringing the latest technological
            gadgets to Ghana at affordable prices.
          </Text>
        </View>

        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/franko_office.png')}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Tabs Section */}
        <Tab value={tabIndex} onChange={setTabIndex} indicatorStyle={styles.tabIndicator}>
          <Tab.Item title="Vision" titleStyle={styles.tabTitle} />
          <Tab.Item title="Mission" titleStyle={styles.tabTitle} />
          <Tab.Item title="Values" titleStyle={styles.tabTitle} />
        </Tab>
        <TabView value={tabIndex} onChange={setTabIndex} animationType="timing">
          <TabView.Item style={styles.tabContent}>
            <Text style={styles.tabText}>
              To devote our human and technological resources to create superior household electronics and mobile phone
              markets through research and innovation in Ghana and the West African Sub-region.
            </Text>
          </TabView.Item>
          <TabView.Item style={styles.tabContent}>
            <Text style={styles.tabText}>
              To be the leader in inspiring Africa and the world with innovative products and designs, revolutionizing the
              electronics and mobile phone market.
            </Text>
          </TabView.Item>
          <TabView.Item style={styles.tabContent}>
            <Text style={styles.tabText}>
              • Integrity
              {'\n'}
              • Accountability
              {'\n'}
              • Customer Satisfaction
              {'\n'}
              • Teamwork
            </Text>
          </TabView.Item>
        </TabView>

        <Divider style={styles.divider} />

        {/* Why Choose Us Section */}
        <Text style={styles.sectionTitle}>Why Choose Us</Text>
        <View style={styles.cardContainer}>
          {[
            {
              icon: 'check-circle',
              title: 'Quality Products',
              description: 'We offer only the best electronics from top brands.',
            },
            {
              icon: 'cash-multiple',
              title: 'Competitive Prices',
              description: 'Get the best deals and discounts on top products.',
            },
            {
              icon: 'rocket',
              title: 'Fast Shipping',
              description: 'Quick and reliable delivery to your doorstep.',
            },
            {
              icon: 'headset',
              title: 'Excellent Support',
              description: 'Timely customer support to assist with your needs.',
            },
          ].map((item, index) => (
            <Card key={index} containerStyle={[styles.card, { width: cardWidth }]}>
              <Icon name={item.icon} size={40} color="#e63946" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 15,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  headerContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e63946',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  imageContainer: {
    marginVertical: 20,
    alignItems: 'center',
    padding:20
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#e63946',
  },
  tabIndicator: {
    backgroundColor: '#e63946',
  },
  tabTitle: {
    color: 'green',
  },
  tabContent: {
    padding: 16,
  },
  tabText: {
    fontSize: 16,
    color: '#4a4a4a',
    marginBottom: 8,
    lineHeight: 24,
  },
  divider: {
    marginVertical: 24,
    backgroundColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e63946',
    textAlign: 'center',
    marginBottom: 16,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#ffffff',
    elevation: 5,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginHorizontal: 10,
    maxWidth: 350
  },
  cardIcon: {
    textAlign: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#777',
    marginTop: 6,
  },
});

export default AboutScreen;
