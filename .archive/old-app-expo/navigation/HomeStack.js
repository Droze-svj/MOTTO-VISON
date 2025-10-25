import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import MediaFeedScreen from '../screens/MediaFeedScreen';
import MediaCollectionsScreen from '../screens/MediaCollectionsScreen';
import SearchScreen from '../screens/SearchScreen';

const Stack = createStackNavigator();

// Home Screen
const HomeScreen = ({ navigation }) => {
  const theme = useTheme();

  const menuItems = [
    {
      title: 'Media Feed',
      icon: 'images-outline',
      onPress: () => navigation.navigate('MediaFeed'),
      color: theme.colors.primary,
    },
    {
      title: 'Collections',
      icon: 'albums-outline',
      onPress: () => navigation.navigate('Collections'),
      color: theme.colors.text,
    },
    {
      title: 'Search',
      icon: 'search-outline',
      onPress: () => navigation.navigate('Search'),
      color: theme.colors.text,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Home
        </Text>
        <TouchableOpacity
          style={styles.securityButton}
          onPress={() => navigation.navigate('Security')}
        >
          <Ionicons name="shield-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.welcomeText, { color: theme.colors.text }]}>
          Welcome to MOTTO
        </Text>
        <Text style={[styles.descriptionText, { color: theme.colors.text + '80' }]}>
          Your media management platform
        </Text>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                { borderBottomColor: theme.colors.border },
                index === menuItems.length - 1 && styles.lastMenuItem,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon} size={24} color={item.color} />
                <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                  {item.title}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.text + '80'}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="MediaFeed" component={MediaFeedScreen} />
      <Stack.Screen name="Collections" component={MediaCollectionsScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  securityButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    marginBottom: 32,
  },
  menuSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
});

export default HomeStack; 