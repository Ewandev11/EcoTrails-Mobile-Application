import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity, // Using TouchableOpacity for custom buttons
  View,
  RefreshControl, // For pull-to-refresh
  StatusBar, // Import StatusBar
} from 'react-native';


const { width } = Dimensions.get('window');
const API_BASE = 'https://ecotrails-dev-bookings-func.azurewebsites.net/api/api/admin/bookings';


// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Return original if parsing fails
  }
};


// Component for individual booking card
const BookingCard = React.memo(({ item, onView, onEdit }) => {
  const getStatusStyle = useCallback((status) => {
    switch ((status || '').toLowerCase()) {
      case 'confirmed': return styles.statusConfirmed;
      case 'pending': return styles.statusPending;
      case 'cancelled': return styles.statusCancelled;
      default: return styles.statusDefault;
    }
  }, []);


  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Booking #{item.id || 'N/A'}</Text>
        <Text style={[styles.statusText, getStatusStyle(item.status)]}>
          {item.status || 'Unknown'}
        </Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>User:</Text>
        <Text style={styles.value}>{item.userId || '-'}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Flight:</Text>
        <Text style={styles.value}>{item.flightName || '-'}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>{formatDate(item.date)}</Text>
      </View>


      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.cardButton} onPress={() => onView(item)}>
          <Text style={styles.cardButtonText}>View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardButton} onPress={() => onEdit(item)}>
          <Text style={styles.cardButtonText}>Edit Status</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});


