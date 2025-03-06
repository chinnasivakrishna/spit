import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, FlatList, Alert, ScrollView, TouchableOpacity, Image, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/GlobalStyles';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';

import GroupHeader from '../components/group/GroupHeader';
import GroupTabs from '../components/group/GroupTabs';
import ExpenseList from '../components/group/ExpenseList';
import BalanceList from '../components/group/BalanceList';
import ExpenseModal from '../components/group/ExpenseModal';
import InviteModal from '../components/group/InviteModal';

const API_URL = 'https://googlesingin.onrender.com/api';

const GroupDetailScreen = () => {
  const params = useLocalSearchParams();
  const id = params.id;
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses');
  const [balances, setBalances] = useState([]);
  const [loadingBalances, setLoadingBalances] = useState(false);

  // Expense modal states
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Other');
  const [expenseNotes, setExpenseNotes] = useState('');
  const [splitSelected, setSplitSelected] = useState([]);
  const [splitAll, setSplitAll] = useState(true);
  const [addingExpense, setAddingExpense] = useState(false);

  // Invite modal states
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitingMember, setInvitingMember] = useState(false);

  useEffect(() => {
    if (id) {
      console.log('Group ID:', id);
      fetchGroupDetails();
      fetchExpenses();
    } else {
      console.error('No group ID provided');
      Alert.alert('Error', 'Invalid group ID');
      router.back();
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === 'balances') {
      fetchBalances();
    }
  }, [activeTab]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        router.replace('/');
        return;
      }
      
      console.log(`Fetching group details for ID: ${id}`);
      
      const response = await axios.get(`${API_URL}/dashboard/groups/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setGroup(response.data.group);
      } else {
        Alert.alert('Error', response.data.message || 'Could not load group details');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
      Alert.alert('Error', 'Failed to load group details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoadingExpenses(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        router.replace('/');
        return;
      }
      
      const response = await axios.get(`${API_URL}/dashboard/groups/${id}/expenses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setExpenses(response.data.expenses);
      } else {
        console.error('Failed to load expenses:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoadingExpenses(false);
    }
  };

  const fetchBalances = async () => {
    try {
      setLoadingBalances(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        router.replace('/');
        return;
      }
      
      const response = await axios.get(`${API_URL}/dashboard/groups/${id}/balances`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setBalances(response.data.balances);
      } else {
        console.error('Failed to load balances:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setLoadingBalances(false);
    }
  };

  const addExpense = async () => {
    if (!expenseDescription.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    
    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    try {
      setAddingExpense(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        router.replace('/');
        return;
      }
      
      let splitAmong = [];
      if (!splitAll) {
        splitAmong = splitSelected;
      } else if (group) {
        splitAmong = [group.admin._id];
        group.members.forEach(member => {
          if (member.status === 'active') {
            splitAmong.push(member._id);
          }
        });
      }
      
      const response = await axios.post(
        `${API_URL}/dashboard/groups/${id}/expenses`,
        {
          description: expenseDescription,
          amount: amount,
          splitAmong: splitAmong,
          category: expenseCategory,
          notes: expenseNotes,
          date: new Date()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        Alert.alert('Success', 'Expense added successfully');
        setExpenseModalVisible(false);
        clearExpenseForm();
        fetchExpenses();
        if (activeTab === 'balances') {
          fetchBalances();
        }
      } else {
        Alert.alert('Error', response.data.message || 'Failed to add expense');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to add expense');
    } finally {
      setAddingExpense(false);
    }
  };

  const clearExpenseForm = () => {
    setExpenseDescription('');
    setExpenseAmount('');
    setExpenseCategory('Other');
    setExpenseNotes('');
    setSplitSelected([]);
    setSplitAll(true);
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    try {
      setInvitingMember(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        router.replace('/');
        return;
      }
      
      const response = await axios.post(
        `${API_URL}/dashboard/groups/${id}/invite`,
        {
          email: inviteEmail.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        Alert.alert('Success', 'Invitation sent successfully');
        setInviteModalVisible(false);
        setInviteEmail('');
        fetchGroupDetails();
      } else {
        Alert.alert('Error', response.data.message || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error inviting member:', error);
      Alert.alert('Error', 'Failed to send invitation');
    } finally {
      setInvitingMember(false);
    }
  };

  const toggleMemberSelection = (memberId) => {
    if (splitSelected.includes(memberId)) {
      setSplitSelected(splitSelected.filter(id => id !== memberId));
    } else {
      setSplitSelected([...splitSelected, memberId]);
    }
  };

  const markExpensePaid = async (expenseId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        router.replace('/');
        return;
      }
      
      const response = await axios.post(
        `${API_URL}/dashboard/groups/${id}/expenses/${expenseId}/settle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        Alert.alert('Success', 'Expense marked as paid');
        fetchExpenses();
        if (activeTab === 'balances') {
          fetchBalances();
        }
      } else {
        Alert.alert('Error', response.data.message || 'Failed to mark expense as paid');
      }
    } catch (error) {
      console.error('Error marking expense as paid:', error);
      Alert.alert('Error', 'Failed to mark expense as paid');
    }
  };

  const allGroupMembers = group ? [
    {
      _id: group.admin._id,
      name: group.admin.name,
      email: group.admin.email,
      photoUrl: group.admin.photoUrl,
      isAdmin: true,
      isActive: true
    },
    ...group.members.map(member => ({
      _id: member._id,
      name: member.name,
      email: member.email,
      photoUrl: member.photoUrl,
      status: member.status,
      isActive: member.status === 'active'
    }))
  ] : [];
  
  if (loading) {
    return (
      <SafeAreaView style={[globalStyles.safeArea, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007bff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <GroupHeader group={group} />

      <View style={styles.groupInfo}>
        <Image 
          source={group?.photoUrl ? { uri: group.photoUrl } : require('../../assets/images/abstract.avif')} 
          style={styles.groupImage} 
        />
        <View style={styles.groupDetails}>
          <Text style={styles.groupName}>{group?.name}</Text>
          <Text style={styles.groupDescription}>{group?.description || 'No description'}</Text>
          <View style={styles.adminInfo}>
            <Text style={styles.adminLabel}>Admin: </Text>
            <Text style={styles.adminName}>{group?.admin?.name}</Text>
          </View>
          <Text style={styles.memberCount}>{group?.members?.length || 0} members</Text>
        </View>
      </View>

      <GroupTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'members' && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Members</Text>
            {group?.isAdmin && (
              <TouchableOpacity 
                style={styles.inviteButton}
                onPress={() => setInviteModalVisible(true)}
              >
                <Icon name="user-plus" size={16} color="#007bff" />
                <Text style={styles.inviteText}>Invite</Text>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={group?.members || []}
            renderItem={({ item }) => (
              <View style={styles.memberItem}>
                <Image 
                  source={item.photoUrl ? { uri: item.photoUrl } : require('../../assets/images/profile-img.jpg')} 
                  style={styles.memberAvatar} 
                />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{item.name}</Text>
                  <Text style={styles.memberEmail}>{item.email}</Text>
                </View>
                <View style={styles.memberStatus}>
                  <Text style={[styles.statusText, { color: item.status === 'active' ? '#4CAF50' : '#FFC107' }]}>
                    {item.status === 'active' ? 'Active' : 'Pending'}
                  </Text>
                </View>
              </View>
            )}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.membersList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No members yet</Text>
              </View>
            }
          />
        </View>
      )}

      {activeTab === 'expenses' && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Expenses</Text>
            <TouchableOpacity 
              style={styles.addExpenseButton}
              onPress={() => setExpenseModalVisible(true)}
            >
              <Icon name="plus-circle" size={16} color="#007bff" />
              <Text style={styles.addExpenseText}>Add Expense</Text>
            </TouchableOpacity>
          </View>

          <ExpenseList 
            expenses={expenses} 
            loadingExpenses={loadingExpenses} 
            markExpensePaid={markExpensePaid} 
          />
        </View>
      )}

      {activeTab === 'balances' && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Balances</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={fetchBalances}
              disabled={loadingBalances}
            >
              <Icon name="refresh" size={16} color="#007bff" />
              {!loadingBalances && <Text style={styles.refreshText}>Refresh</Text>}
            </TouchableOpacity>
          </View>

          <BalanceList 
            balances={balances} 
            loadingBalances={loadingBalances} 
          />
        </View>
      )}

      <ExpenseModal
        visible={expenseModalVisible}
        onClose={() => {
          setExpenseModalVisible(false);
          clearExpenseForm();
        }}
        expenseDescription={expenseDescription}
        setExpenseDescription={setExpenseDescription}
        expenseAmount={expenseAmount}
        setExpenseAmount={setExpenseAmount}
        expenseCategory={expenseCategory}
        setExpenseCategory={setExpenseCategory}
        expenseNotes={expenseNotes}
        setExpenseNotes={setExpenseNotes}
        splitAll={splitAll}
        setSplitAll={setSplitAll}
        splitSelected={splitSelected}
        toggleMemberSelection={toggleMemberSelection}
        allGroupMembers={allGroupMembers}
        addingExpense={addingExpense}
        addExpense={addExpense}
      />

      <InviteModal
        visible={inviteModalVisible}
        onClose={() => {
          setInviteModalVisible(false);
          setInviteEmail('');
        }}
        inviteEmail={inviteEmail}
        setInviteEmail={setInviteEmail}
        invitingMember={invitingMember}
        inviteMember={inviteMember}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  groupInfo: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  groupImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  groupDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  adminLabel: {
    fontSize: 14,
    color: '#666',
  },
  adminName: {
    fontSize: 14,
    fontWeight: '500',
  },
  memberCount: {
    fontSize: 14,
    color: '#666',
  },
  sectionContainer: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  inviteText: {
    marginLeft: 4,
    color: '#007bff',
    fontWeight: '500',
  },
  addExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  addExpenseText: {
    marginLeft: 4,
    color: '#007bff',
    fontWeight: '500',
  },
  membersList: {
    paddingHorizontal: 16,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
  },
  memberStatus: {
    paddingHorizontal: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  refreshText: {
    marginLeft: 4,
    color: '#007bff',
    fontWeight: '500',
  },
});

export default GroupDetailScreen;