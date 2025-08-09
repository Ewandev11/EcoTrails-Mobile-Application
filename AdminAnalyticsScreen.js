import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function AdminAnalyticsScreen() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('https://ecotrails-dev-partners-func.azurewebsites.net/api/api/admin/analytics?')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch analytics');
        return res.json();
      })
      .then(data => {
        // Sometimes APIs wrap data in array, let's guard for that:
        if (Array.isArray(data)) setAnalytics(data[0] || {});
        else setAnalytics(data || {});
        setLoading(false);
      })
      .catch(() => {
        setError('Unable to load analytics');
        setLoading(false);
      });
  }, []);

  const renderDateRange = () => {
    if (analytics && analytics.DateRange) {
      const start = new Date(analytics.DateRange.Start).toLocaleDateString();
      const end = new Date(analytics.DateRange.End).toLocaleDateString();
      return (
        <Text style={styles.periodText}>
          Period: {start} - {end}
        </Text>
      );
    }
    return null;
  };

  return (
    <LinearGradient colors={['#A3D8F4', '#FFE7C7']} style={styles.gradientBackground}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <View style={styles.header}>
          <Text style={styles.headerText}>Platform Analytics</Text>
        </View>
        <View style={styles.analyticsContainer}>
          {renderDateRange()}
          {loading ? (
            <ActivityIndicator size="large" color="#00796b" style={{ marginTop: 24 }} />
          ) : error ? (
            <Text style={{ color: 'red', fontWeight: '600', marginVertical: 20 }}>{error}</Text>
          ) : (
            <View style={styles.cardsRow}>
              {/* Platform Revenue */}
              <View style={styles.card}>
                <View style={styles.iconCircle}>
                  <FontAwesome5 name="chart-line" size={28} color="#004d40" />
                </View>
                <Text style={styles.cardValue}>
                  {`LKR ${analytics?.TotalPlatformRevenue != null
                    ? analytics.TotalPlatformRevenue.toLocaleString()
                    : '0'}`}
                </Text>
                <Text style={styles.cardTitle}>Platform Revenue</Text>
              </View>
              {/* Commission Earned */}
              <View style={styles.card}>
                <View style={styles.iconCircle}>
                  <MaterialIcons name="attach-money" size={28} color="#004d40" />
                </View>
                <Text style={styles.cardValue}>
                  {`LKR ${analytics?.TotalCommissionEarned != null
                    ? analytics.TotalCommissionEarned.toLocaleString()
                    : '0'}`}
                </Text>
                <Text style={styles.cardTitle}>Commission Earned</Text>
              </View>
              {/* Partner Payouts */}
              <View style={styles.card}>
                <View style={styles.iconCircle}>
                  <FontAwesome5 name="hand-holding-usd" size={26} color="#004d40" />
                </View>
                <Text style={styles.cardValue}>
                  {`LKR ${analytics?.TotalPartnerPayouts != null
                    ? analytics.TotalPartnerPayouts.toLocaleString()
                    : '0'}`}
                </Text>
                <Text style={styles.cardTitle}>Partner Payouts</Text>
              </View>
              {/* Total Bookings */}
              <View style={styles.card}>
                <View style={styles.iconCircle}>
                  <MaterialIcons name="event" size={28} color="#004d40" />
                </View>
                <Text style={styles.cardValue}>
                  {analytics?.TotalBookings != null
                    ? analytics.TotalBookings.toLocaleString()
                    : '0'}
                </Text>
                <Text style={styles.cardTitle}>Total Bookings</Text>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 40 : 60,
    paddingBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#a3f7bf',
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: width * 0.065,
    fontWeight: 'bold',
    color: '#004d40',
    textAlign: 'center',
  },
  analyticsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  periodText: {
    fontSize: 15,
    color: '#4b5563',
    marginBottom: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 700,
    gap: 10,
    rowGap: 18,
  },
  card: {
    width: width < 420 ? (width / 2) - 28 : 170,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 22,
    paddingHorizontal: 10,
    alignItems: 'center',
    margin: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  iconCircle: {
    backgroundColor: '#A3D8F4',
    borderRadius: 999,
    padding: 11,
    marginBottom: 7,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00796b',
    shadowOpacity: 0.09,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#206925',
    marginTop: 6,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#004d40',
    marginBottom: 2,
    marginTop: 3,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
});
