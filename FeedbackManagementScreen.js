import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CARD_ELEVATION, CARD_RADIUS, COLORS, scaleFont, SPACING } from '../constants/theme';

// API endpoint for admin to get all feedback
const FEEDBACK_ADMIN_API = 'https://ecotrails-dev-users-func20250717225342.azurewebsites.net/api/api/admin/feedback?';

export default function FeedbackManagementScreen({ navigation }) {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeedback = async () => {
    if (!refreshing) setLoading(true);
    try {
      const response = await fetch(FEEDBACK_ADMIN_API);
      const text = await response.text();
      let data = [];
      try {
        data = JSON.parse(text);
      } catch {
        data = [];
      }
      setFeedbackList(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load feedback data.');
      console.error('Admin Feedback error:', error);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeedback();
  };

  const renderFeedbackItem = ({ item }) => {
    const createdDate = item.createdAt ? new Date(item.createdAt) : null;
    const formattedDate = createdDate ? createdDate.toLocaleString() : '';
    return (
      <View style={styles.feedbackCard}>
        <Text style={styles.userId}>User ID: {item.userId ?? (item.UserId ?? 'N/A')}</Text>
        <Text style={styles.message}>{item.message ?? (item.Message ?? '-')}</Text>
        <Text style={styles.timestamp}>{formattedDate ? `Date: ${formattedDate}` : ''}</Text>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#A3D8F4', '#FFE7C7', '#A3F7BF']}
      style={styles.gradientBackground}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>User Feedback Management</Text>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={feedbackList}
            keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
            renderItem={renderFeedbackItem}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
            }
            showsVerticalScrollIndicator
          />
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>⬅ Back</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.select({
      android: (StatusBar.currentHeight ?? 24) + SPACING.md,
      ios: SPACING.lg + 20,
      default: SPACING.md,
    }),
    // no background color here — gradient covers it
  },
  header: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#a3f7bf',
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  headerText: {
    fontSize: scaleFont(22),
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  feedbackCard: {
    backgroundColor: COLORS.white,
    borderRadius: CARD_RADIUS,
    elevation: CARD_ELEVATION,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  userId: {
    fontWeight: 'bold',
    color: COLORS.primaryAccent,
    marginBottom: 4,
    fontSize: scaleFont(13),
  },
  message: {
    fontSize: scaleFont(15),
    color: COLORS.text,
    marginBottom: 6,
    lineHeight: scaleFont(20),
  },
  timestamp: {
    fontSize: scaleFont(11),
    color: '#888',
    textAlign: 'right',
  },
  backButton: {
    alignSelf: 'center',
    margin: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: scaleFont(15),
  },
});
