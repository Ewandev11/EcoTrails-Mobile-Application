import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  Button,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");
const API_BASE = 'https://ecotrails-dev-itineraries-func.azurewebsites.net/api/api/admin';

export default function ItinerariesAdminScreen() {
  const [itineraries, setItineraries] = useState([]);
  const [view, setView] = useState(null);
  const [edit, setEdit] = useState(null);
  const [add, setAdd] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchItineraries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/itineraries?`);
      const data = await res.json();
      setItineraries(Array.isArray(data) ? data : []);
    } catch (err) {
      Alert.alert('Error', 'Could not load itineraries. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItineraries(); }, [fetchItineraries]);

  const handleAddNewItinerary = useCallback(async () => {
    if (!add?.name || !add?.durationDays || !add?.status) {
      Alert.alert('Error', 'Please fill all fields: Name, Duration Days, and Status.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/itineraries?`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Name: add.name,
          DurationDays: Number(add.durationDays),
          Status: add.status,
          Description: add.description || null,
          ItineraryJson: add.itineraryJson || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to create itinerary.');
      Alert.alert('Success', 'Itinerary created.');
      setAdd(null);
      fetchItineraries();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to create itinerary.');
    }
  }, [add, fetchItineraries]);

  const handleEdit = useCallback((id) => {
    const itinerary = itineraries.find((item) => item.id === id || item.Id === id);
    if (!itinerary) return;
    setEdit({
      id: itinerary.id || itinerary.Id,
      name: itinerary.name || itinerary.Name,
      durationDays: itinerary.durationDays || itinerary.DurationDays,
      status: itinerary.status || itinerary.Status,
      description: itinerary.description || itinerary.Description,
      // Removed itineraryJson field here
    });
  }, [itineraries]);

  const handleSaveEdit = useCallback(async () => {
    if (!edit.name || !edit.durationDays || !edit.status) {
      Alert.alert('Error', 'Please fill all fields: Name, Duration Days, and Status.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/itineraries/${edit.id}?`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Id: edit.id,
          Name: edit.name,
          DurationDays: Number(edit.durationDays),
          Status: edit.status,
          Description: edit.description || null,
          // Not including ItineraryJson in save payload as per requirement
        }),
      });
      if (!res.ok) throw new Error('Failed to save itinerary.');
      Alert.alert('Success', 'Itinerary updated.');
      setEdit(null);
      fetchItineraries();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save itinerary.');
    }
  }, [edit, fetchItineraries]);

  const handleDelete = useCallback((id) => {
    Alert.alert('Confirm Delete', `Delete itinerary with ID: ${id}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${API_BASE}/itineraries/${id}?`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete itinerary.');
            Alert.alert('Success', 'Itinerary deleted.');
            fetchItineraries();
            if (edit?.id === id) setEdit(null);
            if (view?.id === id) setView(null);
          } catch (err) {
            Alert.alert('Error', err.message || 'Failed to delete itinerary.');
          }
        }
      }
    ]);
  }, [edit, fetchItineraries, view]);

  // Helper to wrap label and value properly within Text components
  const renderLabelValue = (label, value) => (
    <View key={label} style={styles.labelValueRow}>
      <Text style={[styles.label, styles.bold]}>{label}: </Text>
      <Text style={styles.label}>{value != null ? String(value) : '-'}</Text>
    </View>
  );

  const renderItineraryItem = ({ item, index }) => {
    return (
      <LinearGradient
        colors={['#A3D8F4', '#FFE7C7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.detailsContainer}>
          {renderLabelValue('ID', item.id || item.Id)}
          {renderLabelValue('Name', item.name || item.Name)}
          {renderLabelValue('Duration', item.durationDays || item.DurationDays)}
          {renderLabelValue('Status', item.status || item.Status)}
          <View style={styles.buttonGroup}>
            <View style={styles.buttonWrapper}>
              <Button title="Edit" onPress={() => handleEdit(item.id || item.Id)} />
            </View>
            <View style={styles.buttonWrapper}>
              <Button title="Delete" color="#d9534f" onPress={() => handleDelete(item.id || item.Id)} />
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  };

  return (
    <LinearGradient
      colors={['#A3D8F4', '#FFE7C7', '#A3F7BF']}
      style={styles.gradientBackground}
    >
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        {/* Header - absolutely positioned */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Itinerary Management</Text>
        </View>

        <View style={styles.contentWrapper}>
          {/* List */}
          <FlatList
            data={itineraries}
            keyExtractor={(item, index) => {
              if (item?.id != null) return String(item.id);
              if (item?.Id != null) return String(item.Id);
              return `${item.name || 'unnamed'}_${item.durationDays || '0'}_${index}`;
            }}
            contentContainerStyle={styles.listContent}
            renderItem={renderItineraryItem}
            refreshing={loading}
            onRefresh={fetchItineraries}
            showsVerticalScrollIndicator={true}
          />
        </View>

        {/* Add New Itinerary Button below contentWrapper */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setAdd({ status: 'Draft' })}
            accessibilityRole="button"
            accessibilityLabel="Add New Itinerary"
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>Add New Itinerary</Text>
          </TouchableOpacity>
        </View>

        {/* Edit Modal */}
        {edit && (
          <Modal transparent visible animationType="fade" onRequestClose={() => setEdit(null)}>
            <ScrollView contentContainerStyle={styles.modalContainer}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Edit Itinerary</Text>
                <TextInput
                  style={styles.inputField}
                  value={edit.name}
                  onChangeText={text => setEdit(e => ({ ...e, name: text }))}
                  placeholder="Name"
                  placeholderTextColor="#888"
                />
                <TextInput
                  style={styles.inputField}
                  value={edit.durationDays?.toString() || ''}
                  onChangeText={text => setEdit(e => ({ ...e, durationDays: text }))}
                  placeholder="Duration Days"
                  keyboardType="numeric"
                  placeholderTextColor="#888"
                />
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={edit.status}
                    onValueChange={val => setEdit(e => ({ ...e, status: val }))}
                    style={styles.picker}
                  >
                    <Picker.Item label="Published" value="Published" />
                    <Picker.Item label="Draft" value="Draft" />
                    <Picker.Item label="Approved" value="Approved" />
                    <Picker.Item label="Declined" value="Declined" />
                  </Picker>
                </View>
                <TextInput
                  style={[styles.inputField, { height: 80 }]}
                  value={edit.description || ''}
                  onChangeText={text => setEdit(e => ({ ...e, description: text }))}
                  placeholder="Description"
                  multiline
                  placeholderTextColor="#888"
                />
                {/* Removed ItineraryJson input field here */}
                <View style={styles.modalButtons}>
                  <Button title="Save" onPress={handleSaveEdit} color="#00796b" />
                  <Button title="Cancel" onPress={() => setEdit(null)} color="#d9534f" />
                </View>
              </View>
            </ScrollView>
          </Modal>
        )}

        {/* Add Modal */}
        {add && (
          <Modal transparent visible animationType="fade" onRequestClose={() => setAdd(null)}>
            <ScrollView contentContainerStyle={styles.modalContainer}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Add New Itinerary</Text>
                <TextInput
                  style={styles.inputField}
                  value={add.name}
                  onChangeText={text => setAdd(a => ({ ...a, name: text }))}
                  placeholder="Name"
                  placeholderTextColor="#888"
                />
                <TextInput
                  style={styles.inputField}
                  value={add.durationDays || ''}
                  onChangeText={text => setAdd(a => ({ ...a, durationDays: text }))}
                  placeholder="Duration Days"
                  keyboardType="numeric"
                  placeholderTextColor="#888"
                />
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={add.status}
                    onValueChange={val => setAdd(a => ({ ...a, status: val }))}
                    style={styles.picker}
                  >
                    <Picker.Item label="Published" value="Published" />
                    <Picker.Item label="Draft" value="Draft" />
                    <Picker.Item label="Approved" value="Approved" />
                    <Picker.Item label="Declined" value="Declined" />
                  </Picker>
                </View>
                <TextInput
                  style={[styles.inputField, { height: 80 }]}
                  value={add.description || ''}
                  onChangeText={text => setAdd(a => ({ ...a, description: text }))}
                  placeholder="Description"
                  multiline
                  placeholderTextColor="#888"
                />
                <TextInput
                  style={[styles.inputField, { height: 80 }]}
                  value={add.itineraryJson || ''}
                  onChangeText={text => setAdd(a => ({ ...a, itineraryJson: text }))}
                  placeholder="Itinerary JSON"
                  multiline
                  placeholderTextColor="#888"
                />
                <View style={styles.modalButtons}>
                  <Button title="Save" onPress={handleAddNewItinerary} color="#00796b" />
                  <Button title="Cancel" onPress={() => setAdd(null)} color="#d9534f" />
                </View>
              </View>
            </ScrollView>
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
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 40,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#a3f7bf',
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
  contentWrapper: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 56 : 96,
    paddingHorizontal: width * 0.05,
  },
  addButtonContainer: {
    marginVertical: 15,
    alignItems: 'center',
  },
  addButton: {
    width: "80%",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#00796b',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#00796b',
    fontWeight: 'bold',
    fontSize: width * 0.045,
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    padding: width * 0.04,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#a3f7bf',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: '#a3f7bf',
    backgroundColor: '#fff',
  },
  detailsContainer: {
    flex: 1,
  },
  labelValueRow: {
    flexDirection: 'row',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: width * 0.038,
    color: '#222',
  },
  bold: {
    fontWeight: "bold",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    flexWrap: "wrap",
  },
  buttonWrapper: {
    flexGrow: 1,
    flexBasis: "48%",
    marginVertical: 5,
    marginHorizontal: 2,
  },
  modalContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.38)",
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.05,
  },
  modalBox: {
    width: "100%",
    maxHeight: height * 0.8,
    backgroundColor: "#fefefa",
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#a3f7bf',
    shadowColor: '#a3f7bf',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  modalTitle: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    marginBottom: 14,
    color: '#004d40',
    textAlign: 'center',
  },
  inputField: {
    height: 44,
    borderColor: "#a3f7bf",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 14,
    paddingHorizontal: 12,
    color: '#004d40',
    backgroundColor: '#eafaf4',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#a3f7bf",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: '#eafaf4',
    marginBottom: 10,
  },
  picker: {
    height: 44,
    width: "100%",
    color: '#004d40',
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
});
