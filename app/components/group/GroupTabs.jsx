import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

const GroupTabs = ({ activeTab, setActiveTab }) => {
  return (
    <View style={styles.tabsContainer}>
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'members' && styles.activeTabButton]} 
        onPress={() => setActiveTab('members')}
      >
        <Text style={[styles.tabButtonText, activeTab === 'members' && styles.activeTabText]}>Members</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'expenses' && styles.activeTabButton]} 
        onPress={() => setActiveTab('expenses')}
      >
        <Text style={[styles.tabButtonText, activeTab === 'expenses' && styles.activeTabText]}>Expenses</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'balances' && styles.activeTabButton]} 
        onPress={() => setActiveTab('balances')}
      >
        <Text style={[styles.tabButtonText, activeTab === 'balances' && styles.activeTabText]}>Balances</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007bff',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  activeTabText: {
    color: '#007bff',
  },
};

export default GroupTabs;