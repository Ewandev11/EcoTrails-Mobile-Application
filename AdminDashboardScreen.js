import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function AdminDashboardScreen({ navigation }) {
  const [stats] = useState({
    totalUsers: 128,
    totalBookings: 54,
    totalItineraries: 9,
    totalRequests: 21,
    totalPartners: 6,
    totalLocations: 12,
    totalFeedback: 23,
    // Analytics doesn't need a value, but you could add a stat here if needed
  });

  const handleCardPress = (section) => {
    switch (section) {
      case 'Users':
        navigation.navigate('UsersAdmin');
        break;
      case 'Bookings':
        navigation.navigate('BookingsAdmin');
        break;
      case 'Partners':
        navigation.navigate('PartnersAdmin');
        break;
      case 'Requests':
        navigation.navigate('ItineraryRequestsAdmin');
        break;
      case 'Itineraries':
        navigation.navigate('ItinerariesAdmin');
        break;
      case 'Locations':
        navigation.navigate('LocationAdmin');
        break;
      case 'Feedback':
        navigation.navigate('FeedbackManagement');
        break;
      case 'Analytics':
        navigation.navigate('AdminAnalytics'); // <-- route should match your navigator
        break;
      default:
        Alert.alert('Coming Soon', `Section "${section}" not configured yet.`);
        break;
    }
  };

  const handleLogout = () => {
    navigation.replace('Login');
  };

  return (
    <LinearGradient
      colors={['#A3D8F4', '#FFE7C7', '#A3F7BF']}
      style={styles.gradientBackground}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Admin Dashboard</Text>
        <View style={styles.menuContainer}>
          <DashboardMenuCard
            label="Analytics"
            value=""
            icon="📊"
            onPress={() => handleCardPress('Analytics')}
            bgColor="#cfd8dc"
            textColor="#263238"
          />
          <DashboardMenuCard
            label="Users"
            value={stats.totalUsers}
            icon="👤"
            onPress={() => handleCardPress('Users')}
            bgColor="#b8e986"
            textColor="#33691e"
          />
          <DashboardMenuCard
            label="Bookings"
            value={stats.totalBookings}
            icon="✈️"
            onPress={() => handleCardPress('Bookings')}
            bgColor="#81d4fa"
            textColor="#01579b"
          />
          <DashboardMenuCard
            label="Partners"
            value={stats.totalPartners}
            icon="🤝"
            onPress={() => handleCardPress('Partners')}
            bgColor="#ffcc80"
            textColor="#e65100"
          />
          <DashboardMenuCard
            label="Itinerary Requests"
            value={stats.totalRequests}
            icon="📩"
            onPress={() => handleCardPress('Requests')}
            bgColor="#ce93d8"
            textColor="#4a148c"
          />
          <DashboardMenuCard
            label="Itineraries"
            value={stats.totalItineraries}
            icon="🗺️"
            onPress={() => handleCardPress('Itineraries')}
            bgColor="#f48fb1"
            textColor="#880e4f"
          />
          <DashboardMenuCard
            label="Locations"
            value={stats.totalLocations}
            icon="📍"
            onPress={() => handleCardPress('Locations')}
            bgColor="#ffe082"
            textColor="#6d4c41"
          />
          <DashboardMenuCard
            label="Feedback"
            value={stats.totalFeedback}
            icon="💬"
            onPress={() => handleCardPress('Feedback')}
            bgColor="#aed581"
            textColor="#2e7d32"
          />
        </View>

        <Text style={styles.welcomeMsg}>
          Welcome to the EcoTrails Admin Panel.
          {'\n'}
          Select a section above to manage.
        </Text>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Log out"
          activeOpacity={0.85}
        >
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

function DashboardMenuCard({ label, value, icon, onPress, bgColor, textColor }) {
  return (
    <TouchableOpacity
      style={[styles.menuCard, { backgroundColor: bgColor }]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${label} section${value ? ', ' + value + ' items' : ''}`}
    >
      <Text style={[styles.menuIcon, { color: textColor }]}>{icon}</Text>
      <Text style={[styles.menuLabel, { color: textColor }]}>{label}</Text>
      {value !== '' && (
        <Text style={[styles.menuValue, { color: textColor }]}>{value}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.06,
    alignItems: 'center',
    flexGrow: 1,
  },
  header: {
    fontSize: width * 0.065,
    fontWeight: 'bold',
    color: '#004d40',
    marginBottom: 18,
    marginTop: 40,
  },
  menuContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  menuCard: {
    width: width * 0.42,
    minHeight: height * 0.13,
    borderRadius: 14,
    margin: 7,
    paddingVertical: height * 0.015,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  menuIcon: {
    fontSize: width * 0.085,
    marginBottom: 6,
  },
  menuLabel: {
    fontSize: width * 0.038,
    fontWeight: '700',
    marginBottom: 5,
    textAlign: 'center',
  },
  menuValue: {
    fontSize: width * 0.055,
    fontWeight: '900',
  },
  welcomeMsg: {
    fontSize: width * 0.045,
    marginTop: 30,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 22,
  },
  logoutButton: {
    marginTop: 28,
    backgroundColor: '#00796b',
    paddingVertical: height * 0.013,
    paddingHorizontal: width * 0.13,
    borderRadius: 28,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    alignSelf: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: width * 0.045,
    textAlign: 'center',
  },
});
