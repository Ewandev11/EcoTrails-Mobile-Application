import { LinearGradient } from 'expo-linear-gradient'; 
import { useEffect, useState } from 'react';
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
} from 'react-native';

const { width, height } = Dimensions.get('window');

const CREATE_LOCATION_API =
  'https://ecotrails-dev-users-func20250717225342.azurewebsites.net/api/api/admin/locations?';
const UPDATE_LOCATION_API = (id) =>
  `https://ecotrails-dev-users-func20250717225342.azurewebsites.net/api/api/admin/locations/${id}`;
const DELETE_LOCATION_API = (id) =>
  `https://ecotrails-dev-users-func20250717225342.azurewebsites.net/api/api/admin/locations/${id}`;
const GET_PUBLIC_LOCATIONS_API =
  'https://ecotrails-dev-users-func20250717225342.azurewebsites.net/api/api/locations?';

export default function LocationAdminScreen() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal for add/edit
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    Id: null,
    Name: '',
    Description: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch locations from public endpoint
  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await fetch(GET_PUBLIC_LOCATIONS_API);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to fetch locations');
      }
      const data = await response.json();
      setLocations(Array.isArray(data) ? data : (data.locations || []));
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load locations');
      setLocations([]);
    }
    setLoading(false);
  };

  // Fetch locations on mount and after changes
  useEffect(() => {
    fetchLocations();
  }, []);

  const resetForm = () => {
    setForm({ Id: null, Name: '', Description: '' });
    setIsEditing(false);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (loc) => {
    setForm({
      Id: loc.LocationId, // Ensure the right property is used here
      Name: loc.Name || '',
      Description: loc.Description || '',
    });
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleSaveLocation = async () => {
    if (!form.Name.trim()) {
      Alert.alert('Validation Error', 'Name is required.');
      return;
    }
    setSaving(true);
    try {
      if (isEditing) {
        // Update existing location
        const response = await fetch(UPDATE_LOCATION_API(form.Id), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            LocationId: form.Id, // Ensure LocationId is sent for update
            Name: form.Name,
            Description: form.Description,
          }),
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Failed to update location');
        }

        Alert.alert('Success', 'Location updated.');
      } else {
        // Create new location
        const response = await fetch(CREATE_LOCATION_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Name: form.Name,
            Description: form.Description,
          }),
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Failed to create location');
        }

        Alert.alert('Success', 'Location created.');
      }
      setModalVisible(false);
      resetForm();
      // Refresh the list from the server
      fetchLocations();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
    setSaving(false);
  };

  const handleDeleteLocation = (id) => {
    Alert.alert(
      'Delete Location',
      'Are you sure you want to delete this location?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const response = await fetch(DELETE_LOCATION_API(id), {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }, // Optional header
              });

              if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Failed to delete location');
              }
              Alert.alert('Success', 'Location deleted.');
              setModalVisible(false);
              resetForm();
              // Refresh the list from the server
              fetchLocations();
            } catch (error) {
              Alert.alert('Error', error.message);
            }
            setDeleting(false);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => openEditModal(item)}
      style={styles.card}
      activeOpacity={0.7}
      accessibilityLabel={`Location ${item.Name}`}
      accessibilityHint="Tap to edit this location"
    >
      <Text style={styles.locationName}>{item.Name}</Text>
      {item.Description ? (
        <Text style={styles.locationDesc}>{item.Description}</Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#A3D8F4', '#FFE7C7']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        <View style={styles.header}>
          <Text style={styles.headerText}>Locations Admin</Text>
          <Button title="Add Location" color="#388e3c" onPress={openAddModal} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#00796b" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={locations}
            keyExtractor={(item) => item.LocationId?.toString() ?? item.id?.toString() ?? Math.random().toString()}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No locations available.</Text>
            }
            contentContainerStyle={{ padding: 12 }}
          />
        )}

        {/* Modal for Create/Edit */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                <Text style={styles.modalTitle}>
                  {isEditing ? 'Edit Location' : 'Add Location'}
                </Text>

                <TextInput
                  placeholder="Name *"
                  style={styles.input}
                  value={form.Name}
                  onChangeText={(text) => setForm((f) => ({ ...f, Name: text }))}
                  editable={!saving && !deleting}
                  accessibilityLabel="Location Name input"
                />
                <TextInput
                  placeholder="Description"
                  style={[styles.input, { height: 80 }]}
                  value={form.Description}
                  onChangeText={(text) => setForm((f) => ({ ...f, Description: text }))}
                  multiline
                  editable={!saving && !deleting}
                  accessibilityLabel="Location Description input"
                />

                <View style={styles.modalButtons}>
                  <Button
                    title={isEditing ? 'Update' : 'Create'}
                    onPress={handleSaveLocation}
                    disabled={saving || deleting}
                    color="#388e3c"
                  />
                  {isEditing && (
                    <Button
                      title="Delete"
                      onPress={() => handleDeleteLocation(form.Id)}
                      disabled={saving || deleting}
                      color="#d32f2f"
                    />
                  )}
                  <Button
                    title="Cancel"
                    onPress={() => {
                      setModalVisible(false);
                      resetForm();
                    }}
                    disabled={saving || deleting}
                    color="#888"
                  />
                </View>
                {(saving || deleting) && (
                  <ActivityIndicator size="large" color="#00796b" style={{ marginTop: 10 }} />
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 40 : 60,
    paddingBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  locationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#206925',
  },
  locationDesc: {
    marginTop: 4,
    color: '#555',
  },
  emptyText: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: height * 0.8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#204d25',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#a3f7bf',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 12,
  },
  modalButtons: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
