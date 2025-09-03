import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Footer() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const isActive = (tabName) => route.name === tabName;

  const colors = {
    primary: '#22C55E',
    inactive: '#9CA3AF',
    lightBg: '#F0FDF4',
    border: '#E5E7EB',
    white: '#FFFFFF',
  };

  const getIconColor = (tabName) => (isActive(tabName) ? colors.primary : colors.inactive);
  const getTextColor = (tabName) => (isActive(tabName) ? colors.primary : colors.inactive);

  const getBottomPadding = () => Math.max(insets.bottom, 1);

  const tabs = [
    { name: 'Home', label: 'Home', icon: 'home' },
    { name: 'Category', label: 'Categories', icon: 'grid' },
    { name: 'Account', label: 'Profile', icon: 'user' },
    { name: 'Shops', label: 'Shops', icon: 'shopping-bag' },
  ];

  return (
    <View style={[styles.footerContainer, { paddingBottom: getBottomPadding() }]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={styles.footerItem}
          onPress={() => navigation.navigate(tab.name)}
          activeOpacity={0.7}
        >
          <Feather
            name={tab.icon}
            size={Platform.OS === 'android' ? 18 : 20}
            color={getIconColor(tab.name)}
          />
          <Text style={[styles.footerText, { color: getTextColor(tab.name) }]}>{tab.label}</Text>
          {isActive(tab.name) && <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  footerItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    minWidth: 55,
  },
  footerText: {
    fontSize: Platform.OS === 'android' ? 9 : 10,
    fontWeight: '500',
    marginTop: 1,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 18,
    height: 2,
    borderRadius: 1,
  },
});
