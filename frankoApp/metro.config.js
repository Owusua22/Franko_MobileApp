// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add expo-asset plugin for hashing assets
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

module.exports = config;
