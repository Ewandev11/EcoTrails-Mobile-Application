import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Alert,
  Button,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// API endpoints WITHOUT trailing '?' to avoid issues
const GET_ALL_API = 'https://ecotrails-dev-partners-func.azurewebsites.net/api/api/admin/partner-applications';
const GET_DETAILS_API = (id) => `https://ecotrails-dev-partners-func.azurewebsites.net/api/api/admin/partner-applications/${id}`;
const UPDATE_STATUS_API = (id) => `https://ecotrails-dev-partners-func.azurewebsites.net/api/api/admin/partner-applications/${id}/status`;
const UPDATE_DETAILS_API = (id) => `https://ecotrails-dev-partners-func.azurewebsites.net/api/api/admin/partner-applications/${id}`;

export default function PartnersAdminScreen() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Modal State
  const [viewPartner, setViewPartner] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Edit Modal State and Form
  const [editPartner, setEditPartner] = useState(null);
  const [editForm, setEditForm] = useState({
    FullName: '',
    EmailAddress: '',
    BusinessName: '',
    TypeOfBusiness: '',
    Location: '',
    BriefDescription: '',
    Status: '',
  });
  const [editSaving, setEditSaving] = useState(false);

  // Status updating for approve/reject buttons
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Fetch all partner applications
  const fetchAllPartners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(GET_ALL_API);
      if (!res.ok) throw new Error('Failed to fetch partners');
      const data = await res.json();
      setPartners(Array.isArray(data) ? data : []);
    } catch (err) {
      Alert.alert('Error', 'Failed to load partner applications');
      setPartners([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllPartners();
  }, [fetchAllPartners]);

  // Fetch partner details for view modal
  const fetchPartnerDetails = useCallback(async (id) => {
    setDetailsLoading(true);
    try {
      const res = await fetch(GET_DETAILS_API(id));
      if (!res.ok) throw new Error('Failed to fetch partner details');
      const details = await res.json();
      setViewPartner(details);
    } catch (err) {
      Alert.alert('Error', 'Failed to load details');
      setViewPartner(null);
    }
    setDetailsLoading(false);
  }, []);

  // Open details modal for given partner
  const openDetailsModal = useCallback(
    (item) => {
      fetchPartnerDetails(item.Id);
    },
    [fetchPartnerDetails]
  );

  // Close details modal
  const closeDetailsModal = () => {
    setViewPartner(null);
  };

  // Open edit modal - prefill form from partner details
  const openEditModal = () => {
    if (!viewPartner) return;
    setEditForm({
      FullName: viewPartner.FullName || '',
      EmailAddress: viewPartner.EmailAddress || '',
      BusinessName: viewPartner.BusinessName || '',
      TypeOfBusiness: viewPartner.TypeOfBusiness || '',
      Location: viewPartner.Location || '',
      BriefDescription: viewPartner.BriefDescription || '',
      Status: viewPartner.Status || '',
    });
    setEditPartner(viewPartner);
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditPartner(null);
  };

  // Handle change on Edit form fields
  const handleEditChange = (key, value) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  // Save edited partner details (PUT)
  const saveEditPartner = async () => {
    if (!editPartner) return;

    // Basic validation
    if (!editForm.FullName.trim()) {
      Alert.alert('Validation Error', 'Full Name is required.');
      return;
    }
    if (!editForm.EmailAddress.trim()) {
      Alert.alert('Validation Error', 'Email Address is required.');
      return;
    }

    setEditSaving(true);
    try {
      const res = await fetch(UPDATE_DETAILS_API(editPartner.Id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Id: editPartner.Id,
          FullName: editForm.FullName,
          EmailAddress: editForm.EmailAddress,
          BusinessName: editForm.BusinessName,
          TypeOfBusiness: editForm.TypeOfBusiness,
          Location: editForm.Location,
          BriefDescription: editForm.BriefDescription,
          Status: editForm.Status,
          SubmittedAt: editPartner.SubmittedAt, // Preserve submission date if required
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to update application');
      }
      Alert.alert('Success', 'Partner details updated.');
      closeEditModal();
      closeDetailsModal();
      fetchAllPartners();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update details');
    }
    setEditSaving(false);
  };

  // Update partner status (approve/reject)
  const updatePartnerStatus = useCallback(
    async (id, newStatus) => {
      setStatusUpdating(true);
      try {
        const res = await fetch(UPDATE_STATUS_API(id), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Status: newStatus }),
        });
        if (res.ok) {
          Alert.alert('Success', `Application ${newStatus}!`);
          setViewPartner(null);
          fetchAllPartners();
        } else {
          const txt = await res.text();
          Alert.alert('Error', txt || 'Failed to update status.');
        }
      } catch {
        Alert.alert('Error', 'Network/server error.');
      }
      setStatusUpdating(false);
    },
    [fetchAllPartners]
  );

  // Render single partner item in list
  const renderPartnerItem = ({ item }) => {
    const initial = item.FullName ? item.FullName.charAt(0).toUpperCase() : '?';

    return (
      <TouchableOpacity
        onPress={() => openDetailsModal(item)}
        activeOpacity={0.8}
        style={styles.cardContainer}
        accessibilityLabel={`Partner application for ${item.FullName}`}
        accessibilityHint="Tap to view details"
      >
        <LinearGradient
          colors={['#A3D8F4', '#FFE7C7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.profileIcon}>
            <Text style={styles.profileIconText}>{initial}</Text>
          </View>
          <View style={styles.detailsContainer}>
            {[
              ['ID', item.Id],
              ['Name', item.FullName],
              ['Business', item.BusinessName],
              ['Type', item.TypeOfBusiness],
              ['Location', item.Location],
              ['Status', item.Status],
              ['Submitted', item.SubmittedAt ? item.SubmittedAt.split('T')[0] : '-'],
            ].map(([label, value]) => (
              <Text key={label} style={styles.cardText}>
                {label}: {value}
              </Text>
            ))}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={['#A3D8F4', '#FFE7C7', '#A3F7BF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        <View style={styles.header}>
          <Text style={styles.headerText}>Partner Applications</Text>
        </View>

        <View style={styles.scrollBackground}>
          {loading ? (
            <ActivityIndicator size="large" color="#00796b" style={{ marginTop: 30 }} />
          ) : (
            <FlatList
              data={partners}
              keyExtractor={(item) => String(item.Id)}
              renderItem={renderPartnerItem}
              ListEmptyComponent={<Text style={styles.emptyText}>No partner applications found.</Text>}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 30 }}
            />
          )}
        </View>

        {/* Partner Details Modal */}
        <Modal visible={!!viewPartner} animationType="slide" transparent onRequestClose={closeDetailsModal}>
          <View style={styles.modalContainer}>
            <View style={styles.modalBox}>
              {detailsLoading || !viewPartner ? (
                <ActivityIndicator size="large" color="#00796b" />
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalTitle}>Application Details</Text>
                  {[
                    ['ID', viewPartner.Id],
                    ['Full Name', viewPartner.FullName],
                    ['Email', viewPartner.EmailAddress],
                    ['Business Name', viewPartner.BusinessName],
                    ['Type', viewPartner.TypeOfBusiness],
                    ['Location', viewPartner.Location],
                    ['Description', viewPartner.BriefDescription],
                    ['Status', viewPartner.Status],
                    [
                      'Submitted',
                      viewPartner.SubmittedAt ? viewPartner.SubmittedAt.split('T')[0] : '-',
                    ],
                  ].map(([label, value]) => (
                    <View key={label} style={styles.modalLabelRow}>
                      <Text style={styles.modalLabel}>{label}: </Text>
                      <Text style={styles.modalValue}>{value}</Text>
                    </View>
                  ))}

                  <View style={styles.modalButtons}>
                    {/* Edit button to open edit modal */}
                    <Button title="Edit" onPress={openEditModal} disabled={statusUpdating} color="#1976D2" />
                    {viewPartner.Status === 'Pending' && (
                      <>
                        <Button
                          title="Approve"
                          color="#388e3c"
                          onPress={() => updatePartnerStatus(viewPartner.Id, 'Approved')}
                          disabled={statusUpdating}
                        />
                        <Button
                          title="Reject"
                          color="#d32f2f"
                          onPress={() => updatePartnerStatus(viewPartner.Id, 'Rejected')}
                          disabled={statusUpdating}
                        />
                      </>
                    )}
                    <Button title="Close" color="#888" onPress={closeDetailsModal} />
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* Edit Partner Modal */}
        <Modal visible={!!editPartner} animationType="slide" transparent onRequestClose={closeEditModal}>
          <View style={styles.modalContainer}>
            <View style={styles.modalBox}>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.modalTitle}>Edit Partner Application</Text>

                <TextInput
                  style={styles.inputField}
                  placeholder="Full Name"
                  value={editForm.FullName}
                  onChangeText={(text) => handleEditChange('FullName', text)}
                  editable={!editSaving}
                  autoCapitalize="words"
                />
                <TextInput
                  style={styles.inputField}
                  placeholder="Email Address"
                  value={editForm.EmailAddress}
                  onChangeText={(text) => handleEditChange('EmailAddress', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!editSaving}
                />
                <TextInput
                  style={styles.inputField}
                  placeholder="Business Name"
                  value={editForm.BusinessName}
                  onChangeText={(text) => handleEditChange('BusinessName', text)}
                  editable={!editSaving}
                />
                <TextInput
                  style={styles.inputField}
                  placeholder="Type of Business"
                  value={editForm.TypeOfBusiness}
                  onChangeText={(text) => handleEditChange('TypeOfBusiness', text)}
                  editable={!editSaving}
                />
                <TextInput
                  style={styles.inputField}
                  placeholder="Location"
                  value={editForm.Location}
                  onChangeText={(text) => handleEditChange('Location', text)}
                  editable={!editSaving}
                />
                <TextInput
                  style={[styles.inputField, { height: 80 }]}
                  placeholder="Brief Description"
                  value={editForm.BriefDescription}
                  onChangeText={(text) => handleEditChange('BriefDescription', text)}
                  multiline
                  editable={!editSaving}
                />
                <TextInput
                  style={styles.inputField}
                  placeholder="Status"
                  value={editForm.Status}
                  onChangeText={(text) => handleEditChange('Status', text)}
                  editable={!editSaving}
                />

                <View style={styles.modalButtons}>
                  <Button
                    title={editSaving ? 'Saving...' : 'Save'}
                    onPress={saveEditPartner}
                    disabled={editSaving}
                    color="#1976D2"
                  />
                  <Button title="Cancel" onPress={closeEditModal} disabled={editSaving} color="#888" />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  safeContainer: { flex: 1 },

  header: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 40,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#a3f7bf',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  headerText: {
    fontSize: width * 0.065,
    fontWeight: 'bold',
    color: '#004d40',
  },

  scrollBackground: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 56 : 96,
    paddingHorizontal: width * 0.05,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },

  cardContainer: {
    marginBottom: 15,
  },

  card: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: width * 0.04,
    elevation: 4,
    shadowColor: '#a3f7bf',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: '#a3f7bf',
  },

  profileIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },

  profileIconText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },

  detailsContainer: {
    flex: 1,
  },

  cardText: {
    fontSize: width * 0.035,
    marginBottom: 4,
    color: '#222',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#555',
    fontSize: width * 0.04,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: height * 0.8,
  },

  modalTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#004d40',
    textAlign: 'center',
  },

  modalLabelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },

  modalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1976D2',
  },

  modalValue: {
    fontWeight: 'normal',
    color: '#333',
    fontSize: 16,
  },

  modalButtons: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 18,
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
