import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const { width, height } = Dimensions.get('window');

// User API endpoints declared as constants and functions for dynamic URLs
const GET_ALL_USERS_API = 
  'https://ecotrails-dev-users-func20250717225342.azurewebsites.net/api/api/admin/users';
const UPDATE_USER_API = (id) =>
  `https://ecotrails-dev-users-func20250717225342.azurewebsites.net/api/api/admin/users/${id}`;
const DELETE_USER_API = (id) =>
  `https://ecotrails-dev-users-func20250717225342.azurewebsites.net/api/api/admin/users/${id}`;

export default function UsersAdminScreen() {
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  // Modal states
  const [view, setView] = useState(null);
  const [edit, setEdit] = useState(null);

  // Fetch all users (GET /api/admin/users)
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(GET_ALL_USERS_API, { method: 'GET' });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch users');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users by status
  const filteredUsers = users.filter((user) => {
    if (statusFilter === "All") return true;
    return (user.status || "").toLowerCase() === statusFilter.toLowerCase();
  });

  // Open edit modal with user data
  const handleEdit = (userId) => {
    const user = users.find((u) => u.id === userId);
    setEdit({ ...user });
  };

  // Save edited user (PUT /api/admin/users/{id})
  const handleSave = async () => {
    if (!edit) return;
    try {
      const res = await fetch(UPDATE_USER_API(edit.id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: edit.role,
          status: edit.status,
        }),
      });
      if (!res.ok) throw new Error('Update failed');
      Alert.alert('Success', 'User updated');
      setEdit(null);
      fetchUsers();
    } catch (e) {
      Alert.alert('Update Failed', e.message || 'Could not update user');
    }
  };

  // Delete user by ID (DELETE /api/admin/users/{id})
  const handleDelete = (userId) => {
    Alert.alert(
      'Confirm Delete',
      'Delete this user? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(DELETE_USER_API(userId), { method: 'DELETE' });
              if (!res.ok) throw new Error('Delete failed');
              Alert.alert('Deleted', 'User deleted');
              fetchUsers();
            } catch (err) {
              Alert.alert('Delete Failed', err.message || 'Could not delete user');
            }
          }
        }
      ]
    );
  };

  const handleView = (user) => setView(user);
  const handleCancel = () => setEdit(null);

  // Helper to render label and value pairs
  const renderLabelValue = (label, value) => (
    <View key={label} style={styles.labelValueRow}>
      <Text style={[styles.label, styles.bold]}>{label}: </Text>
      <Text style={styles.label}>{value != null ? String(value) : '-'}</Text>
    </View>
  );

  // Render each user card
  const renderUserItem = ({ item }) => {
    const initial = item.firstName ? item.firstName.charAt(0).toUpperCase() : '?';

    return (
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
          {renderLabelValue('ID', item.id)}
          <View style={styles.labelValueRow}>
            <Text style={[styles.label, styles.bold]}>Name: </Text>
            <Text style={styles.label}>
              {item.firstName ?? '-'} {item.lastName ?? ''}
            </Text>
          </View>
          {renderLabelValue('NIC/Passport', item.nicOrPassport ?? '-')}
          {renderLabelValue('DOB', item.dateOfBirth ?? '-')}
          {renderLabelValue('Email', item.email ?? '-')}
          {renderLabelValue('Role', item.role ?? '-')}
          {renderLabelValue('Status', item.status ?? '-')}
          <View style={styles.buttonGroup}>
            <View style={styles.buttonWrapper}>
              <Button title="Edit" onPress={() => handleEdit(item.id)} />
            </View>
            <View style={styles.buttonWrapper}>
              <Button title="Delete" onPress={() => handleDelete(item.id)} color="#d9534f" />
            </View>
            <View style={styles.buttonWrapper}>
              <Button title="View" onPress={() => handleView(item)} />
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>User Management</Text>
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Filter by Status:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={statusFilter}
                onValueChange={(itemValue) => setStatusFilter(itemValue)}
                style={styles.picker}
                mode="dropdown"
              >
                <Picker.Item label="All" value="All" />
                <Picker.Item label="Active" value="Active" />
                <Picker.Item label="Inactive" value="Inactive" />
                <Picker.Item label="Pending" value="Pending" />
              </Picker>
            </View>
          </View>

          <FlatList
            data={filteredUsers}
            keyExtractor={(item, index) => (item?.id != null ? String(item.id) : `user_${index}`)}
            contentContainerStyle={styles.listContent}
            refreshing={loading}
            onRefresh={fetchUsers}
            renderItem={renderUserItem}
            showsVerticalScrollIndicator={true}
          />
        </View>

        {/* View User Modal */}
        {view && (
          <View style={styles.modalContainer} key={`view_${view.id}`}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>User Details</Text>
              {renderLabelValue('ID', view.id)}
              <View style={styles.labelValueRow}>
                <Text style={[styles.modalText, styles.bold]}>Name: </Text>
                <Text style={styles.modalText}>
                  {view.firstName ?? '-'} {view.lastName ?? ''}
                </Text>
              </View>
              {renderLabelValue('NIC/Passport', view.nicOrPassport ?? '-')}
              {renderLabelValue('DOB', view.dateOfBirth ?? '-')}
              {renderLabelValue('Email', view.email ?? '-')}
              {renderLabelValue('Role', view.role ?? '-')}
              {renderLabelValue('Status', view.status ?? '-')}

              <View style={styles.modalButtonContainer}>
                <Button title="Close" onPress={() => setView(null)} color="#00796b" />
              </View>
            </View>
          </View>
        )}

        {/* Edit User Modal */}
        {edit && (
          <View style={styles.modalContainer} key={`edit_${edit.id}`}>
            <View style={styles.modalBox}>
              <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
                <Text style={styles.modalTitle}>Edit User</Text>
                <TextInput
                  style={styles.inputField}
                  value={edit.role}
                  onChangeText={(text) => setEdit({ ...edit, role: text })}
                  placeholder="Role"
                />
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={edit.status}
                    onValueChange={(itemValue) => setEdit({ ...edit, status: itemValue })}
                    style={styles.picker}
                  >
                    <Picker.Item label="Active" value="Active" />
                    <Picker.Item label="Inactive" value="Inactive" />
                    <Picker.Item label="Pending" value="Pending" />
                  </Picker>
                </View>
                <View style={styles.modalButtons}>
                  <Button title="Save" onPress={handleSave} color="#00796b" />
                  <Button title="Cancel" onPress={handleCancel} color="#d9534f" />
                </View>
              </ScrollView>
            </View>
          </View>
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
    color: '#004d40'
  },
  contentWrapper: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 56 : 96,
    paddingHorizontal: width * 0.05,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: width * 0.04,
    marginBottom: 6,
    color: '#004d40',
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
  },
  profileIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#004d40',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  profileIconText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
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
    flexBasis: "30%",
    marginVertical: 5,
    marginHorizontal: 2,
  },
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.38)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
  },
  modalBox: {
    width: "100%",
    maxHeight: height * 0.7,
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
  },
  modalText: {
    fontSize: width * 0.038,
    marginBottom: 8,
    color: '#333',
  },
  modalButtonContainer: {
    marginTop: 15,
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
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
});
