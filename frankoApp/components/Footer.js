import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons, Ionicons, AntDesign, Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Footer() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  // Function to determine if a tab is active
  const isActive = (tabName) => route.name === tabName;

  // Green color palette
  const colors = {
    primary: '#22C55E',      // Green-500
    primaryLight: '#16A34A', // Green-600
    primaryDark: '#15803D',  // Green-700
    background: '#F0FDF4',   // Green-50
    inactive: '#9CA3AF',     // Gray-400
    white: '#FFFFFF',
    border: '#E5E7EB',       // Gray-200
    shadow: '#000000',
  };

  // Function to get icon color based on active state
  const getIconColor = (tabName) => isActive(tabName) ? colors.primary : colors.inactive;
  const getTextColor = (tabName) => isActive(tabName) ? colors.primary : colors.inactive;

  return (
    <View style={[styles.footerContainer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {/* Animated background indicator */}
      <View style={[styles.backgroundGlow, { backgroundColor: colors.primary }]} />
      
      {/* Home */}
      <TouchableOpacity
        style={[styles.footerItem, isActive('Home') && styles.activeTab]}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, isActive('Home') && styles.activeIconContainer]}>
          <Feather name="home" size={22} color={getIconColor('Home')} />
        </View>
        <Text style={[styles.footerText, { color: getTextColor('Home') }]}>Home</Text>
        {isActive('Home') && <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />}
      </TouchableOpacity>

      {/* Categories */}
      <TouchableOpacity
        style={[styles.footerItem, isActive('Category') && styles.activeTab]}
        onPress={() => navigation.navigate('Category')}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, isActive('Category') && styles.activeIconContainer]}>
          <Feather name="grid" size={22} color={getIconColor('Category')} />
        </View>
        <Text style={[styles.footerText, { color: getTextColor('Category') }]}>Categories</Text>
        {isActive('Category') && <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />}
      </TouchableOpacity>

      {/* Account */}
      <TouchableOpacity
        style={[styles.footerItem, isActive('Account') && styles.activeTab]}
        onPress={() => navigation.navigate('Account')}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, isActive('Account') && styles.activeIconContainer]}>
          <Feather name="user" size={22} color={getIconColor('Account')} />
        </View>
        <Text style={[styles.footerText, { color: getTextColor('Account') }]}>Profile</Text>
        {isActive('Account') && <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />}
      </TouchableOpacity>

      {/* Shops */}
      <TouchableOpacity
        style={[styles.footerItem, isActive('Shops') && styles.activeTab]}
        onPress={() => navigation.navigate('Shops')}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, isActive('Shops') && styles.activeIconContainer]}>
          <Feather name="shopping-bag" size={22} color={getIconColor('Shops')} />
        </View>
        <Text style={[styles.footerText, { color: getTextColor('Shops') }]}>Shops</Text>
        {isActive('Shops') && <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 3,

    paddingHorizontal: 4,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  backgroundGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.4,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  footerItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 1,
    paddingHorizontal: 12,
    borderRadius: 16,
    minWidth: 65,
    position: 'relative',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  activeIconContainer: {
    backgroundColor: '#F0FDF4', // Green-50
    transform: [{ scale: 1.08 }],
    shadowColor: '#22C55E',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  activeTab: {
    backgroundColor: '#F9FDF9', // Very light green background
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 24,
    height: 3,
    borderRadius: 2,
  },
});