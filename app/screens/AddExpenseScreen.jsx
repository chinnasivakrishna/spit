import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Switch, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { globalStyles } from '../styles/GlobalStyles'
import Icon from 'react-native-vector-icons/FontAwesome'
import DateTimePicker from '@react-native-community/datetimepicker'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router, useLocalSearchParams } from 'expo-router'

const API_URL = 'https://googlesingin.onrender.com/api';

const CATEGORIES = [
  { id: 'food', name: 'Food', icon: 'cutlery' },
  { id: 'transportation', name: 'Transportation', icon: 'car' },
  { id: 'entertainment', name: 'Entertainment', icon: 'film' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping-cart' },
  { id: 'utilities', name: 'Utilities', icon: 'bolt' },
  { id: 'housing', name: 'Housing', icon: 'home' },
  { id: 'health', name: 'Health', icon: 'medkit' },
  { id: 'other', name: 'Other', icon: 'ellipsis-h' }
];

const AddExpenseScreen = () => {
  const params = useLocalSearchParams();
  const groupId = params.groupId;
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectAll, setSelectAll] = useState(true);
  const [splitAmount, setSplitAmount] = useState(0);

  useEffect(() => {
    if (groupId) {
      fetchGroupMembers();
    } else {
      Alert.alert('Error', 'Invalid group ID');
      router.back();
    }
  }, [groupId]);

  useEffect(() => {
    // Calculate split amount whenever amount or selected members change
    calculateSplitAmount();
  }, [amount, members]);

  const calculateSplitAmount = () => {
    const totalAmount = parseFloat(amount) || 0;
    const selectedMembersCount = members.filter(member => member.selected).length;
    
    if (selectedMembersCount > 0 && totalAmount > 0) {
      setSplitAmount(totalAmount / selectedMembersCount);
    } else {
      setSplitAmount(0);
    }
  };

  const fetchGroupMembers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        router.replace('/');
        return;
      }
      
      const response = await axios.get(`${API_URL}/dashboard/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Create a list of members including the admin
        const admin = {
          ...response.data.group.admin,
          selected: true
        };
        
        const activeMembers = response.data.group.members
          .filter(member => member.status === 'active')
          .map(member => ({
            ...member,
            selected: true
          }));
        
        setMembers([admin, ...activeMembers]);
      } else {
        Alert.alert('Error', response.data.message || 'Could not load group details');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching group members:', error);
      Alert.alert('Error', 'Failed to load group members');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    // Update all members' selected state
    setMembers(members.map(member => ({
      ...member,
      selected: newSelectAll
    })));
  };

  const toggleMemberSelection = (memberId) => {
    const updatedMembers = members.map(member => 
      member._id === memberId
        ? { ...member, selected: !member.selected }
        : member
    );
    
    setMembers(updatedMembers);
    
    // Update selectAll based on whether all members are selected
    const allSelected = updatedMembers.every(member => member.selected);
    setSelectAll(allSelected);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    const selectedMembers = members.filter(member => member.selected);
    if (selectedMembers.length === 0) {
      Alert.alert('Error', 'Please select at least one member to split with');
      return;
    }
    
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        router.replace('/');
        return;
      }
      
      const expenseData = {
        description: description.trim(),
        amount: parseFloat(amount),
        splitAmong: selectedMembers.map(member => member._id),
        category,
        notes: notes.trim(),
        date
      };
      
      const response = await axios.post(
        `${API_URL}/dashboard/groups/${groupId}/expenses`, 
        expenseData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        Alert.alert('Success', 'Expense added successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to add expense');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (value) => {
    return value.toFixed(2);
  };

  if (loading && members.length === 0) {
    return (
      <SafeAreaView style={[globalStyles.safeArea, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007bff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Expense</Text>
        <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Expense Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="What was this expense for?"
              value={description}
              onChangeText={setDescription}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(date)}</Text>
              <Icon name="calendar" size={18} color="#007bff" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryItem,
                    category === cat.id && styles.categoryItemSelected
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Icon
                    name={cat.icon}
                    size={16}
                    color={category === cat.id ? '#fff' : '#007bff'}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat.id && styles.categoryTextSelected
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Add any additional details..."
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
        </View>
        
        <View style={styles.formSection}>
          <View style={styles.splitHeader}>
            <Text style={styles.sectionTitle}>Split Among</Text>
            <View style={styles.splitInfoContainer}>
              {parseFloat(amount) > 0 && (
                <Text style={styles.splitInfo}>
                  Each pays: <Text style={styles.splitAmount}>${formatCurrency(splitAmount)}</Text>
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.selectAllContainer}>
            <Text style={styles.selectAllText}>Select All</Text>
            <Switch
              value={selectAll}
              onValueChange={toggleSelectAll}
              trackColor={{ false: '#d1d1d1', true: '#aed6f1' }}
              thumbColor={selectAll ? '#007bff' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.membersContainer}>
            {members.map((member) => (
              <View key={member._id} style={styles.memberItem}>
                <View style={styles.memberInfo}>
                  {member.photoUrl ? (
                    <Image source={{ uri: member.photoUrl }} style={styles.memberAvatar} />
                  ) : (
                    <View style={styles.memberInitial}>
                      <Text style={styles.initialText}>{member.name.charAt(0)}</Text>
                    </View>
                  )}
                  <Text style={styles.memberName}>{member.name}</Text>
                </View>
                <Switch
                  value={member.selected}
                  onValueChange={() => toggleMemberSelection(member._id)}
                  trackColor={{ false: '#d1d1d1', true: '#aed6f1' }}
                  thumbColor={member.selected ? '#007bff' : '#f4f3f4'}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddExpenseScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  formSection: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    fontSize: 16,
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryItemSelected: {
    backgroundColor: '#007bff',
  },
  categoryText: {
    marginLeft: 6,
    color: '#007bff',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  splitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  splitInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  splitInfo: {
    fontSize: 14,
    color: '#666',
  },
  splitAmount: {
    fontWeight: 'bold',
    color: '#007bff',
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 12,
  },
  selectAllText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  membersContainer: {
    marginTop: 4,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  memberInitial: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  initialText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberName: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});