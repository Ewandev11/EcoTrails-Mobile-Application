import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

// Declare itinerary request endpoints explicitly as per your description
const GET_ALL_ITINERARY_REQUESTS_API =
  'https://ecotrails-dev-itineraries-func.azurewebsites.net/api/api/admin/itinerary-requests';
const GET_ITINERARY_REQUEST_DETAILS_API = (id) =>
  `https://ecotrails-dev-itineraries-func.azurewebsites.net/api/api/admin/itinerary-requests/${id}?`;
const UPDATE_ITINERARY_REQUEST_STATUS_API = (id) =>
  `https://ecotrails-dev-itineraries-func.azurewebsites.net/api/api/admin/itinerary-requests/${id}/status?`;

export default function ItineraryRequestsAdminScreen() {
  const [requests, setRequests] = useState([]);
  const [view, setView] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // State for update modal fields
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  // You can add more fields here if needed, e.g.:
  // const [updateOtherField, setUpdateOtherField] = useState('');

  // Fetch all itinerary requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(GET_ALL_ITINERARY_REQUESTS_API);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      Alert.alert('Error', 'Could not load itinerary requests.');
      setRequests([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Fetch single itinerary request details and initialize update form
  const fetchRequestDetails = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await fetch(GET_ITINERARY_REQUEST_DETAILS_API(id));
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setView(data);
      setUpdateStatus(data.status || '');
      // setUpdateOtherField(''); // Reset if you have other fields
    } catch (error) {
      console.error("Failed to fetch request details:", error);
      Alert.alert('Error', 'Could not fetch details for this request.');
      setView(null);
    }
    setLoading(false);
  }, []);

  // Handler for viewing details (opens modal)
  const handleViewDetails = useCallback((id) => {
    fetchRequestDetails(id);
  }, [fetchRequestDetails]);

  // Handler to mark request as Reviewed (quick status update)
  const handleMarkAsReviewed = useCallback(async () => {
    if (!view || updating) return;
    setUpdating(true);
    try {
      const res = await fetch(UPDATE_ITINERARY_REQUEST_STATUS_API(view.id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Reviewed' }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to update status.');
      }
      Alert.alert('Success', `Request ${view.id} marked as Reviewed.`);
      setView(null);
      fetchRequests();
    } catch (error) {
      console.error("Failed to update status:", error);
      Alert.alert('Error', error.message || 'Could not update status.');
    }
    setUpdating(false);
  }, [view, updating, fetchRequests]);

  // Open Update Modal manually to edit status or other fields
  const openUpdateModal = () => {
    if (!view) return;
    setUpdateStatus(view.status || '');
    // setUpdateOtherField(''); // Reset others if used
    setUpdateModalVisible(true);
  };

  // Close Update Modal
  const closeUpdateModal = () => {
    setUpdateModalVisible(false);
  };

  // Save update from Update Modal (PUT full update or partial)
  const handleSaveUpdate = async () => {
    if (!view) return;

    setUpdating(true);
    try {
      // Prepare update body, including any fields you want to update
      const body = {
        ...view,
        status: updateStatus,
        // Add other updated fields here if added, e.g.:
        // otherField: updateOtherField,
      };

      const res = await fetch(UPDATE_ITINERARY_REQUEST_API(view.id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to update itinerary request.');
      }

      Alert.alert('Success', 'Request updated successfully.');
      setUpdateModalVisible(false);
      setView(null);
      fetchRequests();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update request.');
    }
    setUpdating(false);
  };

  // Helper to render label-value pairs with proper Text wrapping
  const renderLabelValue = (label, value, labelStyle = styles.label, valueStyle = styles.label) => (
    <View key={label} style={styles.labelValueRow}>
      <Text style={[labelStyle, styles.bold]}>{label}: </Text>
      <Text style={valueStyle}>{value != null ? String(value) : ''}</Text>
    </View>
  );

  // Render each itinerary request item in the list
  const renderRequestItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.card}
      accessibilityLabel={`Itinerary request ${item.id}`}
      accessibilityHint="Tap to view details"
      onPress={() => handleViewDetails(item.id)}
    >
      {[
        ['ID', item.id],
        ['User', item.user],
        ['Dates', item.travelDates],
        ['Type', item.travelType],
        ['Status', item.status],
      ].map(([label, value]) => renderLabelValue(label, value))}
      <View style={styles.buttonContainer}>
        <Button
          title="View Details"
          onPress={() => handleViewDetails(item.id)}
          color="#00796b"
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#A3D8F4', '#FFE7C7', '#A3F7BF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        {/* Custom header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Itinerary Requests</Text>
        </View>

        <View style={styles.container}>
          {loading ? (
            <ActivityIndicator size="large" color="#00796b" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={requests}
              keyExtractor={(item) => (item.id ? String(item.id) : Math.random().toString())}
              contentContainerStyle={requests.length === 0 ? styles.emptyListContainer : styles.listContent}
              renderItem={renderRequestItem}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No itinerary requests found.</Text>
              }
            />
          )}
        </View>

        {/* Modal: Request Details */}
        <Modal visible={!!view} animationType="slide" transparent={true} onRequestClose={() => setView(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                <Text style={styles.modalTitle}>Request Details</Text>
                {view && [
                  ['Request ID', view.id],
                  ['User', view.user],
                  ['Budget (LKR)', view.budget],
                  ['Transport', view.transport],
                  ['Dates', view.travelDates],
                  ['Type', view.travelType],
                  [
                    'Interests',
                    Array.isArray(view.interests)
                      ? view.interests.join(", ")
                      : String(view.interests || '')
                  ],
                  ['Status', view.status],
                ].map(([label, value]) => (
                  <View key={label} style={styles.modalLabelValueRow}>
                    <Text style={[styles.modalText, styles.bold]}>{label}: </Text>
                    <Text style={styles.modalText}>{value != null ? String(value) : ''}</Text>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.modalButtons}>
                {view?.status !== 'Reviewed' && (
                  <Button
                    title={updating ? "Updating..." : "Mark as Reviewed"}
                    onPress={handleMarkAsReviewed}
                    disabled={updating}
                    color="#00796b"
                  />
                )}
                <Button
                  title="Update"
                  onPress={openUpdateModal}
                  disabled={updating}
                  color="#1976D2"
                />
                <Button
                  title="Close"
                  onPress={() => setView(null)}
                  disabled={updating}
                  color="#757575"
                />
              </View>

              {updating && (
                <ActivityIndicator size="small" color="#00796b" style={{ marginTop: 10 }} />
              )}
            </View>
          </View>
        </Modal>

        {/* Modal: Update Request */}
        <Modal visible={updateModalVisible} animationType="slide" transparent={true} onRequestClose={closeUpdateModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Update Request</Text>
              <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                <Text style={{ marginBottom: 6, fontWeight: 'bold', fontSize: 16 }}>Status</Text>
                <TextInput
                  style={styles.inputField}
                  value={updateStatus}
                  onChangeText={setUpdateStatus}
                  placeholder="Status"
                  editable={!updating}
                />
                {/* Add more fields here if needed */}
              </ScrollView>
              <View style={styles.modalButtons}>
                <Button
                  title={updating ? "Saving..." : "Save"}
                  onPress={handleSaveUpdate}
                  disabled={updating || !updateStatus.trim()}
                  color="#00796b"
                />
                <Button
                  title="Cancel"
                  onPress={closeUpdateModal}
                  disabled={updating}
                  color="#d9534f"
                />
              </View>
              {updating && (
                <ActivityIndicator size="small" color="#00796b" style={{ marginTop: 10 }} />
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 40 : 60,
    paddingBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#a3f7bf',
    elevation: 2,
  },
  headerText: {
    fontSize: width * 0.065,
    fontWeight: 'bold',
    color: '#004d40',
  },
  container: {
    flex: 1,
    padding: width * 0.05,
    paddingTop: 0,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: width * 0.04,
    color: '#555',
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  labelValueRow: {
    flexDirection: 'row',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: width * 0.04,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  label: {
    fontSize: width * 0.038,
    color: '#222',
  },
  bold: {
    fontWeight: "bold",
  },
  buttonContainer: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    maxHeight: height * 0.8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#204d25",
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
  },
  modalLabelValueRow: {
    flexDirection: 'row',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  modalButtons: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#a3f7bf',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 14,
    color: '#004d40',
    backgroundColor: '#eafaf4',
  },
});
