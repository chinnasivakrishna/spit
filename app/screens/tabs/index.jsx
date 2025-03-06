import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ActivityIndicator, FlatList, Modal } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { globalStyles } from '../../styles/GlobalStyles'
import Icon from 'react-native-vector-icons/FontAwesome'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'

const API_URL = 'https://googlesingin.onrender.com/api';

const DashboardScreen = () => {
  const [userData, setUserData] = useState({
    name: 'User',
    photoUrl: null,
    greeting: 'Hello'
  });
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [friendEmails, setFriendEmails] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchGroups();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        router.replace('/'); 
        return;
      }
      
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const { user, greeting } = response.data;
      
      setUserData({
        name: user.name,
        photoUrl: user.photoUrl,
        greeting: greeting
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        return;
      }
      
      const response = await axios.get(`${API_URL}/dashboard/groups`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setGroups(response.data.groups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    try {
      setCreateLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      // Split emails by comma and trim whitespace
      const emailList = friendEmails.split(',').map(email => email.trim()).filter(email => email);
      
      const response = await axios.post(
        `${API_URL}/dashboard/groups/create`,
        {
          name: groupName,
          description: groupDescription,
          members: emailList
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Clear form and close modal
        setGroupName('');
        setGroupDescription('');
        setFriendEmails('');
        setCreateModalVisible(false);
        
        // Refresh groups list
        fetchGroups();
      } else {
        alert(response.data.message || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Error creating group. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigateToGroupDetail = (groupId) => {
    console.log('Navigating to group with ID:', groupId);
    if (groupId) {
      router.push({
        pathname: "group/GroupDetailScreen",
        params: { id: groupId }
      });
    } else {
      console.error('Cannot navigate: Group ID is undefined');
      alert('Error: Cannot view group details');
    }
  };

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => navigateToGroupDetail(item._id)}
    >
      <View style={styles.groupContainer}>
        <View style={styles.groupPhoto}>
          <Image
            source={item.photoUrl ? { uri: item.photoUrl } : require('../../../assets/images/abstract.avif')}
            style={styles.groupImage}
          />
        </View>
        <View style={styles.groupDetails}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupDescription}>{item.description || 'No description'}</Text>
          <View style={styles.groupFooter}>
            <Text style={styles.memberCount}>{item.memberCount} members</Text>
            {item.memberStatus === 'pending' && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>Invitation</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCreateGroupButton = () => (
    <TouchableOpacity
      style={styles.createGroupButton}
      onPress={() => setCreateModalVisible(true)}
    >
      <Text style={styles.createGroupText}>Create a Group</Text>
      <Icon name="plus-circle" size={24} color="#007bff" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[globalStyles.safeArea, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007bff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.header}>
        <Image 
          source={
            userData.photoUrl 
              ? { uri: userData.photoUrl } 
              : require('../../../assets/images/profile-img.jpg')
          } 
          style={styles.avatar} 
        />
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>{userData.greeting}</Text>
          <Text style={styles.userName}>{userData.name}</Text>
        </View>
        <View style={styles.icons}>
          <TouchableOpacity>
            <Icon name="bell-o" size={24} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      <TextInput 
        style={styles.searchBar} 
        placeholder="People, Groups, Events ..." 
      />

      <View style={styles.groupsHeader}>
        <Text style={styles.groupsTitle}>My Groups</Text>
      </View>

      {groups.length > 0 ? (
        <FlatList
          data={groups}
          renderItem={renderGroupItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.groupsList}
        />
      ) : (
        <View style={styles.noGroupsContainer}>
          <Text style={styles.noGroupsText}>You don't have any groups yet</Text>
          {renderCreateGroupButton()}
        </View>
      )}

      {groups.length > 0 && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setCreateModalVisible(true)}
        >
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Create Group Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create a New Group</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Icon name="times" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Group Name"
              value={groupName}
              onChangeText={setGroupName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Group Description (optional)"
              value={groupDescription}
              onChangeText={setGroupDescription}
              multiline
            />
            
            <TextInput
              style={[styles.input, styles.emailInput]}
              placeholder="Friend Emails (comma separated)"
              value={friendEmails}
              onChangeText={setFriendEmails}
              multiline
              autoCapitalize="none"
              keyboardType="email-address"
            />
            
            <Text style={styles.emailHelper}>
              Add multiple friends by separating their emails with commas
            </Text>
            
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateGroup}
              disabled={createLoading}
            >
              {createLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.createButtonText}>Create Group</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  greeting: {
    flex: 1,
    marginLeft: 10,
  },
  greetingText: {
    fontSize: 14,
    color: '#888',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginLeft: 16,
    color: '#000',
  },
  searchBar: {
    margin: 16,
    padding: 12,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  groupsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  groupsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  groupsList: {
    paddingHorizontal: 16,
  },
  groupItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  groupContainer: {
    flexDirection: 'row',
  },
  groupPhoto: {
    marginRight: 12,
  },
  groupImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  groupDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  groupDescription: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  memberCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  noGroupsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  noGroupsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  createGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007bff',
  },
  createGroupText: {
    color: '#007bff',
    fontWeight: 'bold',
    marginRight: 8,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  emailInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  emailHelper: {
    fontSize: 12,
    color: '#888',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});