export default function BookingsAdminScreen() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('All');
  const [view, setView] = useState(null);
  const [editBooking, setEditBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh
  const [error, setError] = useState(null); // For general errors


  // Fetch all bookings from API
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}?`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || `Failed to fetch bookings: ${res.status}`);
      }
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
      // Apply filter to newly fetched data
      const initialFiltered = Array.isArray(data)
        ? data.filter((b) =>
            currentFilter === 'All'
              ? true
              : (b.status || '').toLowerCase() === currentFilter.toLowerCase()
          )
        : [];
      setFilteredBookings(initialFiltered);
    } catch (err) {
      console.error('Fetch bookings error:', err);
      setError(err.message || 'Failed to fetch bookings. Please try again.');
      setBookings([]);
      setFilteredBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentFilter]); // currentFilter is a dependency because the initial filter applies to fetched data


  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);


  // Apply filter whenever bookings or currentFilter changes
  useEffect(() => {
    if (bookings.length > 0) {
      const newFilteredBookings =
        currentFilter === 'All'
          ? bookings
          : bookings.filter(
              (b) => (b.status || '').toLowerCase() === currentFilter.toLowerCase()
            );
      setFilteredBookings(newFilteredBookings);
    } else {
        setFilteredBookings([]);
    }
  }, [bookings, currentFilter]);


  // Filter bookings by status (called by filter buttons)
  const handleFilterChange = useCallback((status) => {
    setCurrentFilter(status);
  }, []);


  // Open booking details modal (fetch single booking for details)
  const handleView = useCallback(async (item) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${item.id}?`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || `Failed to load details: ${res.status}`);
      }
      const detail = await res.json();
      setView(detail);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  }, []);


  // Edit: Only status is editable as per admin API
  const handleEdit = useCallback((item) => {
    setEditBooking({ ...item, newStatus: item.status });
  }, []);


  // Save status update to backend
  const saveEditBooking = useCallback(async () => {
    if (!editBooking || !editBooking.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${editBooking.id}/status?`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: editBooking.newStatus }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || `Status update failed: ${res.status}`);
      }
      Alert.alert('Success', 'Booking status updated successfully!');
      setEditBooking(null);
      fetchBookings(); // Re-fetch all bookings to update list
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not update booking status.');
    } finally {
      setLoading(false);
    }
  }, [editBooking, fetchBookings]);


  // Cancel editing
  const cancelEdit = useCallback(() => setEditBooking(null), []);


  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, [fetchBookings]);


  // Memoize the filter button rendering for performance
  const renderFilterButtons = useMemo(() => {
    const statuses = ['All', 'Confirmed', 'Pending', 'Cancelled'];
    return (
      <View style={styles.filterContainer}>
        {statuses.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              currentFilter === status && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterChange(status)}
          >
            <Text
              style={[
                styles.filterButtonText,
                currentFilter === status && styles.filterButtonTextActive,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }, [currentFilter, handleFilterChange]);


  return (
    <LinearGradient
      colors={['#A3D8F4', '#FFE7C7', '#A3F7BF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBackground}
    >
      {/* Status Bar configuration */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Booking Management</Text>
      </View>

      {/* Main content wrapper, adjusting for header height */}
      <View style={styles.contentWrapper}>
        {loading && !refreshing && ( // Show main loading indicator only if not refreshing
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#00796b" />
            <Text style={styles.loaderText}>Loading bookings...</Text>
          </View>
        )}


        {error && (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>🚨 {error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchBookings}>
                    <Text style={styles.retryButtonText}>Tap to Retry</Text>
                </TouchableOpacity>
            </View>
        )}


        {/* Filter Buttons */}
        {renderFilterButtons}


        {/* Bookings List */}
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id?.toString() || `booking-${Math.random()}`}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <BookingCard item={item} onView={handleView} onEdit={handleEdit} />
          )}
          ListEmptyComponent={
            !loading && !error && (
              <Text style={styles.emptyText}>No bookings found for this filter.</Text>
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#00796b', '#A3D8F4']} // Android colors
              tintColor="#00796b" // iOS color
            />
          }
        />


        {/* View Details Modal */}
        {view && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={true}
            onRequestClose={() => setView(null)}
          >
            <View style={styles.centeredModalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Booking Details</Text>
                <ScrollView contentContainerStyle={styles.modalScrollContent}>
                  <Text style={styles.modalText}>
                    <Text style={styles.bold}>ID:</Text> {view.id || '-'}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.bold}>User ID:</Text> {view.userId || '-'}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.bold}>Flight Name:</Text> {view.flightName || '-'}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.bold}>Date:</Text> {formatDate(view.date)}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.bold}>Passengers:</Text> {view.passengers || '-'}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.bold}>Status:</Text> {view.status || '-'}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.bold}>Created At:</Text> {formatDate(view.createdAt)}
                  </Text>
                  {/* Add more details here if available in your API */}
                  <Text style={styles.modalText}>
                    <Text style={styles.bold}>Origin:</Text> {view.origin || '-'}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.bold}>Destination:</Text> {view.destination || '-'}
                  </Text>
                </ScrollView>
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.modalCloseButton]}
                  onPress={() => setView(null)}
                >
                  <Text style={styles.modalActionButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}


        {/* Edit Booking Status Modal */}
        {editBooking && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={true}
            onRequestClose={cancelEdit}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.centeredModalContainer}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Booking Status</Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Booking ID:</Text> {editBooking.id || '-'}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Current Status:</Text> {editBooking.status || '-'}
                </Text>


                <View style={styles.statusInputContainer}>
                  <TextInput
                    style={styles.inputField}
                    value={editBooking.newStatus}
                    onChangeText={(text) =>
                      setEditBooking((prev) => ({ ...prev, newStatus: text }))
                    }
                    placeholder="New Status (e.g., Confirmed, Cancelled, Pending)"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                  />
                  {/* Optional: Add a dropdown/picker here for status selection to prevent typos */}
                </View>


                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.modalSaveButton]}
                    onPress={saveEditBooking}
                    disabled={loading}
                  >
                    <Text style={styles.modalActionButtonText}>
                      {loading ? 'Saving...' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.modalCancelButton]}
                    onPress={cancelEdit}
                    disabled={loading}
                  >
                    <Text style={styles.modalActionButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        )}
      </View>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  // New Header Style (from FeedbackManagementScreen)
  header: {
    // Positioning header absolutely to cover the top of the screen
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)', // Slightly transparent white
    paddingHorizontal: 20,
    // Adjust padding top for StatusBar, increasing it to move header down
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 20 : 60, // Increased by 20 on Android, 20 on iOS
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#a3f7bf',
    elevation: 2, // Android shadow
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10, // Ensure header is on top
  },
  headerTitle: { // Renamed from headerText to avoid conflict with existing headerText
    fontSize: width * 0.065, // Slightly smaller than old headerText, more aligned with Feedback screen
    fontWeight: 'bold',
    color: '#004d40', // Darker green for header title
    textAlign: 'center',
  },
  // Main content wrapper to sit below the absolute header
  contentWrapper: {
    flex: 1,
    padding: width * 0.04, // Use relative padding
    // Padding top to offset the absolute header, ensuring content starts below it
    // Value increased by the same amount added to header.paddingTop (e.g., 20)
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 56 + 30 : 40 + 56 + 30, // Header height approx 56 + base padding + extra 20
    // No background color here as it's provided by gradientBackground
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
  },
  loaderText: {
    marginTop: 10,
    fontSize: width * 0.04,
    color: '#00796b',
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#fee2e2', // Light red background
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444', // Red text
    fontSize: width * 0.04,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#dc2626', // Darker red button
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: width * 0.038,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribute items evenly
    backgroundColor: 'rgba(255,255,255,0.7)', // Slightly transparent background
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden', // Ensures inner border-radius works
    padding: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  filterButton: {
    flex: 1, // Make buttons take equal width
    paddingVertical: 12,
    borderRadius: 8, // Rounded corners for each button
    marginHorizontal: 3, // Small space between buttons
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#00796b', // Active button background
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  filterButtonText: {
    fontSize: width * 0.04,
    color: '#00796b', // Default text color
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff', // Active text color
    fontWeight: '700',
  },
  listContainer: {
    paddingBottom: 100, // Ensure space at the bottom for scrolling
  },
  card: {
    backgroundColor: '#fff',
    padding: width * 0.05,
    marginBottom: 15,
    borderRadius: 12, // More rounded
    elevation: 5, // Stronger shadow for Android
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderLeftWidth: 6, // Emphasize card with a border
    borderLeftColor: '#00796b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cardTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#004d40',
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontSize: width * 0.038,
    fontWeight: 'bold',
    color: '#444',
    marginRight: 5,
    minWidth: width * 0.18, // Align values
  },
  value: {
    fontSize: width * 0.038,
    color: '#555',
    flexShrink: 1, // Allow text to wrap
  },
  bold: {
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: width * 0.038,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    minWidth: 80,
    textAlign: 'center',
  },
  statusConfirmed: {
    backgroundColor: '#e6ffee',
    color: '#28a745',
  },
  statusPending: {
    backgroundColor: '#fff3cd',
    color: '#ffc107',
  },
  statusCancelled: {
    backgroundColor: '#f8d7da',
    color: '#dc3545',
  },
  statusDefault: {
    backgroundColor: '#e9ecef',
    color: '#6c757d',
  },
  buttonGroup: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-around', // Space buttons out
  },
  cardButton: {
    backgroundColor: '#00796b',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1, // Make buttons stretch
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: width * 0.035,
  },
  centeredModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', // Darker overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%', // Larger modal
    maxHeight: '85%', // Limit height
    padding: 25,
    borderRadius: 15, // More rounded
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalScrollContent: {
    paddingVertical: 10, // Padding within scroll
  },
  modalTitle: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#004d40',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  modalText: {
    fontSize: width * 0.042,
    marginBottom: 8,
    color: '#333',
    lineHeight: width * 0.055, // Better line spacing
  },
  modalActionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  modalActionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: width * 0.04,
  },
  modalCloseButton: {
    backgroundColor: '#757575',
  },
  statusInputContainer: {
    marginVertical: 15,
  },
  inputField: {
    height: 50, // Taller input
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 15,
    fontSize: width * 0.04,
    color: '#222',
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalSaveButton: {
    backgroundColor: '#00796b',
    flex: 1,
    marginRight: 10,
  },
  modalCancelButton: {
    backgroundColor: '#d9534f', // Red for cancel
    flex: 1,
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: width * 0.045,
    color: '#666',
    fontWeight: '500',
  },
});
